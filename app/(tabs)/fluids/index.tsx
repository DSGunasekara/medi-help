// IntakeScreen.tsx
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { Button } from "~/components/ui/button";
import { useSQLiteContext } from "expo-sqlite";

const screenWidth = Dimensions.get("window").width;

type WaterIntake = {
  id: number;
  amount: number;
  timestamp: string;
};

export default function IntakeScreen() {
  const db = useSQLiteContext();
  const chartRef = useRef(null);
  const [data, setData] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [hasData, setHasData] = useState(true);

  const generatePDF = async () => {
    try {
      const chartUri = await captureRef(chartRef, {
        format: "png",
        quality: 1,
      });

      const html = `
      <html>
        <body style="font-family: sans-serif;">
          <h1>Fluid Intake Report</h1>
          <p>Date: ${selectedDate}</p>
          <img src="${chartUri}" width="100%" />
        </body>
      </html>`;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  const router = useRouter();

  const onDayPress = async (day: any) => {
    const date = new Date(day.dateString);
    setSelectedDate(date.toDateString());

    const dateStr = date.toISOString().split("T")[0];
    const result = await db.getAllAsync<WaterIntake>(
      "SELECT * FROM water_intake WHERE date(timestamp) = ?",
      dateStr
    );

    const slotSums = [0, 0, 0, 0, 0, 0];
    const slots = [8, 10, 12, 14, 16, 18];

    if (result.length === 0) {
      setHasData(false);
      setData([0, 0, 0, 0, 0, 0]);
      return;
    }

    setHasData(true);

    result.forEach((entry) => {
      const hour = new Date(entry.timestamp).getHours();
      const index = slots.findIndex((slot) => hour >= slot && hour < slot + 2);
      if (index !== -1) {
        const numericAmount = parseFloat(entry.amount as any);
        if (!isNaN(numericAmount)) {
          slotSums[index] += numericAmount;
        }
      }
    });

    setData([...slotSums]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Fluid Tracker</Text>
      <View style={styles.iconContainer}></View>

      <Calendar
        onDayPress={onDayPress}
        markedDates={{
          "2025-04-14": { marked: true, dotColor: "blue" },
          "2025-04-15": { marked: true, dotColor: "green" },
        }}
      />

      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 20, marginBottom: 10 }}>Fluid intake on {selectedDate}</Text>

        {!hasData ? (
          <Text style={{ fontSize: 16, color: "gray", textAlign: "center" }}>No data found for this day.</Text>
        ) : (
          <View ref={chartRef} style={{ height: 200, flexDirection: "row" }} collapsable={false}>
            <LineChart
              data={{
                labels: ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM"],
                datasets: [
                  {
                    data: data.map((value) => Number.isFinite(value) ? value : 0),
                  },
                ],
              }}
              width={screenWidth - 32}
              height={200}
              chartConfig={{
                backgroundColor: "#e26a00",
                backgroundGradientFrom: "#fb8c00",
                backgroundGradientTo: "#ffa726",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#ffa726",
                },
              }}
            />
          </View>
        )}

        <View style={{ marginTop: 24 }}>
          <Button onPress={generatePDF}>
            <Text>Download Report</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2196F3",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});