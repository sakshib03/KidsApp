import { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./config";
import * as Font from "expo-font";
import DateTimePicker from "react-native-modal-datetime-picker";

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [occasion, setOccasion] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [message, setMessage] = useState("");
  const [childId, setChildId] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const storedReminders = await AsyncStorage.getItem("kid_reminders");
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      }
    } catch (error) {
      console.error("Error loading reminders:", error);
    }
  };

  const saveReminders = async (newReminders) => {
    try {
      await AsyncStorage.setItem("kid_reminders", JSON.stringify(newReminders));
    } catch (error) {
      console.error("Error saving reminders:", error);
    }
  };

  const handleCreateReminder=async()=>{
    if(!occasion || !reminderDate || !reminderTime || !message){
      Alert.alert("Oops!", "Please fill in all fields!");
      return;
    }

    try{
      const reminderData={
        child_id: childId,
        occasion,
        reminder_date:reminderDate,
        reminder_time:reminderTime,
        message
      };

      const response=await fetch(`${API_BASE}/set-reminder`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'accept':'application/json'
        },
        body:JSON.stringify(reminderData)
      });

      if(response.ok){
        const result=await response.json();

        const newReminder={
          id: result.reminder_id || Date.now(),
          ...reminderData,
          created_at:new Date().toISOString()
        };

        const updatedReminders=[...reminders, newReminder];
        setReminders(updatedReminders);
        saveReminders(updatedReminders);

        setOccasion("");
        setReminderDate("");
        setReminderTime("");
        setMessage("");

        Alert.alert("Yay!", "reminder created successfully!");
      }else{
        throw new Error('Failed to create reminder');
      }
    }catch(error){
      console.error('Error creating reminder:', error);
      Alert.alert("Oh no!", "Couldn't create reminder. Please try again!");
    }
  };

  const handleDateChange=(event, date)=>{
    setShowDatePicker(false);
    if(date){
      setSelectedDate(date);
      const formattedDate=date.toISOString().split('T')[0];
      setReminderDate(formattedDate);
    }
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
      const formattedTime = time.toTimeString().split(' ')[0].substring(0, 5);
      setReminderTime(formattedTime);
    }
  };

  const deleteReminder=(id)=>{
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        {text:"Cancel", style:"cancel"},
        {
          text: "Delete",
          style:"destructive",
          onPress:()=>{
            const updatedReminders=reminders.filter(reminder=>reminder.id !== id);
            setReminders(updatedReminders);
            saveReminders(updatedReminders);
          }
        }
      ]
    );
  };

  const renderReminderItem=({item})=>(
    <View style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
          <Text style={styles.reminderOccasion}>{item.occasion}</Text>
          <TouchableOpacity onPress={()=> deleteReminder(item.id)}>
            <Feather name="trash-2" size={18} color="#FF6B6B"/>
          </TouchableOpacity>
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
      source={require("@/assets/images/theme1.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/chatbot")}
          >
            <Feather name="arrow-left" size={20} color={"#fff"} />
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>

          {/* <View style={styles.titleContainer}>
            <MaterialIcons
              name="notifications-active"
              size={28}
              color="#FFD700"
            />
            <Text style={styles.title}>My Reminders</Text>
          </View> */}
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Container */}
          <View style={styles.mainContainer}>
            <View style={styles.subContainer}>
              <Text style={styles.sectionTitle}>Create New Reminder</Text>

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
                    <TouchableOpacity
                      style={styles.inputText}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text
                        style={
                          reminderDate
                            ? styles.dateText
                            : styles.placeholderText
                        }
                      >
                        {reminderDate || "Select date"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.inputField, styles.halfInput]}>
                    <View style={styles.inputLabel}>
                      <Feather name="clock" size={16} color="#196c57" />
                      <Text style={styles.inputLabelText}>Time</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.inputText}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Text
                        style={
                          reminderTime
                            ? styles.dateText
                            : styles.placeholderText
                        }
                      >
                        {reminderTime || "Select time"}
                      </Text>
                    </TouchableOpacity>
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

              {/* Create Button */}
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateReminder}
              >
                <Feather name="plus" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Create Reminder</Text>
              </TouchableOpacity>
            </View>

            {reminders.length > 0 && (
              <View style={styles.remindersContainer}>
                <Text style={styles.sectionTitle}>Your Reminders 📝</Text>
                <FlatList
                  data={reminders}
                  renderItem={renderReminderItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  contentContainerStyle={styles.remindersList}
                />
              </View>
            )}
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
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
    padding: 20,
    marginTop: 30,
  },
  header: {
    flexDirection: "column",
    alignItems: "flex-start",
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
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "ComicRelief-Regular",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight:700,
    color: "#2eb3c5ff",
  },
  scrollContainer: {
    flex: 1,
  },
  mainContainer: {
    width: "100%",
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(61, 163, 248, 0.95)",
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
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#196c57",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "ComicRelief-Regular",
  },
  inputsContainer: {
    gap: 16,
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
  },
  inputText: {
    backgroundColor: "#fff",
    borderColor: "#e0e0e0",
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  placeholderText: {
    color: "#999",
  },
  dateText: {
    color: "#333",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#196c57",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    marginTop: 20,
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
    fontWeight:600,
    color: "#fff",
    fontFamily: "ComicRelief-Regular",
  },
  remindersContainer: {
    backgroundColor: "#9cd2ffff",
    padding: 20,
    borderRadius: 16,
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
  },
  reminderMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  reminderDateTime: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reminderDate: {
    fontSize: 12,
    color: "#888",
  },
  reminderTime: {
    fontSize: 12,
    color: "#888",
  },
});
