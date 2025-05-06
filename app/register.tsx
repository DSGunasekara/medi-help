import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, Alert, ScrollView, Modal, Platform
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';

export default function UserProfileForm() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: '',
    contact: '',
    bloodType: '',
    email: '',
    dob: '',
  });

  const [calendarVisible, setCalendarVisible] = useState(false);

  useEffect(() => {
    db.runAsync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT,
        contact TEXT,
        bloodType TEXT,
        email TEXT,
        dob TEXT
      )
    `);
  }, []);

interface FormState {
	fullName: string;
	contact: string;
	bloodType: string;
	email: string;
	dob: string;
}

const handleChange = (key: keyof FormState, value: string) => {
	setForm({ ...form, [key]: value });
};

  const handleSave = async () => {
    const { fullName, contact, bloodType, email, dob } = form;
    if (!fullName || !contact || !bloodType || !email || !dob) {
      Alert.alert('Validation', 'Please fill in all fields');
      return;
    }

    try {
      await db.runAsync(
        `INSERT INTO user_profile (fullName, contact, bloodType, email, dob) VALUES (?, ?, ?, ?, ?)`,
        [fullName, contact, bloodType, email, dob]
      );
      Alert.alert('Success', 'User profile saved successfully', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/home') }
      ]);
    } catch (error) {
      console.error('DB Insert Error:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.loginContentContainer}>
        <Text style={styles.headerTitle}>New Account</Text>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={form.fullName}
            onChangeText={(val) => handleChange('fullName', val)}
            keyboardType="name-phone-pad"
            autoCapitalize="words"
          />

          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+61785254"
            value={form.contact}
            onChangeText={(val) => handleChange('contact', val)}
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Blood Type</Text>
          <TextInput
            style={styles.input}
            placeholder="A+"
            value={form.bloodType}
            onChangeText={(val) => handleChange('bloodType', val)}
          />

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="example@example.com"
            value={form.email}
            onChangeText={(val) => handleChange('email', val)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Date of Birth</Text>
          <TouchableOpacity style={styles.input} onPress={() => setCalendarVisible(true)}>
            <Text style={{ color: form.dob ? '#000' : '#999' }}>{form.dob || 'Select Date of Birth'}</Text>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={calendarVisible}
            onRequestClose={() => setCalendarVisible(false)}
          >
            <View style={styles.modalOverlay}>
			  <View style={styles.modalCalendar}>
				<Calendar
				  onDayPress={(day: { dateString: string }) => {
					handleChange('dob', day.dateString);
					setCalendarVisible(false);
				  }}
				  markedDates={{
					[form.dob]: {
					  selected: true,
					  selectedColor: '#2196F3'
					}
				  }}
				/>
				<TouchableOpacity onPress={() => setCalendarVisible(false)} style={styles.modalCloseBtn}>
				  <Text style={styles.modalCloseText}>Close</Text>
				</TouchableOpacity>
			  </View>
            </View>
          </Modal>

          <TouchableOpacity style={styles.loginButton} onPress={handleSave}>
            <Text style={styles.loginButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loginContentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#2D7FF9",
    marginBottom: 30,
  },
  formContainer: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#F0F5FF",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#2D7FF9",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalCalendar: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    width: '90%'
  },
  modalCloseBtn: {
    marginTop: 10,
    alignItems: 'center'
  },
  modalCloseText: {
    color: '#2196F3',
    fontWeight: '600'
  }
});
