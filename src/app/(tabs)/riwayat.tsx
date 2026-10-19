// src/app/(tabs)/riwayat.tsx
import { useState, useCallback } from "react";
import { View, Text, Button, Alert, ScrollView, TouchableOpacity } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { daftarRiwayatPencarian } from "../../services/cacheRepository";
import { KotaFavorit } from "../../../types/favorit";
import { RingkasanKotaTersimpan } from "../../../types/cache";

export default function TabRiwayat() {
    const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
    const [riwayatPencarian, setRiwayatPencarian] = useState<RingkasanKotaTersimpan[]>([]);
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            // Memuat data Favorit dari AsyncStorage
            ambilSemuaFavorit().then(setDaftarFavorit);
            // Memuat data Riwayat Pencarian terakhir (maks 10) dari SQLite (Tugas 2 UTS)
            daftarRiwayatPencarian().then(setRiwayatPencarian).catch(() => setRiwayatPencarian([]));
        }, [])
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

    return (
        <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: "#F8FAFC" }}>
            <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>

                {/* Bagian 1: Riwayat Pencarian Terakhir (Tugas 2 UTS) */}
                <View>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: "#0B2545", marginBottom: 4 }}>
                        Riwayat Pencarian Terakhir
                    </Text>
                    <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>
                        Maksimal 10 pencarian kota terakhir. Ketuk untuk melihat cuaca.
                    </Text>

                    {riwayatPencarian.length === 0 ? (
                        <Text style={{ color: "#94A3B8", fontStyle: "italic" }}>Belum ada riwayat pencarian.</Text>
                    ) : (
                        riwayatPencarian.map((item) => (
                            <TouchableOpacity
                                key={item.kunci}
                                style={{
                                    backgroundColor: "#FFFFFF",
                                    padding: 12,
                                    borderRadius: 8,
                                    marginBottom: 6,
                                    borderWidth: 1,
                                    borderColor: "#E2E8F0",
                                }}
                                onPress={() => {
                                    // Ketika item riwayat diklik, otomatis memunculkan pencarian kota tersebut di Beranda
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
                        ))
                    )}
                </View>

                {/* Bagian 2: Kota Favorit (Asli Pertemuan 6) */}
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