// src/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { DeviceEventEmitter } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
    const [isDark, setIsDark] = useState(false);

    // Memuat status tema saat pertama kali render
    useEffect(() => {
        AsyncStorage.getItem("user_theme")
            .then((savedTheme) => {
                setIsDark(savedTheme === "gelap");
            })
            .catch(() => { });

        // Mendengarkan sinyal perubahan tema dari menu pengaturan secara real-time
        const subscription = DeviceEventEmitter.addListener("themeChanged", (newTheme) => {
            setIsDark(newTheme === "gelap");
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <Tabs
            screenOptions={{
                headerShown: false, //Header, jika ingin ditampilkan ubah menjadi true
                tabBarActiveTintColor: isDark ? "#38BDF8" : "#2563EB",
                tabBarInactiveTintColor: isDark ? "#94A3B8" : "#666666",
                tabBarStyle: {
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    borderTopColor: isDark ? "#1E293B" : "#E2E8F0",
                    borderTopWidth: 1,
                },
                headerStyle: {
                    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                },
                headerTintColor: isDark ? "#F8FAFC" : "#0B2545",
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Beranda",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="riwayat"
                options={{
                    title: "Riwayat",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="time" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pengaturan"
                options={{
                    title: "Pengaturan",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="tentang"
                options={{
                    title: "Tentang",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="information-circle" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
