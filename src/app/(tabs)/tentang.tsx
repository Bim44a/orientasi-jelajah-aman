// app/(tabs)/tentang.tsx
import { useState, useEffect, useCallback } from "react";
import { Text, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { typeScale, spacing } from "../../constants/styles";

export default function TabTentang() {
    const [isDark, setIsDark] = useState(false);

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

    return (
        <SafeAreaView style={{ flex: 1, padding: spacing.sedang, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
            <Text
                accessible
                accessibilityLabel="Halaman Tentang Aplikasi Jelajah Aman"
                style={{ fontSize: typeScale.judul, fontWeight: "bold", marginBottom: spacing.kecil, color: isDark ? "#F8FAFC" : "#0B2545" }}
            >
                Tentang Aplikasi
            </Text>
            <Text style={{ fontSize: typeScale.isi, marginBottom: spacing.kecil, color: isDark ? "#94A3B8" : "#1E293B" }}>
                Nama Aplikasi: Jelajah Aman
            </Text>
            <Text style={{ fontSize: typeScale.isi, marginBottom: spacing.kecil, color: isDark ? "#94A3B8" : "#1E293B" }}>
                Versi: 1.0.0
            </Text>
            <Text style={{ fontSize: typeScale.isi, color: isDark ? "#94A3B8" : "#1E293B" }}>
                Pembuat: Bima Adi Nugroho
            </Text>
        </SafeAreaView>
    );
}