import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LineChart } from 'react-native-chart-kit';
import { useSQLiteContext } from 'expo-sqlite';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type WeightEntry = {
  id: number;
  weight: number;
  date: string;
};

export default function WeightScreen() {
  const db = useSQLiteContext();
  const screenWidth = Dimensions.get('window').width;

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);

  useEffect(() => {
    const setup = async () => {
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS weight_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          weight REAL,
          date TEXT UNIQUE
        )
      `);
      fetchWeights();
    };
    setup();
  }, []);

  const fetchWeights = async () => {
    const result = await db.getAllAsync<WeightEntry>('SELECT * FROM weight_log ORDER BY date');
    setEntries(result);
  };

  const saveWeight = async () => {
    const numWeight = parseFloat(weight);
    if (!weight || isNaN(numWeight)) {
      Alert.alert('Please enter a valid weight');
      return;
    }

    if (editingEntry) {
      await db.runAsync('UPDATE weight_log SET weight = ? WHERE id = ?', numWeight, editingEntry.id);
    } else {
      await db.runAsync(
        'INSERT OR REPLACE INTO weight_log (weight, date) VALUES (?, ?)',
        numWeight,
        selectedDate
      );
    }

    setWeight('');
    setEditingEntry(null);
    setModalVisible(false);
    fetchWeights();
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Weight",
      "Are you sure you want to delete this weight entry?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteWeight }
      ]
    );
  };

  const deleteWeight = async () => {
    if (editingEntry) {
      await db.runAsync('DELETE FROM weight_log WHERE id = ?', editingEntry.id);
      setEditingEntry(null);
      setModalVisible(false);
      fetchWeights();
    }
  };

  const onDayPress = async (day: any) => {
    setSelectedDate(day.dateString);
    const result = await db.getAllAsync<WeightEntry>(
      'SELECT * FROM weight_log WHERE date = ?',
      day.dateString
    );

    if (result.length > 0) {
      setEditingEntry(result[0]);
      setWeight(result[0].weight.toString());
    } else {
      setEditingEntry(null);
      setWeight('');
    }

    setModalVisible(true);
  };

  const generatePDF = async () => {
    const result = await db.getAllAsync<WeightEntry>('SELECT * FROM weight_log ORDER BY date DESC');
    const rows = result.map((entry, i) => `
      <tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#fff'}">
        <td>${entry.date}</td>
        <td style="text-align:right;">${entry.weight} kg</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <style>
            h1 { text-align: center; color: #2196F3; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th { background-color: #2196F3; color: white; text-align: left; padding: 8px; }
            td { padding: 8px; border-bottom: 1px solid #ccc; }
            tr:hover { background-color: #f1f1f1; }
          </style>
        </head>
        <body>
          <h1>Weight Report</h1>
          <table>
            <thead><tr><th>Date</th><th style="text-align:right;">Weight</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html, base64: false });
    await Sharing.shareAsync(uri);
  };

  const markedDates = entries.reduce((acc, curr) => {
    acc[curr.date] = {
      marked: true,
      selected: curr.date === selectedDate,
      selectedColor: '#2196F3',
      customStyles: {
        container: { backgroundColor: '#E3F2FD' },
        text: { color: '#000' },
      },
    };
    return acc;
  }, {} as Record<string, any>);

  // Chart for the selected month
  const chartData = (() => {
    const month = selectedDate.slice(0, 7); // YYYY-MM
    const filtered = entries.filter(e => e.date.startsWith(month));
    return {
      labels: filtered.map(e => e.date.slice(8)), // day only
      datasets: [{ data: filtered.map(e => e.weight) }]
    };
  })();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Weight Report</Text>

        <Calendar
          onDayPress={onDayPress}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...(markedDates[selectedDate] || {}),
              selected: true,
              selectedColor: '#2196F3',
            },
          }}
          markingType="custom"
        />

        <Text style={styles.chartTitle}>Monthly Weight Chart</Text>

        {chartData.labels.length > 0 ? (
          <LineChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
            yAxisSuffix="kg"
            chartConfig={{
              backgroundColor: '#2196F3',
              backgroundGradientFrom: '#64b5f6',
              backgroundGradientTo: '#1976d2',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: '#fff',
              },
            }}
            style={{ marginVertical: 8, borderRadius: 16, alignSelf: 'center' }}
          />
        ) : (
          <Text style={styles.noChart}>No data for this month</Text>
        )}

        <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
          <Text style={styles.pdfButtonText}>Download PDF</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingEntry ? `Edit weight for ${selectedDate}` : `Enter weight for ${selectedDate}`}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Weight in kg"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveWeight}>
              <Text style={styles.saveButtonText}>{editingEntry ? 'Update' : 'Save'}</Text>
            </TouchableOpacity>
            {editingEntry && (
              <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
    color: '#2196F3',
    textAlign: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    textAlign: 'center',
    marginTop: 16,
  },
  noChart: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginVertical: 16,
  },
  pdfButton: {
    backgroundColor: '#e3f2fd',
    margin: 16,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
