// src/app/(tabs)/pengaturan.tsx
import { useState, useCallback } from "react";
import { Text, Button, View, StyleSheet, TouchableOpacity, Alert, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { hapusSemuaCache } from "../../services/cacheRepository";

export default function TabPengaturan() {
    const [pesan, setPesan] = useState<string | null>(null);
    const [tema, setTema] = useState<string>("terang");

    useFocusEffect(
        useCallback(() => {
            AsyncStorage.getItem("user_theme").then((savedTheme) => {
                if (savedTheme) setTema(savedTheme);
            }).catch(() => { });
        }, [])
    );

    async function ubahTema(pilihanTema: string) {
        setTema(pilihanTema);
        await AsyncStorage.setItem("user_theme", pilihanTema);

        // Memancarkan sinyal ke seluruh aplikasi bahwa tema telah berubah
        DeviceEventEmitter.emit("themeChanged", pilihanTema);

        setPesan(`Mode tampilan berhasil diubah ke: ${pilihanTema.toUpperCase()}`);
    }

    async function hapusDataTersimpan() {
        Alert.alert(
            "Konfirmasi Hapus",
            "Apakah Anda yakin ingin menghapus seluruh cache cuaca tersimpan?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: async () => {
                        await hapusSemuaCache();
                        setPesan("Data cuaca tersimpan sudah dihapus.");
                    },
                },
            ]
        );
    }

    const isDark = tema === "gelap";

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
            <View style={styles.headerBox}>
                <Text style={[styles.title, { color: isDark ? "#F8FAFC" : "#0B2545" }]}>Jelajah Aman</Text>
                <Text style={[styles.version, { color: isDark ? "#94A3B8" : "#64748B" }]}>Versi 1.0.0</Text>
            </View>

            <View style={[styles.card, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                <Text style={[styles.sectionTitle, { color: isDark ? "#F8FAFC" : "#1E293B" }]}>
                    Mode Tampilan Aplikasi
                </Text>
                <Text style={[styles.sectionSub, { color: isDark ? "#94A3B8" : "#64748B" }]}>
                    Pilih preferensi visual antarmuka sesuai kenyamanan Anda.
                </Text>

                <View style={styles.themeRow}>
                    <TouchableOpacity
                        style={[
                            styles.themeOption,
                            tema === "terang" && styles.activeThemeOption,
                            { backgroundColor: isDark ? "#0F172A" : "#F1F5F9", borderColor: tema === "terang" ? "#2563EB" : "transparent" }
                        ]}
                        onPress={() => ubahTema("terang")}
                    >
                        <Ionicons name="sunny" size={24} color={tema === "terang" ? "#2563EB" : "#64748B"} />
                        <Text style={[styles.themeText, { color: isDark ? "#F8FAFC" : "#1E293B" }]}>Terang</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.themeOption,
                            tema === "gelap" && styles.activeThemeOption,
                            { backgroundColor: isDark ? "#0F172A" : "#F1F5F9", borderColor: tema === "gelap" ? "#2563EB" : "transparent" }
                        ]}
                        onPress={() => ubahTema("gelap")}
                    >
                        <Ionicons name="moon" size={24} color={tema === "gelap" ? "#38BDF8" : "#64748B"} />
                        <Text style={[styles.themeText, { color: isDark ? "#F8FAFC" : "#1E293B" }]}>Gelap</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.themeOption,
                            tema === "sistem" && styles.activeThemeOption,
                            { backgroundColor: isDark ? "#0F172A" : "#F1F5F9", borderColor: tema === "sistem" ? "#2563EB" : "transparent" }
                        ]}
                        onPress={() => ubahTema("sistem")}
                    >
                        <Ionicons name="phone-portrait" size={24} color={tema === "sistem" ? "#2563EB" : "#64748B"} />
                        <Text style={[styles.themeText, { color: isDark ? "#F8FAFC" : "#1E293B" }]}>Sistem</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.card, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                <Text style={[styles.sectionTitle, { color: isDark ? "#F8FAFC" : "#1E293B" }]}>Manajemen Data</Text>
                <View style={{ marginTop: 8 }}>
                    <Button title="Hapus Data Cuaca Tersimpan" onPress={hapusDataTersimpan} />
                </View>
            </View>

            {pesan && (
                <View style={styles.alertBox}>
                    <Text style={{ color: "#0284C7", fontSize: 13, fontWeight: "500" }}>{pesan}</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 16 },
    headerBox: { marginBottom: 4 },
    title: { fontSize: 22, fontWeight: "bold" },
    version: { fontSize: 13, marginTop: 2 },
    card: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: { fontSize: 16, fontWeight: "600" },
    sectionSub: { fontSize: 12, marginTop: -6 },
    themeRow: { flexDirection: "row", gap: 10, marginTop: 4 },
    themeOption: {
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 2,
        gap: 6,
    },
    activeThemeOption: {
        borderColor: "#2563EB",
        backgroundColor: "#EFF6FF",
    },
    themeText: { fontSize: 12, fontWeight: "600" },
    alertBox: {
        padding: 12,
        backgroundColor: "#E0F2FE",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#BAE6FD",
        alignItems: "center",
    },
});