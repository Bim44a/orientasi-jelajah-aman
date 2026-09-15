import { View, Text } from "react-native";
import { LaporanUdara } from "../../types/cuaca";

export default function IndikatorAQI({
    kota,
    indeksAQI,
    tingkat,
    diperbaruiPada,
}: LaporanUdara) {
    const warna =
        tingkat === "BAIK"
            ? "green"
            : tingkat === "SEDANG"
                ? "orange"
                : tingkat === "TIDAK_SEHAT"
                    ? "red"
                    : "darkred";

    return (
        <View style={{ padding: 16, borderRadius: 8 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                {kota}
            </Text>

            <Text style={{ fontSize: 32 }}>
                AQI: {indeksAQI}
            </Text>

            <Text style={{ color: warna, fontWeight: "bold" }}>
                {tingkat}
            </Text>

            {diperbaruiPada && (
                <Text>Diperbarui: {diperbaruiPada}</Text>
            )}
        </View>
    );
}