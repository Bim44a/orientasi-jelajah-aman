import { View, Text } from "react-native";
import { LaporanUdara } from "../../types/cuaca";

export default function IndikatorAQI({
    kota,
    indeksAQI,
    tingkat,
    diperbaruiPada,
}: LaporanUdara) {
    const warnaAQI =
        tingkat === "BAIK"
            ? "green"
            : tingkat === "SEDANG"
                ? "orange"
                : tingkat === "TIDAK_SEHAT"
                    ? "red"
                    : "darkred";

    return (
        <View
            style={{
                padding: 16,
                borderRadius: 8,
                backgroundColor: "#F4F7FA",
            }}
        >
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                {kota}
            </Text>

            <Text style={{ fontSize: 32 }}>
                AQI: {indeksAQI}
            </Text>

            <Text style={{ color: warnaAQI }}>
                Tingkat: {tingkat}
            </Text>

            {diperbaruiPada && (
                <Text>
                    Diperbarui: {diperbaruiPada}
                </Text>
            )}
        </View>
    );
}