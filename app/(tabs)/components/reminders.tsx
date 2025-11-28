import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useTheme } from "../utils/ThemeContext";
import { API_BASE } from "../utils/config";

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [occasion, setOccasion] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [message, setMessage] = useState("");
  const [childId, setChildId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [fontsLoaded, setFontsLoaded]= useState(false);
  const {theme}=useTheme();

  useEffect(() => {
    initializeData();
    Font.loadAsync({
      "ComicRelief-Bold": require("../../../assets/fonts/ComicRelief-Bold.ttf"),
      "ComicRelief-Regular": require("../../../assets/fonts/ComicRelief-Regular.ttf"),
    }).then(() => setFontsLoaded(true));
  }, []);

  // Consistent with Profile page approach
  const getChildIdFromStorage = async () => {
    try {
      // Use the same key as Profile page
      const childId = await AsyncStorage.getItem("childId");
      console.log("Stored Child ID:", childId);

      if (childId) {
        return childId;
      }

      // Fallback to selected_child if childId doesn't exist
      const childData = await AsyncStorage.getItem("selected_child");
      if (childData) {
        const parsedChildData = JSON.parse(childData);
        return parsedChildData.id;
      }

      return null;
    } catch (error) {
      console.error("Error getting child ID:", error);
      return null;
    }
  };

  const initializeData = async () => {
    try {
      setLoading(true);
      const storedChildId = await getChildIdFromStorage();

      if (storedChildId) {
        setChildId(storedChildId);
        await loadReminders(storedChildId);
      } else {
        Alert.alert("Error", "Child ID not found. Please login again.");
        router.push("/(tabs)/auth/login");
      }
    } catch (error) {
      console.error("Error initializing data:", error);
      Alert.alert("Error", "Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  // Load reminders from API
  const loadReminders = async (childIdParam = null) => {
    try {
      setLoading(true);

      const currentChildId = childIdParam || childId;
      if (!currentChildId) {
        throw new Error('No child ID available');
      }

      console.log("Loading reminders for child ID:", currentChildId);

      const response = await fetch(`${API_BASE}/reminders/${currentChildId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log("API Response:", result);

        if (result.reminders && Array.isArray(result.reminders)) {
          setReminders(result.reminders);
          await AsyncStorage.setItem("kid_reminders", JSON.stringify(result.reminders));
        } else {
          // Fallback to local storage
          console.log("No reminders from API, checking local storage");
          const storedReminders = await AsyncStorage.getItem("kid_reminders");
          if (storedReminders) {
            setReminders(JSON.parse(storedReminders));
          }
        }
      } else {
        throw new Error(`Failed to fetch reminders: ${response.status}`);
      }
    } catch (error) {
      console.error("Error loading reminders from API:", error);

      // Fallback to local storage
      try {
        const storedReminders = await AsyncStorage.getItem("kid_reminders");
        if (storedReminders) {
          console.log("Using local storage reminders");
          setReminders(JSON.parse(storedReminders));
        }
      } catch (storageError) {
        console.error("Error loading from local storage:", storageError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to refresh reminders
  const handleRefresh = () => {
    setRefreshing(true);
    if (childId) {
      loadReminders(childId);
    } else {
      initializeData();
    }
  };

  // Save reminders to local storage
  const saveReminders = async (newReminders) => {
    try {
      await AsyncStorage.setItem("kid_reminders", JSON.stringify(newReminders));
    } catch (error) {
      console.error("Error saving reminders:", error);
    }
  };

  // Create new reminder
  const handleCreateReminder = async () => {
    if (!occasion || !reminderDate || !reminderTime || !message) {
      Alert.alert("Oops!", "Please fill in all fields!");
      return;
    }

    const currentChildId = childId || await getChildIdFromStorage();

    if (!currentChildId) {
      Alert.alert("Error", "Child ID not found. Please login again.");
      return;
    }

    try {
      const reminderData = {
        child_id: parseInt(currentChildId),
        occasion,
        reminder_date: reminderDate,
        reminder_time: reminderTime,
        message
      };

      console.log("Creating reminder:", reminderData);

      const response = await fetch(`${API_BASE}/set-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(reminderData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Create reminder result:", result);

        const newReminder = {
          id: result.reminder_id || Date.now(),
          ...reminderData,
          created_at: new Date().toISOString()
        };

        // Update state and storage
        const updatedReminders = [...reminders, newReminder];
        setReminders(updatedReminders);
        await saveReminders(updatedReminders);

        // Clear form
        resetForm();

        Alert.alert("Yay!", "Reminder created successfully!");
      } else {
        const errorText = await response.text();
        console.error("Create reminder failed:", errorText);
        throw new Error('Failed to create reminder');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      Alert.alert("Oh no!", "Couldn't create reminder. Please try again!");
    }
  };

  // Update existing reminder
  const handleUpdateReminder = async () => {
    if (!occasion || !reminderDate || !reminderTime || !message) {
      Alert.alert("Oops!", "Please fill in all fields!");
      return;
    }

    try {
      const currentChildId = childId || await getChildIdFromStorage();

      if (!currentChildId) {
        Alert.alert("Error", "Child ID not found.");
        return;
      }

      const reminderData = {
        child_id: parseInt(currentChildId),
        occasion,
        reminder_date: reminderDate,
        reminder_time: reminderTime,
        message
      };

      console.log("Updating reminder:", editingReminder.id, reminderData);

      const response = await fetch(`${API_BASE}/reminder/${editingReminder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(reminderData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Update reminder result:", result);

        // Update local state
        const updatedReminders = reminders.map(reminder =>
          reminder.id === editingReminder.id
            ? { ...reminder, ...reminderData }
            : reminder
        );

        setReminders(updatedReminders);
        await saveReminders(updatedReminders);

        // Reset form and exit edit mode
        resetForm();

        Alert.alert("Success!", "Reminder updated successfully!");
      } else {
        const errorText = await response.text();
        console.error("Update reminder failed:", errorText);
        throw new Error('Failed to update reminder');
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      Alert.alert("Oh no!", "Couldn't update reminder. Please try again!");
    }
  };

  // Delete reminder
  const deleteReminder = async (id) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const currentChildId = childId || await getChildIdFromStorage();

              if (!currentChildId) {
                Alert.alert("Error", "Child ID not found.");
                return;
              }

              console.log("Deleting reminder:", id);

              const response = await fetch(
                `${API_BASE}/reminder/${id}?child_id=${currentChildId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'accept': 'application/json'
                  }
                }
              );

              if (response.ok) {
                const result = await response.json();
                console.log("Delete reminder result:", result);

                // Remove from local state
                const updatedReminders = reminders.filter(reminder => reminder.id !== id);
                setReminders(updatedReminders);

                // Update local storage
                await saveReminders(updatedReminders);

                Alert.alert("Success!", "Reminder deleted successfully!");
              } else {
                const errorText = await response.text();
                console.error("Delete reminder failed:", errorText);
                throw new Error('Failed to delete reminder from API');
              }
            } catch (error) {
              console.error("Error deleting reminder:", error);

              // Fallback: remove from local state even if API fails
              const updatedReminders = reminders.filter(reminder => reminder.id !== id);
              setReminders(updatedReminders);
              await saveReminders(updatedReminders);

              Alert.alert("Deleted locally", "Reminder was deleted from your device.");
            }
          }
        }
      ]
    );
  };

  // Start editing a reminder
  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder);
    setEditMode(true);
    setOccasion(reminder.occasion);
    setReminderDate(reminder.reminder_date);
    setReminderTime(reminder.reminder_time);
    setMessage(reminder.message);
  };

  // Reset form and exit edit mode
  const resetForm = () => {
    setEditingReminder(null);
    setEditMode(false);
    setOccasion("");
    setReminderDate("");
    setReminderTime("");
    setMessage("");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    resetForm();
  };

  // Web-compatible date handler
  const handleDateChange = (event) => {
    setReminderDate(event.target.value);
  };

  // Web-compatible time handler
  const handleTimeChange = (event) => {
    setReminderTime(event.target.value);
  };

  // Get today's date in YYYY-MM-DD format for the min attribute
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Render individual reminder item
  const renderReminderItem = ({ item }) => (
    <View style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <Text style={styles.reminderOccasion}>{item.occasion}</Text>
        <View style={styles.reminderActions}>
          {/* Edit Button */}
          <TouchableOpacity
            onPress={() => handleEditReminder(item)}
            style={styles.editButton}
          >
            <Feather name="edit" size={16} color="#4CAF50" />
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={() => deleteReminder(item.id)}
            style={styles.deleteButton}
          >
            <Feather name="trash-2" size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.reminderMessage}>{item.message}</Text>
      <View style={styles.reminderDateTime}>
        <Text style={styles.reminderDate}>{item.reminder_date}</Text>
        <Text style={styles.reminderTime}>{item.reminder_time}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground
      // source={require("@/assets/images/theme1.png")}
      style={styles.background}
      source={theme.background}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/components/chatbot")}
          >
            <Feather name="arrow-left" size={20} color={"#fff"} />
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#196c57"]}
              tintColor="#196c57"
            />
          }
        >
          {/* Main Container */}
          <View style={styles.mainContainer}>
            <View style={styles.subContainer}>
              {/* Dynamic Title based on mode */}
              <Text style={styles.sectionTitle}>
                {editMode ? "Edit Reminder" : "Create New Reminder"}
              </Text>

              {/* Input Fields */}
              <View style={styles.inputsContainer}>
                <View style={styles.inputField}>
                  <View style={styles.inputLabel}>
                    <Feather name="gift" size={16} color="#196c57" />
                    <Text style={styles.inputLabelText}>Occasion</Text>
                  </View>
                  <TextInput
                    style={styles.inputText}
                    placeholder="e.g., Birthday, Playdate..."
                    placeholderTextColor="#999"
                    value={occasion}
                    onChangeText={setOccasion}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputField, styles.halfInput]}>
                    <View style={styles.inputLabel}>
                      <Feather name="calendar" size={16} color="#196c57" />
                      <Text style={styles.inputLabelText}>Date</Text>
                    </View>

                    <View style={styles.inputWrapper}>
                      <input
                        type="date"
                        value={reminderDate}
                        onChange={handleDateChange}
                        style={styles.webInput}
                        min={getTodayDate()}
                        className="date-input"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputField, styles.halfInput]}>
                    <View style={styles.inputLabel}>
                      <Feather name="clock" size={16} color="#196c57" />
                      <Text style={styles.inputLabelText}>Time</Text>
                    </View>

                    <View style={styles.inputWrapper}>
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={handleTimeChange}
                        style={styles.webInput}
                        className="time-input"
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputField}>
                  <View style={styles.inputLabel}>
                    <Feather name="message-square" size={16} color="#196c57" />
                    <Text style={styles.inputLabelText}>Message</Text>
                  </View>
                  <TextInput
                    style={[styles.inputText, styles.multilineInput]}
                    placeholder="Write your reminder message..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                    value={message}
                    onChangeText={setMessage}
                  />
                </View>
              </View>

              {/* Dynamic Action Buttons */}
              <View style={styles.actionButtons}>
                {editMode ? (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={handleCancelEdit}
                    >
                      <Feather name="x" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.updateButton]}
                      onPress={handleUpdateReminder}
                    >
                      <Feather name="save" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Update Reminder</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateReminder}
                    disabled={!childId}
                  >
                    <Feather name="plus" size={20} color="#fff" />
                    <Text style={styles.createButtonText}>
                      {childId ? "Create Reminder" : "Loading..."}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Loading Indicator */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#196c57" />
                <Text style={styles.loadingText}>Loading reminders...</Text>
              </View>
            )}

            {/* Reminders List */}
            {!loading && reminders.length > 0 && (
              <View style={styles.remindersContainer}>
                <View style={styles.remindersHeader}>
                  <Text style={styles.sectionTitle}>Your Reminders 📝</Text>
                </View>
                <FlatList
                  data={reminders}
                  renderItem={renderReminderItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  contentContainerStyle={styles.remindersList}
                />
              </View>
            )}

            {/* No Reminders Message */}
            {!loading && reminders.length === 0 && (
              <View style={styles.noRemindersContainer}>
                <Feather name="bell-off" size={48} color="#999" />
                <Text style={styles.noRemindersText}>No reminders yet</Text>
                <Text style={styles.noRemindersSubText}>
                  Create your first reminder above!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    padding: 14,
    marginTop: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f66c46ff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    gap: 5,
  },
  backButtonText: {
    color: "#fff",
    fontFamily: "ComicRelief-Regular",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  mainContainer: {
    width: "100%",
    padding: 18,
    borderRadius: 10,
    backgroundColor: "rgba(89, 180, 255, 0.95)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  subContainer: {
    backgroundColor: "#9cd2ffff",
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#196c57",
    fontFamily: "ComicRelief-Regular",
    textAlign: "center",
    marginBottom: 20,
  },
  childIdText: {
    textAlign: "center",
    fontSize: 12,
    color: "#196c57",
    marginBottom: 10,
    fontFamily: "ComicRelief-Regular",
    backgroundColor: "rgba(255,255,255,0.5)",
    padding: 5,
    borderRadius: 5,
  },
  inputsContainer: {
    gap: 16,
    marginTop:10,
  },
  inputField: {
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  inputLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#196c57",
    fontFamily: "ComicRelief-Regular",
  },
  inputText: {
    backgroundColor: "#fff",
    borderColor: "#e0e0e0",
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#333",
    fontFamily: "ComicRelief-Regular",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputWrapper: {
    backgroundColor: "#fff",
    borderColor: "#e0e0e0",
    borderWidth: 2,
    borderRadius: 12,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  webInput: {
    width: '100%',
    height: 44,
    border: 'none',
    outline: 'none',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    justifyContent:"center"
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  updateButton: {
    backgroundColor: "#FFA000",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 600,
    color: "#fff",
    fontFamily: "ComicRelief-Regular",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#196c57",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    marginTop: 10,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 600,
    color: "#fff",
    fontFamily: "ComicRelief-Regular",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: "#196c57",
    fontFamily: "ComicRelief-Regular",
    fontSize: 16,
  },
  remindersContainer: {
    backgroundColor: "#9cd2ffff",
    padding: 20,
    borderRadius: 16,
  },
  remindersHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  remindersCount: {
    fontSize: 14,
    color: "#666",
    fontFamily: "ComicRelief-Regular",
    marginTop: 5,
  },
  remindersList: {
    gap: 12,
  },
  reminderCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reminderOccasion: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#196c57",
    fontFamily: "ComicRelief-Regular",
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#E8F5E8',
  },
  deleteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FFEBEE',
  },
  reminderMessage: {
    fontSize: 14,
    color: "#666",
    fontFamily: "ComicRelief-Regular",
    marginBottom: 8,
  },
  reminderDateTime: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reminderDate: {
    fontSize: 12,
    color: "#888",
    fontFamily: "ComicRelief-Regular",
  },
  reminderTime: {
    fontSize: 12,
    color: "#888",
    fontFamily: "ComicRelief-Regular",
  },
  noRemindersContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#9cd2ffff",
    borderRadius: 16,
  },
  noRemindersText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
    fontFamily: "ComicRelief-Regular",
    fontWeight: "600",
  },
  noRemindersSubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
  },
});
