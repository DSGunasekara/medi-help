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
  
  export default function ContactsScreen() {
    const db = useSQLiteContext();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [contacts, setContacts] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
  
    useEffect(() => {
      (async () => {
        await db.runAsync(
          "CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT)"
        );
        fetchContacts();
      })();
    }, []);
  
    const fetchContacts = async () => {
      const result = await db.getAllAsync("SELECT * FROM contacts");
      setContacts(result);
    };
  
    const saveContact = async () => {
      if (!name || !phone) return;
      try {
        if (editingId !== null) {
          await db.runAsync(
            "UPDATE contacts SET name = ?, phone = ? WHERE id = ?",
            name,
            phone,
            editingId
          );
        } else {
          await db.runAsync(
            "INSERT INTO contacts (name, phone) VALUES (?, ?)",
            name,
            phone
          );
        }
        resetForm();
        fetchContacts();
      } catch (err) {
        console.log("Save contact error:", err);
      }
    };
  
    const resetForm = () => {
      setName("");
      setPhone("");
      setEditingId(null);
      setModalVisible(false);
    };
  
    const confirmDelete = (id: number) => {
      Alert.alert("Delete Contact", "Are you sure you want to delete this contact?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await db.runAsync("DELETE FROM contacts WHERE id = ?", id);
            fetchContacts();
          },
        },
      ]);
    };
  
    const startEditing = (item: any) => {
      setName(item.name);
      setPhone(item.phone);
      setEditingId(item.id);
      setModalVisible(true);
    };
  
    const makeCall = (phone: string) => {
      Linking.openURL(`tel:${phone}`);
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Contact Manager</Text>
  
        {contacts.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>No contacts found.</Text>
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item }) => (
              <View style={styles.contactItem}>
                <View>
                  <Text style={styles.contactText}>{item.name}</Text>
                  <Text style={styles.contactPhone}>{item.phone}</Text>
                </View>
                <View style={styles.iconGroup}>
                  <TouchableOpacity onPress={() => makeCall(item.phone)}>
                    <Ionicons name="call" size={22} color="#2196F3" style={styles.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => startEditing(item)}>
                    <Ionicons name="create" size={22} color="green" style={styles.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                    <Ionicons name="trash" size={22} color="red" style={styles.icon} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
  
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={28} color="#2196F3" />
          <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>
  
        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={resetForm}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingId !== null ? "Edit Contact" : "Add Contact"}</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity style={styles.saveButton} onPress={saveContact}>
                <Text style={styles.saveButtonText}>{editingId !== null ? "Update" : "Save"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={resetForm}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: "#fff",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: "#2196F3",
      textAlign: "center",
    },
    addButton: {
      position: "absolute",
      bottom: 20,
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#e3f2fd",
      borderRadius: 30,
      paddingHorizontal: 20,
      paddingVertical: 10,
      gap: 10,
    },
    addButtonText: {
      color: "#2196F3",
      fontSize: 16,
      fontWeight: "600",
    },
    contactItem: {
      backgroundColor: "#f1f8ff",
      padding: 16,
      borderRadius: 10,
      marginBottom: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    contactText: {
      fontSize: 18,
      fontWeight: "bold",
    },
    contactPhone: {
      fontSize: 14,
      color: "#555",
      marginTop: 2,
    },
    iconGroup: {
      flexDirection: "row",
      gap: 10,
    },
    icon: {
      padding: 4,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      width: "80%",
      backgroundColor: "white",
      borderRadius: 10,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 20,
      textAlign: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    saveButton: {
      backgroundColor: "#2196F3",
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
    },
    saveButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    cancelText: {
      color: "red",
      fontSize: 14,
      textAlign: "center",
      marginTop: 10,
    },
  });