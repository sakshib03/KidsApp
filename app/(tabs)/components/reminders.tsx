import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTheme } from "../utils/ThemeContext";
import { API_BASE } from "../utils/config";

// Configure notifications globally
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Setup Android notification channel
const setupNotificationChannel = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
    });
  }
};

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
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { theme } = useTheme();

  // Date and Time picker states
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [pickerMode, setPickerMode] = useState("date"); // "date" or "time"

  // Consistent with Profile page approach
  const getChildIdFromStorage = async () => {
    try {
      const childId = await AsyncStorage.getItem("childId");
      console.log("Stored Child ID:", childId);

      if (childId) {
        return childId;
      }

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

  // Setup notification permissions
  const setupNotifications = async () => {
    try {
      console.log("🔔 Setting up notifications...");

      // Setup Android notification channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("reminders", {
          name: "Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "default",
        });
        console.log("✅ Android notification channel created");
      }

      // Check current permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      console.log("📋 Current notification status:", existingStatus);

      let finalStatus = existingStatus;

      // Only request if not already granted
      if (existingStatus.status !== "granted") {
        console.log("🔐 Requesting notification permissions...");

        // Request permissions with platform-specific options
        const permissionRequest = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
          android: {
            allowAlert: true,
            allowSound: true,
            allowVibrate: true,
          },
        });

        finalStatus = permissionRequest;
        console.log("📋 Permission request result:", finalStatus);
      }

      if (finalStatus.status === "granted") {
        console.log("✅ Notification permissions granted!");
        return true;
      } else if (finalStatus.status === "undetermined") {
        console.log("⚠️ Notification permission undetermined");
        Alert.alert(
          "Notifications",
          "Please enable notifications in Settings to get reminder alerts.",
          [
            { text: "Later", style: "cancel" },
            { text: "Open Settings", onPress: openAppSettings },
          ]
        );
        return false;
      } else {
        console.log("❌ Notification permission denied");
        Alert.alert(
          "Notifications Disabled",
          "Reminders will work, but you won't receive notifications. You can enable them in Settings.",
          [{ text: "OK" }]
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Error setting up notifications:", error);
      return false;
    }
  };

  // Add this helper function to open app settings
  const openAppSettings = () => {
    // You can use Linking.openSettings() or show instructions
    Alert.alert(
      "Open Settings",
      "Go to Settings > Apps > Your App > Notifications and enable them.",
      [{ text: "OK" }]
    );
  };

  // Schedule notification for a reminder
  const scheduleReminderNotification = async (reminder) => {
    try {
      console.log(
        "🔔 Attempting to schedule notification for:",
        reminder.occasion
      );

      // Setup notifications first
      const hasPermission = await setupNotifications();

      if (!hasPermission) {
        console.log("⚠️ No notification permission");
        return null;
      }

      // Parse date and time
      const reminderDateTime = moment(
        `${reminder.reminder_date} ${reminder.reminder_time}`,
        "YYYY-MM-DD HH:mm"
      );

      console.log(
        "📅 Reminder datetime:",
        reminderDateTime.format("YYYY-MM-DD HH:mm")
      );
      console.log("📅 Current time:", moment().format("YYYY-MM-DD HH:mm"));

      // If reminder is in the past, don't schedule
      if (reminderDateTime.isBefore(moment())) {
        console.log("⏰ Reminder is in the past");
        Alert.alert("Past Reminder", "This reminder is set for a past time.");
        return null;
      }

      // Create notification content
      const notificationContent = {
        title: `⏰ Reminder: ${reminder.occasion}`,
        body: reminder.message,
        data: {
          reminderId: reminder.id,
          childId: reminder.child_id,
          type: "reminder",
        },
        sound: true, // Use boolean instead of 'default'
      };

      // Add badge for iOS
      if (Platform.OS === "ios") {
        notificationContent.badge = 1;
      }

      // IMPORTANT: Create trigger with DATE property
      const trigger = {
        type: "date", // Explicitly set trigger type
        date: reminderDateTime.toDate(), // This was missing!
        channelId: "reminders",
      };

      console.log("⏰ Trigger object:", JSON.stringify(trigger, null, 2));
      console.log("⏰ Trigger date:", trigger.date);
      console.log("⏰ Trigger date timestamp:", trigger.date.getTime());

      // Schedule notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger,
      });

      console.log(`✅ Notification scheduled with ID: ${notificationId}`);

      // Verify it was scheduled
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();
      console.log(
        "📋 Currently scheduled notifications:",
        scheduledNotifications.length
      );

      // Check if our notification is in the list
      const ourNotification = scheduledNotifications.find(
        (n) => n.identifier === notificationId.toString()
      );

      if (ourNotification) {
        console.log("✅ Our notification found in scheduled list");
        console.log("Scheduled for:", ourNotification.trigger.date);
      } else {
        console.warn("⚠️ Our notification not found in scheduled list");
      }

      // Show success message
      // Alert.alert(
      //   'Notification Scheduled! 🔔',
      //   `You'll receive a notification on ${reminder.reminder_date} at ${reminder.reminder_time}`,
      //   [{ text: 'Great!' }]
      // );

      return notificationId;
    } catch (error) {
      console.error("❌ Error scheduling notification:", error);

      if (error.message.includes("trigger")) {
        Alert.alert("Trigger Error", "Could not set notification trigger.");
      } else {
        Alert.alert("Notification Error", "Could not schedule notification.");
      }

      return null;
    }
  };

  // Cancel a scheduled notification
  const cancelReminderNotification = async (notificationId) => {
    if (!notificationId) return;

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Notification ${notificationId} cancelled`);
    } catch (error) {
      console.error("Error cancelling notification:", error);
    }
  };

  // Load reminders from API
  const loadReminders = async (childIdParam = null) => {
    try {
      setLoading(true);

      const currentChildId = childIdParam || childId;
      if (!currentChildId) {
        throw new Error("No child ID available");
      }

      console.log("Loading reminders for child ID:", currentChildId);

      const response = await fetch(`${API_BASE}/reminders/${currentChildId}`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("API Response:", result);

        if (result.reminders && Array.isArray(result.reminders)) {
          const remindersWithNotifications = result.reminders.map(
            (reminder) => ({
              ...reminder,
              notificationId: null, // Will be scheduled on device
            })
          );

          setReminders(remindersWithNotifications);
          await AsyncStorage.setItem(
            "kid_reminders",
            JSON.stringify(remindersWithNotifications)
          );

          // Schedule notifications for future reminders
          await scheduleNotificationsForFutureReminders(
            remindersWithNotifications
          );
        } else {
          console.log("No reminders from API, checking local storage");
          const storedReminders = await AsyncStorage.getItem("kid_reminders");
          if (storedReminders) {
            const parsedReminders = JSON.parse(storedReminders);
            setReminders(parsedReminders);

            // Schedule notifications for future reminders
            await scheduleNotificationsForFutureReminders(parsedReminders);
          }
        }
      } else {
        throw new Error(`Failed to fetch reminders: ${response.status}`);
      }
    } catch (error) {
      console.error("Error loading reminders from API:", error);

      try {
        const storedReminders = await AsyncStorage.getItem("kid_reminders");
        if (storedReminders) {
          console.log("Using local storage reminders");
          const parsedReminders = JSON.parse(storedReminders);
          setReminders(parsedReminders);

          // Schedule notifications for future reminders
          await scheduleNotificationsForFutureReminders(parsedReminders);
        }
      } catch (storageError) {
        console.error("Error loading from local storage:", storageError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkAndShowPermissionStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();

      if (status.status === "granted") {
        return { hasPermission: true, message: "Notifications enabled ✅" };
      } else if (status.status === "denied") {
        return { hasPermission: false, message: "Notifications disabled ❌" };
      } else {
        return {
          hasPermission: false,
          message: "Tap to enable notifications 🔔",
        };
      }
    } catch (error) {
      return { hasPermission: false, message: "Error checking permissions" };
    }
  };

  // Schedule notifications for all future reminders
  const scheduleNotificationsForFutureReminders = async (remindersList) => {
    try {
      // Clear existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule notifications for future reminders
      for (const reminder of remindersList) {
        const reminderDateTime = moment(
          `${reminder.reminder_date} ${reminder.reminder_time}`,
          "YYYY-MM-DD HH:mm"
        );

        // Only schedule if reminder is in the future
        if (reminderDateTime.isAfter(moment())) {
          const notificationId = await scheduleReminderNotification(reminder);

          if (notificationId) {
            // Update reminder with notification ID
            reminder.notificationId = notificationId;
          }
        }
      }

      console.log("✅ All notifications scheduled for future reminders");
    } catch (error) {
      console.error("❌ Error scheduling notifications:", error);
    }
  };

  // Save reminders to AsyncStorage
  const saveReminders = async (newReminders) => {
    try {
      await AsyncStorage.setItem("kid_reminders", JSON.stringify(newReminders));

      // Also store notification mapping
      const notificationMap = {};
      newReminders.forEach((reminder) => {
        if (reminder.notificationId) {
          notificationMap[reminder.id] = reminder.notificationId;
        }
      });
      await AsyncStorage.setItem(
        "reminder_notifications",
        JSON.stringify(notificationMap)
      );
    } catch (error) {
      console.error("Error saving reminders:", error);
    }
  };

  // Function to initialize data
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

  // Setup notification listener
  useEffect(() => {
    const init = async () => {
      await Font.loadAsync({
        "ComicRelief-Bold": require("../../../assets/fonts/ComicRelief-Bold.ttf"),
        "ComicRelief-Regular": require("../../../assets/fonts/ComicRelief-Regular.ttf"),
      });
      setFontsLoaded(true);

      // Initialize data after fonts are loaded
      await initializeData();

      // Setup notification response listener
      const subscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const { reminderId, type } =
            response.notification.request.content.data;

          if (type === "reminder") {
            console.log("User tapped reminder notification:", reminderId);
            // Navigate to reminders screen
            router.push("/(tabs)/components/reminders");
          }
        });

      // Setup notification received listener
      const receivedSubscription =
        Notifications.addNotificationReceivedListener((notification) => {
          console.log("Notification received:", notification);
        });

      return () => {
        subscription.remove();
        receivedSubscription.remove();
      };
    };

    init();
  }, []);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#196c57" />
        <Text style={{ marginTop: 10, color: "#196c57" }}>
          Loading fonts...
        </Text>
      </View>
    );
  }

  const handleRefresh = () => {
    setRefreshing(true);
    if (childId) {
      loadReminders(childId);
    } else {
      initializeData();
    }
  };

  // Date and Time picker functions
  const showDatePicker = () => {
    setPickerMode("date");
    setDatePickerVisibility(true);
  };

  const showTimePicker = () => {
    setPickerMode("time");
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date) => {
    if (pickerMode === "date") {
      const formattedDate = moment(date).format("YYYY-MM-DD");
      setReminderDate(formattedDate);
    } else {
      const formattedTime = moment(date).format("HH:mm");
      setReminderTime(formattedTime);
    }
    hideDatePicker();
  };

  // Create new reminder
  const handleCreateReminder = async () => {
    if (!occasion || !reminderDate || !reminderTime || !message) {
      Alert.alert("Oops!", "Please fill in all fields!");
      return;
    }

    const currentChildId = childId || (await getChildIdFromStorage());

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
        message,
      };

      console.log("Creating reminder:", reminderData);

      // Schedule notification
      const notificationId = await scheduleReminderNotification(reminderData);

      const newReminder = {
        id: Date.now().toString(), // Use timestamp as ID
        ...reminderData,
        created_at: new Date().toISOString(),
        notificationId: notificationId || null,
      };

      // Call API to save to backend
      const response = await fetch(`${API_BASE}/set-reminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          ...reminderData,
          notification_id: notificationId,
        }),
      });

      // Update local state regardless of API response
      const updatedReminders = [...reminders, newReminder];
      setReminders(updatedReminders);
      await saveReminders(updatedReminders);

      resetForm();

      if (response.ok) {
        Alert.alert("🎉 Yay!", "Reminder created with notification! 🔔");
      } else {
        Alert.alert(
          "✅ Reminder created!",
          "Saved locally with notification! 🔔"
        );
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
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
      const currentChildId = childId || (await getChildIdFromStorage());

      if (!currentChildId) {
        Alert.alert("Error", "Child ID not found.");
        return;
      }

      const reminderData = {
        child_id: parseInt(currentChildId),
        occasion,
        reminder_date: reminderDate,
        reminder_time: reminderTime,
        message,
      };

      console.log("Updating reminder:", editingReminder.id, reminderData);

      // Cancel old notification if exists
      if (editingReminder.notificationId) {
        await cancelReminderNotification(editingReminder.notificationId);
      }

      // Schedule new notification
      const newNotificationId = await scheduleReminderNotification(
        reminderData
      );

      const updatedReminders = reminders.map((reminder) =>
        reminder.id === editingReminder.id
          ? {
              ...reminder,
              ...reminderData,
              notificationId: newNotificationId || null,
              updated_at: new Date().toISOString(),
            }
          : reminder
      );

      setReminders(updatedReminders);
      await saveReminders(updatedReminders);

      // Try to update on backend
      try {
        const response = await fetch(
          `${API_BASE}/reminder/${editingReminder.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify({
              ...reminderData,
              notification_id: newNotificationId,
            }),
          }
        );

        if (response.ok) {
          Alert.alert(
            "✅ Success!",
            "Reminder updated with new notification! 🔔"
          );
        }
      } catch (apiError) {
        console.error("API update error:", apiError);
        Alert.alert(
          "✅ Updated locally!",
          "Reminder updated with notification! 🔔"
        );
      }

      resetForm();
    } catch (error) {
      console.error("Error updating reminder:", error);
      Alert.alert("Oh no!", "Couldn't update reminder. Please try again!");
    }
  };

  // Delete reminder
  const deleteReminder = async (id) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder and its notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const currentChildId = childId || (await getChildIdFromStorage());

              if (!currentChildId) {
                Alert.alert("Error", "Child ID not found.");
                return;
              }

              // Find the reminder to get notification ID
              const reminderToDelete = reminders.find((r) => r.id === id);

              // Cancel notification if exists
              if (reminderToDelete?.notificationId) {
                await cancelReminderNotification(
                  reminderToDelete.notificationId
                );
              }

              console.log("Deleting reminder:", id);

              // Try to delete from API
              try {
                const response = await fetch(
                  `${API_BASE}/reminder/${id}?child_id=${currentChildId}`,
                  {
                    method: "DELETE",
                    headers: {
                      accept: "application/json",
                    },
                  }
                );

                if (!response.ok) {
                  throw new Error("Failed to delete from API");
                }
              } catch (apiError) {
                console.error("API delete error:", apiError);
              }

              // Always delete locally
              const updatedReminders = reminders.filter(
                (reminder) => reminder.id !== id
              );
              setReminders(updatedReminders);
              await saveReminders(updatedReminders);
            } catch (error) {
              console.error("Error deleting reminder:", error);
              Alert.alert("Error", "Couldn't delete reminder.");
            }
          },
        },
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

  // Render individual reminder item
  const renderReminderItem = ({ item }) => (
    <View style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <Text style={styles.reminderOccasion}>{item.occasion}</Text>
        <View style={styles.reminderActions}>
          <TouchableOpacity
            onPress={() => handleEditReminder(item)}
            style={styles.editButton}
          >
            <Feather name="edit" size={16} color="#4CAF50" />
          </TouchableOpacity>

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
        {item.notificationId && (
          <Text style={styles.notificationStatus}>🔔 Scheduled</Text>
        )}
      </View>
    </View>
  );

  return (
    <ImageBackground style={styles.background} source={theme.background}>
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

          {/* Notification Info */}
          <TouchableOpacity
            style={styles.notificationInfoButton}
            onPress={setupNotifications}
          >
            <Feather name="bell" size={16} color={"#fff"} />
            <Text style={styles.notificationInfoText}>Notifications</Text>
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

              <Text style={styles.notificationNote}>
                🔔 Notifications will be sent at the scheduled time
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
                  {/* Date Input with TouchableOpacity */}
                  <View style={[styles.inputField, styles.halfInput]}>
                    <View style={styles.inputLabel}>
                      <Feather name="calendar" size={16} color="#196c57" />
                      <Text style={styles.inputLabelText}>Date</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dateTimeInput}
                      onPress={showDatePicker}
                    >
                      <Text
                        style={[
                          styles.dateTimeInputText,
                          !reminderDate && { color: "#999" },
                        ]}
                      >
                        {reminderDate ? reminderDate : "Select Date"}
                      </Text>
                      <Feather name="calendar" size={16} color="#196c57" />
                    </TouchableOpacity>
                  </View>

                  {/* Time Input with TouchableOpacity */}
                  <View style={[styles.inputField, styles.halfInput]}>
                    <View style={styles.inputLabel}>
                      <Feather name="clock" size={16} color="#196c57" />
                      <Text style={styles.inputLabelText}>Time</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dateTimeInput}
                      onPress={showTimePicker}
                    >
                      <Text
                        style={[
                          styles.dateTimeInputText,
                          !reminderTime && { color: "#999" },
                        ]}
                      >
                        {reminderTime ? reminderTime : "Select Time"}
                      </Text>
                      <Feather name="clock" size={16} color="#196c57" />
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

              {/* DateTime Picker Modal */}
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode={pickerMode}
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
                minimumDate={new Date()}
              />

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
                      <Text style={styles.actionButtonText}>
                        Update & Notify
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateReminder}
                    disabled={!childId}
                  >
                    <Feather name="bell" size={20} color="#fff" />
                    <Text style={styles.createButtonText}>
                      {childId ? "Create Reminder & Notify" : "Loading..."}
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
                  <Text style={styles.remindersCount}>
                    {reminders.length} reminder
                    {reminders.length !== 1 ? "s" : ""}
                  </Text>
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
    marginTop: 35,
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
  notificationInfoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    gap: 5,
  },
  notificationInfoText: {
    color: "#fff",
    fontFamily: "ComicRelief-Regular",
    fontSize: 12,
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
    marginBottom: 10,
  },
  notificationNote: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
    fontFamily: "ComicRelief-Regular",
    fontStyle: "italic",
  },
  inputsContainer: {
    gap: 16,
    marginTop: 10,
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
  dateTimeInput: {
    backgroundColor: "#fff",
    borderColor: "#e0e0e0",
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateTimeInputText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "ComicRelief-Regular",
    flex: 1,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 28,
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
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "ComicRelief-Regular",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#196c57",
    paddingVertical: 12,
    paddingHorizontal: 28,
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
    fontWeight: "600",
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
    marginTop: 20,
  },
  remindersHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  remindersCount: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    fontFamily: "ComicRelief-Regular",
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
    flex: 1,
  },
  reminderActions: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#E8F5E8",
  },
  deleteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#FFEBEE",
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
    alignItems: "center",
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
  notificationStatus: {
    fontSize: 10,
    color: "#4CAF50",
    fontFamily: "ComicRelief-Regular",
  },
  noRemindersContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#9cd2ffff",
    borderRadius: 16,
    marginTop: 20,
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
