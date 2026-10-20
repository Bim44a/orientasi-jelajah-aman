// src/app/(tabs)/index.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  DeviceEventEmitter,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/StatusData";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { ambilCuacaOfflineFirst, BATAS_CACHE_MS } from "../../services/cuacaRepository";
import { bersihkanCacheLama, daftarKotaTersimpan } from "../../services/cacheRepository";
import { mintaIzinLokasi, ambilKoordinatSaatIni } from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../../types/geocoding";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../../types/cache";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition
  const params = useLocalSearchParams<{ lat?: string; lon?: string; nama?: string }>();

  // Memantau perubahan tema secara real-time dari Pengaturan
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("user_theme")
        .then((savedTheme) => {
          setIsDark(savedTheme === "gelap");
        })
        .catch(() => { });
    }, [])
  );

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener("themeChanged", (newTheme) => {
      setIsDark(newTheme === "gelap");
    });
    return () => {
      subscription.remove();
    };
  }, []);

  // Menangkap klik dari tab Riwayat untuk otomatis memuat kota
  useEffect(() => {
    if (params.lat && params.lon && params.nama) {
      pilihKota({
        id: Date.now(),
        name: params.nama,
        latitude: parseFloat(params.lat),
        longitude: parseFloat(params.lon),
        country: "",
      });
    }
  }, [params.lat, params.lon, params.nama]);

  async function muatKotaTersimpan() {
    setKotaTersimpan(await daftarKotaTersimpan());
  }

  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda).then(setHasilPencarian).catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);
    try {
      const data = await ambilCuacaOfflineFirst(
        { id: kota.id, nama: kota.name, latitude: kota.latitude, longitude: kota.longitude },
        { paksaPerbarui }
      );
      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
      setHasil(data);
      muatKotaTersimpan();
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi."
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();
    if (status === "denied") {
      setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual di atas.");
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi("Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.");
      return;
    }
    setPesanLokasi(null);
    const koordinat = await ambilKoordinatSaatIni();
    pilihKota({
      id: -1,
      name: "Lokasi Saat Ini",
      latitude: koordinat.latitude,
      longitude: koordinat.longitude,
      country: "",
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox onCari={setTeksCari} isDark={isDark} />

        <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />

        {/* --- TAMBAHAN BONUS: Banner Peringatan Dini Cuaca Ekstrem / AQI --- */}
        {hasil && (hasil.kualitasUdara.indeksAQI > 100 || hasil.cuaca.saatIni.kecepatanAngin > 20) && (
          <View style={{
            backgroundColor: isDark ? "#7F1D1D" : "#FEF2F2",
            borderColor: isDark ? "#EF4444" : "#F87171",
            borderWidth: 1,
            padding: 12,
            borderRadius: 8,
            gap: 4
          }}>
            <Text style={{
              color: isDark ? "#FCA5a5" : "#991B1B",
              fontWeight: "bold",
              fontSize: 14
            }}>
              ⚠️ PERINGATAN KONDISI EKSTREM
            </Text>
            <Text style={{
              color: isDark ? "#FEE2E2" : "#7F1D1D",
              fontSize: 12
            }}>
              {hasil.kualitasUdara.indeksAQI > 100 ? "Kualitas udara kurang baik/tidak sehat. " : ""}
              {hasil.cuaca.saatIni.kecepatanAngin > 20 ? "Kecepatan angin cukup tinggi. " : ""}
              Harap berhati-hati saat beraktivitas di luar ruangan demi keselamatan Anda.
            </Text>
          </View>
        )}


        {pesanLokasi && (
          <Text style={{ color: isDark ? "#F8FAFC" : "#0B2545" }} accessibilityLabel={pesanLokasi}>
            {pesanLokasi}
          </Text>
        )}

        {hasilPencarian.map((kota) => (
          <TouchableOpacity key={kota.id} onPress={() => pilihKota(kota)}>
            <Text style={{ color: isDark ? "#38BDF8" : "#000000" }}>{kota.name}</Text>
          </TouchableOpacity>
        ))}

        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "bold", color: isDark ? "#F8FAFC" : "#0B2545" }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>
            {kotaTersimpan.map((k) => (
              <TouchableOpacity
                key={k.kunci}
                onPress={() =>
                  pilihKota({
                    id: k.id,
                    name: k.nama,
                    latitude: k.latitude,
                    longitude: k.longitude,
                    country: "",
                  })
                }
              >
                <Text style={{ color: isDark ? "#F8FAFC" : "#000000" }}>{k.nama}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {sedangMemuat && <ActivityIndicator color={isDark ? "#38BDF8" : "#2563EB"} />}

        {pesanError && (
          <View>
            <Text style={{ color: "#EF4444" }} accessibilityLabel={pesanError}>{pesanError}</Text>
            <Button
              title="Coba Lagi"
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            />
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData sumber={hasil.sumber} disimpanPada={hasil.disimpanPada} />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
            />
            <Text style={{ fontSize: 12, color: isDark ? "#94A3B8" : "#888888" }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)} {"\u2022"} Angin{" "}
              {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>
            <Button
              title="Perbarui Sekarang"
              onPress={() => pilihKota(kotaTerpilih, true)}
            />
            <Button
              title="Tambahkan ke Favorit"
              onPress={() =>
                router.push({
                  pathname: "/tambah-favorit",
                  params: {
                    id: String(kotaTerpilih.id),
                    nama: kotaTerpilih.name,
                    lat: String(kotaTerpilih.latitude),
                    lon: String(kotaTerpilih.longitude),
                  },
                })
              }
            />
          </>
        )}
        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}