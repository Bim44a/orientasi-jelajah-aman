// app/(tabs)/pengaturan.tsx
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";

export default function TabPengaturan() {
    return (
        <SafeAreaView style={{ padding: 16 }}>
            <View>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>Jelajah Aman</Text>
                <Text>Versi 1.0.0</Text>
            </View>
        </SafeAreaView>
    );
}
