import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import {
  Smile, Droplet, Activity, Thermometer, Settings,
  Search, Phone, Pill
} from 'lucide-react-native';
import motivationQuotes from './motivationTalks'; // <-- Import from motivation.tsx

const GITHUB_AVATAR_URI = "https://i.pinimg.com/originals/ef/a2/8d/efa28d18a04e7fa40ed49eeb0ab660db.jpg";

const HomePage: React.FC = () => {
  const userName = 'John Doe';
  const profilePicUrl = GITHUB_AVATAR_URI;

  const [currentQuote, setCurrentQuote] = useState<string>("");

  useEffect(() => {
    const updateQuote = () => {
      const randomIndex = Math.floor(Math.random() * motivationQuotes.length);
      setCurrentQuote(motivationQuotes[randomIndex]);
    };

    updateQuote(); // Show first quote immediately
    const intervalId = setInterval(updateQuote, 30000); // Update every 30 sec

    return () => clearInterval(intervalId);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Link href="/(tabs)/profile" asChild>
          <TouchableOpacity>
            <Image source={{ uri: profilePicUrl }} style={styles.profilePic} />
          </TouchableOpacity>
        </Link>
        <Text style={styles.userName}>Hello, {userName}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}><Search size={22} color="#2196F3" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}><Settings size={22} color="#2196F3" /></TouchableOpacity>
        </View>
      </View>

      <TextInput style={styles.searchBar} placeholder="Search..." placeholderTextColor="#999" />

      <View style={styles.motivationPanel}>
        <Smile size={28} color="#2196F3" />
        <Text style={styles.motivationText}>{currentQuote}</Text>
      </View>

      <View style={styles.tilesContainer}>
        <Link href="/(tabs)/moods" asChild>
          <TouchableOpacity style={styles.tile}>
            <Smile size={32} color="white" />
            <Text style={styles.tileText}>Mood Tracking</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(tabs)/fluid" asChild>
          <TouchableOpacity style={styles.tile}>
            <Droplet size={32} color="white" />
            <Text style={styles.tileText}>Fluid Tracking</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(tabs)/weights" asChild>
          <TouchableOpacity style={styles.tile}>
            <Activity size={32} color="white" />
            <Text style={styles.tileText}>Weight Report</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(tabs)/symptoms" asChild>
          <TouchableOpacity style={styles.tile}>
            <Thermometer size={32} color="white" />
            <Text style={styles.tileText}>Symptoms</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(tabs)/contacts" asChild>
          <TouchableOpacity style={styles.tile}>
            <Phone size={32} color="white" />
            <Text style={styles.tileText}>Contacts</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity style={styles.tile}>
          <Pill size={32} color="white" />
          <Text style={styles.tileText}>Medication</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  profilePic: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  userName: { flex: 1, fontSize: 18, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', gap: 12 },
  iconButton: { padding: 6 },
  searchBar: {
    height: 40, backgroundColor: 'white', borderRadius: 10,
    paddingHorizontal: 16, fontSize: 14, marginBottom: 16,
    borderColor: '#ddd', borderWidth: 1,
  },
  motivationPanel: {
    backgroundColor: '#e0f2ff', borderRadius: 10, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
  },
  motivationText: {
    marginLeft: 12, fontSize: 14, color: '#1e40af', fontWeight: '500',
    flex: 1,
  },
  tilesContainer: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', gap: 12,
  },
  tile: {
    backgroundColor: '#2196F3', width: '48%', padding: 20,
    borderRadius: 12, alignItems: 'center', marginBottom: 12,
  },
  tileText: {
    color: 'white', marginTop: 8, fontSize: 14, textAlign: 'center',
  },
});

export default HomePage;
