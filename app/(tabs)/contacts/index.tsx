// ContactsScreen.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Link } from "expo-router";
import {
  Smile, Droplet, Activity, Thermometer, Settings,
  Search, Phone, Pill, Home, User
} from 'lucide-react-native';
import { useRouter } from "expo-router";
export default function ContactsScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>("restaurant");
  const [contacts, setContacts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewingContact, setViewingContact] = useState<any | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const hospitalityIcons = [
    "restaurant", "bed", "briefcase", "cafe", "concierge-bell",
    "wine", "broom", "car", "bus", "person"
  ];

  useEffect(() => {
    (async () => {
      await db.runAsync(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        type TEXT,
        icon TEXT
      )`);
      fetchContacts();
    })();
  }, []);

  const fetchContacts = async () => {
    const result = await db.getAllAsync("SELECT * FROM contacts");
    setContacts(result);
  };

  const saveContact = async () => {
    if (!name || !email || !phone || !type) return;
    try {
      if (editingId !== null) {
        await db.runAsync(
          "UPDATE contacts SET name = ?, email = ?, phone = ?, type = ?, icon = ? WHERE id = ?",
          name, email, phone, type, selectedIcon, editingId
        );
      } else {
        await db.runAsync(
          "INSERT INTO contacts (name, email, phone, type, icon) VALUES (?, ?, ?, ?, ?)",
          name, email, phone, type, selectedIcon
        );
      }
      resetForm();
      fetchContacts();
    } catch (err) {
      console.log("Save contact error:", err);
    }
  };

  const resetForm = () => {
    setName(""); setEmail(""); setPhone(""); setType("");
    setSelectedIcon("restaurant");
    setEditingId(null); setModalVisible(false);
  };

  const confirmDelete = (id: number) => {
    Alert.alert("Delete Contact", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          await db.runAsync("DELETE FROM contacts WHERE id = ?", id);
          fetchContacts();
        }
      },
    ]);
  };

  const startEditing = (item: any) => {
    setName(item.name); setEmail(item.email); setPhone(item.phone);
    setType(item.type); setSelectedIcon(item.icon || "restaurant");
    setEditingId(item.id); setModalVisible(true); setViewModalVisible(false);
  };

  const openContactView = (item: any) => {
    setViewingContact(item); setViewModalVisible(true);
  };

  const makeCall = (phone: string) => Linking.openURL(`tel:${phone}`);

  const copyToClipboard = (text: string) => {
    Clipboard.setStringAsync(text);
    Alert.alert("Copied", `\"${text}\" copied to clipboard.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Contact Manager</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openContactView(item)} style={styles.contactItem}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name={item.icon || "person"} size={24} color="#2196F3" style={{ marginRight: 10 }} />
              <View>
                <Text style={styles.contactText}>{item.name}</Text>
                <Text style={styles.contactPhone}>Email: {item.email}</Text>
                <Text style={styles.contactPhone}>Phone: {item.phone}</Text>
                <Text style={styles.contactPhone}>Type: {item.type}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => makeCall(item.phone)}>
              <Ionicons name="call" size={22} color="#2196F3" style={styles.icon} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add-circle" size={28} color="#2196F3" />
        <Text style={styles.addButtonText}>Add Contact</Text>
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/home")}>
          <Home size={24} color="white" /><Text style={styles.navText}>Home</Text></TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/contacts")}>
          <Phone size={24} color="white" /><Text style={styles.navText}>Contacts</Text></TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/medications")}>
          <Pill size={24} color="white" /><Text style={styles.navText}>Meds</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/profile")}>
          <User size={24} color="white" /><Text style={styles.navText}>Profile</Text></TouchableOpacity>
       </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: "10%", padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#2196F3", textAlign: "center" },
  addButton: {
    position: "absolute", bottom: 80, alignSelf: "center",
    flexDirection: "row", alignItems: "center", backgroundColor: "#e3f2fd",
    borderRadius: 30, paddingHorizontal: 20, paddingVertical: 10, gap: 10,
  },
  addButtonText: { color: "#000", fontSize: 16, fontWeight: "600" },
  contactItem: {
    backgroundColor: "#f1f8ff", padding: 16, borderRadius: 10, marginBottom: 12,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  contactText: { fontSize: 18, fontWeight: "bold" },
  contactPhone: { fontSize: 14, color: "#555", marginTop: 2 },
  icon: { padding: 4 },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#2196F3', flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  navButton: { alignItems: 'center' },
  navText: { color: 'white', fontSize: 12, marginTop: 4 },
});