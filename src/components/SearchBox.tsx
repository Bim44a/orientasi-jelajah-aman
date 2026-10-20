// src/components/SearchBox.tsx
import { useState } from "react";
import { View, TextInput } from "react-native";

interface SearchBoxProps {
    onCari: (teks: string) => void;
    isDark?: boolean; // Ditambahkan untuk mendeteksi mode gelap
}

export default function SearchBox({ onCari, isDark = false }: SearchBoxProps) {
    const [teks, setTeks] = useState("");

    function handleChange(nilaiBaru: string) {
        setTeks(nilaiBaru);
        onCari(nilaiBaru); // kirim setiap perubahan, debounce diatur di pemanggilnya
    }

    return (
        <View>
            <TextInput
                placeholder="Cari nama kota..."
                placeholderTextColor={isDark ? "#94A3B8" : "#9ca3af"}
                value={teks}
                onChangeText={handleChange}
                accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
                style={{
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 8,
                    // Diubah secara dinamis sesuai mode terang/gelap
                    backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                    borderColor: isDark ? "#334155" : "#D1D5DB",
                    color: isDark ? "#F8FAFC" : "#1F2937",
                }}
            />
        </View>
    );
}
