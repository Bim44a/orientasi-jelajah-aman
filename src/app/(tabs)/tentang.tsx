// app/(tabs)/tentang.tsx
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typeScale, spacing } from "../../constants/styles";

export default function TabTentang() {
    return (
        <SafeAreaView style={{ padding: spacing.sedang }}>
            <Text
                accessible
                accessibilityLabel="Halaman Tentang Aplikasi Jelajah Aman"
                style={{ fontSize: typeScale.judul, fontWeight: "bold", marginBottom: spacing.kecil }}
            >
                Tentang Aplikasi
            </Text>
            <Text style={{ fontSize: typeScale.isi, marginBottom: spacing.kecil }}>
                Nama Aplikasi: Jelajah Aman
            </Text>
            <Text style={{ fontSize: typeScale.isi, marginBottom: spacing.kecil }}>
                Versi: 1.0.0
            </Text>
            <Text style={{ fontSize: typeScale.isi }}>
                Pembuat: Bima Adi Nugroho
            </Text>
        </SafeAreaView>
    );
}