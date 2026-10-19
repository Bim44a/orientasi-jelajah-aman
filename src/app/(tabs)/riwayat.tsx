// src/app/(tabs)/riwayat.tsx
import { useState, useCallback } from "react";
import { View, Text, Button, Alert, ScrollView, TouchableOpacity } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { daftarRiwayatPencarian, hapusCacheItem } from "../../services/cacheRepository";
import { KotaFavorit } from "../../../types/favorit";
import { RingkasanKotaTersimpan } from "../../../types/cache";

export default function TabRiwayat() {
    const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
    const [riwayatPencarian, setRiwayatPencarian] = useState<RingkasanKotaTersimpan[]>([]);
    const router = useRouter();

    const muatData = useCallback(() => {
        ambilSemuaFavorit().then(setDaftarFavorit);
        daftarRiwayatPencarian().then(setRiwayatPencarian).catch(() => setRiwayatPencarian([]));
    }, []);

    useFocusEffect(
        useCallback(() => {
            muatData();
        }, [muatData])
    );

    // Konfirmasi hapus favorit
    async function konfirmasiDanHapus(id: number, namaKota: string) {
        Alert.alert(
            "Konfirmasi Hapus",
            `Yakin hapus ${namaKota} dari favorit?`,
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: async () => {
                        await hapusFavorit(id);
                        setDaftarFavorit((prev) => prev.filter((k) => k.id !== id));
                    },
                },
            ],
            { cancelable: true }
        );
    }

    // Konfirmasi dan hapus cache item riwayat
    async function konfirmasiHapusCache(kunci: string, namaKota: string) {
        Alert.alert(
            "Hapus Cache Kota",
            `Apakah Anda yakin ingin menghapus data cache untuk kota ${namaKota}?`,
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await hapusCacheItem(kunci);
                            muatData(); // Muat ulang daftar setelah dihapus
                        } catch (error) {
                            console.error("Gagal menghapus cache item:", error);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: "#F8FAFC" }}>
            <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
                
                {/* Riwayat Pencarian Terakhir */}
                <View>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: "#0B2545", marginBottom: 4 }}>
                        Riwayat Pencarian Terakhir
                    </Text>
                    <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>
                        Maksimal 10 pencarian kota terakhir. Ketuk untuk melihat cuaca atau hapus cache.
                    </Text>

                    {riwayatPencarian.length === 0 ? (
                        <Text style={{ color: "#94A3B8", fontStyle: "italic" }}>Belum ada riwayat pencarian.</Text>
                    ) : (
                        riwayatPencarian.map((item) => (
                            <View
                                key={item.kunci}
                                style={{
                                    backgroundColor: "#FFFFFF",
                                    padding: 12,
                                    borderRadius: 8,
                                    marginBottom: 6,
                                    borderWidth: 1,
                                    borderColor: "#E2E8F0",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <TouchableOpacity
                                    style={{ flex: 1 }}
                                    onPress={() => {
                                        router.push({
                                            pathname: "/(tabs)",
                                            params: {
                                                lat: String(item.latitude),
                                                lon: String(item.longitude),
                                                nama: item.nama,
                                            },
                                        });
                                    }}
                                >
                                    <Text style={{ fontSize: 15, fontWeight: "600", color: "#1E293B" }}>{item.nama}</Text>
                                    <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                                        Disimpan: {new Date(item.disimpanPada).toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>

                                {/* Tombol Hapus Cache per Item dengan Alert */}
                                <Button
                                    title="Hapus"
                                    color="#DC2626"
                                    onPress={() => konfirmasiHapusCache(item.kunci, item.nama)}
                                />
                            </View>
                        ))
                    )}
                </View>

                {/* Kota Favorit  */}
                <View style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: "#0B2545", marginBottom: 4 }}>
                        Kota Favorit
                    </Text>
                    <Text style={{ color: "#666", marginBottom: 8 }}>
                        Tersimpan {daftarFavorit.length} kota
                    </Text>

                    {daftarFavorit.length === 0 && <Text style={{ color: "#94A3B8", fontStyle: "italic" }}>Belum ada kota favorit</Text>}

                    {daftarFavorit.map((kota) => (
                        <View
                            key={kota.id}
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: "#FFFFFF",
                                padding: 12,
                                borderRadius: 8,
                                marginBottom: 6,
                                borderWidth: 1,
                                borderColor: "#E2E8F0",
                            }}
                        >
                            <Text style={{ fontSize: 15, fontWeight: "500", color: "#1E293B" }}>{kota.nama}</Text>
                            <Button title="Hapus" onPress={() => konfirmasiDanHapus(kota.id, kota.nama)} />
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}