import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { API_BASE } from "../utils/config";

export default function Dashboard() {
  const [parentData, setParentData] = useState(null);
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [expandedDates, setExpandedDates] = useState(new Set());
  const [blockedStatus, setBlockedStatus] = useState({});
  
  // Date Picker State
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Credit History States
  const [isCreditHistoryModalVisible, setIsCreditHistoryModalVisible] =
    useState(false);
  const [creditHistory, setCreditHistory] = useState([]);
  const [creditHistoryLoading, setCreditHistoryLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [filteredCreditHistory, setFilteredCreditHistory] = useState([]);

  useEffect(() => {
    const loadBlockedStatus = async () => {
      try {
        const savedStatus = await AsyncStorage.getItem("blockedStatus");
        if (savedStatus) {
          setBlockedStatus(JSON.parse(savedStatus));
        }
      } catch (error) {
        console.error("Error loading blocked status:", error);
      }
    };

    loadBlockedStatus();
  }, []);

  useEffect(() => {
    const saveBlockedStatus = async () => {
      try {
        await AsyncStorage.setItem(
          "blockedStatus",
          JSON.stringify(blockedStatus)
        );
      } catch (error) {
        console.error("Error saving blocked status:", error);
      }
    };

    if (Object.keys(blockedStatus).length > 0) {
      saveBlockedStatus();
    }
  }, [blockedStatus]);

  useEffect(() => {
    fetchParentDashboard();
  }, []);

  useEffect(() => {
    // Animation when data loads
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  // Date Picker Functions (same as signup page)
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    setSelectedDate(formattedDate);
    hideDatePicker();
  };

  const fetchParentDashboard = async () => {
    try {
      const parentId = await AsyncStorage.getItem("parentId");
      const accessToken = await AsyncStorage.getItem("accessToken");

      if (!parentId || !accessToken) {
        Alert.alert("Error", "No parent ID or access token found");
        return;
      }

      const response = await fetch(`${API_BASE}/parent-dashboard/${parentId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setParentData(data.parent);
      setChildrenData(data.children);

      setBlockedStatus((prev) => {
        const newStatus = { ...prev };
        data.children.forEach((child) => {
          if (newStatus[child.profile.id] === undefined) {
            newStatus[child.profile.id] = false; // Default to unblocked
          }
        });
        return newStatus;
      });

      await AsyncStorage.setItem("parentData", JSON.stringify(data.parent));
      await AsyncStorage.setItem("childrenData", JSON.stringify(data.children));
      await AsyncStorage.setItem(
        "childId",
        data.children[0]?.profile?.id.toString()
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    if (!selectedDate) {
      setFilteredCreditHistory(creditHistory);
      return;
    }
    const filtered = creditHistory.filter((item) => {
      const itemDate = new Date(item.timestamp).toISOString().split("T")[0];
      return itemDate === selectedDate;
    });
    setFilteredCreditHistory(filtered);
  };

  const handleClearFilter = () => {
    setSelectedDate("");
    setFilteredCreditHistory(creditHistory);
  };

  useEffect(() => {
    setFilteredCreditHistory(creditHistory);
  }, [creditHistory]);

  // Fetch Credit History Function
  const fetchCreditHistory = async () => {
    try {
      setCreditHistoryLoading(true);
      setSelectedDate("");

      const parentId = await AsyncStorage.getItem("parentId");
      const accessToken = await AsyncStorage.getItem("accessToken");
      const currentChildId = childrenData[selectedChild]?.profile?.id;

      if (!parentId || !accessToken || !currentChildId) {
        Alert.alert(
          "Oops!",
          "Missing required information to fetch credit history."
        );
        return;
      }

      const response = await fetch(
        `${API_BASE}/credit-history/${parentId}/${currentChildId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCreditHistory(data.credit_history || []);
      setFilteredCreditHistory(data.credit_history || []);
      setIsCreditHistoryModalVisible(true);
    } catch (error) {
      console.error("Error fetching credit history:", error);
      Alert.alert("Oops!", "Couldn't load credit history");
    } finally {
      setCreditHistoryLoading(false);
    }
  };

  const isChildBlocked = () => {
    const currentChildId = childrenData[selectedChild]?.profile?.id;
    return blockedStatus[currentChildId] === true;
  };

  const handleBlockChild = async () => {
    try {
      const parentId = await AsyncStorage.getItem("parentId");
      const accessToken = await AsyncStorage.getItem("accessToken");
      const currentChildId = childrenData[selectedChild]?.profile?.id;

      if (!parentId || !accessToken || !currentChildId) {
        Alert.alert("Error", "Missing required data to block child");
        return;
      }

      const response = await fetch(`${API_BASE}/block-child`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          parent_id: parseInt(parentId),
          child_id: currentChildId,
        }),
      });

      const result = await response.json();

      if (response.status === 200 || response.status === 409) {
        if (response.status === 200) {
          Alert.alert("Success", "Child has been blocked successfully!");
        } else {
          Alert.alert("Info", result.detail || "Child is already blocked");
        }
        console.log("Child blocked successfully");

        setBlockedStatus((prev) => ({
          ...prev,
          [currentChildId]: true,
        }));
      } else {
        throw new Error(
          result.detail || result.message || "Failed to block child"
        );
      }
    } catch (error) {
      console.error("Error in block child:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to block child. Please try again."
      );
    }
  };

  const handleUnblockChild = async () => {
    try {
      const parentId = await AsyncStorage.getItem("parentId");
      const accessToken = await AsyncStorage.getItem("accessToken");
      const currentChildId = childrenData[selectedChild]?.profile?.id;

      if (!parentId || !accessToken || !currentChildId) {
        Alert.alert("Error", "Missing required data to unblock child");
        return;
      }

      const response = await fetch(`${API_BASE}/unblock-child`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          parent_id: parseInt(parentId),
          child_id: currentChildId,
        }),
      });

      const result = await response.json();

      if (response.status === 200 || response.status === 409) {
        if (response.status === 200) {
          Alert.alert("Success", "Child has been unblocked successfully!");
        } else {
          Alert.alert("Info", result.detail || "Child is already unblocked");
        }
        console.log("Child unblocked successfully");

        setBlockedStatus((prev) => ({
          ...prev,
          [currentChildId]: false,
        }));
      } else {
        throw new Error(
          result.detail || result.message || "Failed to unblock child"
        );
      }
    } catch (error) {
      console.error("Error unblocking child:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to unblock child. Please try again."
      );
    }
  };

  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove([
              "accessToken",
              "loginTime",
              "userType",
              "childId",
              "parentId",
              "userData",
              "parentData",
              "childrenData",
            ]);
            router.replace("/(tabs)/auth/login");
          } catch (error) {
            console.error("Error during logout:", error);
          }
        },
      },
    ]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const toggleDateExpansion = (date) => {
    const newExpandedDates = new Set(expandedDates);
    if (newExpandedDates.has(date)) {
      newExpandedDates.delete(date);
    } else {
      newExpandedDates.add(date);
    }
    setExpandedDates(newExpandedDates);
  };

  const getChatHistoryByDate = () => {
    if (!childrenData[selectedChild]?.chat_history) return [];

    const chatHistory = childrenData[selectedChild].chat_history;
    const dates = Object.keys(chatHistory).sort(
      (a, b) => new Date(b) - new Date(a)
    );

    return dates.map((date) => ({
      date,
      formattedDate: formatDateHeader(date),
      messages: chatHistory[date].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      ),
    }));
  };

  const getFlaggedWords = () => {
    if (!childrenData[selectedChild]?.flagged_messages) return " ";

    const flaggedMessages = childrenData[selectedChild].flagged_messages;

    if (!flaggedMessages || flaggedMessages.length === 0)
      return "No flagged messages! Great job!";

    let flaggedWords = "";

    flaggedMessages.forEach((msg) => {
      flaggedWords += `[${new Date(msg.timestamp).toLocaleString()}]\n${
        msg.message
      }\n\n`;
    });

    return flaggedWords;
  };

  // Credit History Item Component
  const CreditHistoryItem = ({ item, index }) => (
    <View
      style={[
        styles.creditHistoryItem,
        index % 2 === 0
          ? styles.creditHistoryItemEven
          : styles.creditHistoryItemOdd,
      ]}
    >
      <View style={styles.creditHistoryLeft}>
        <Text style={styles.creditActivity}>
          {item.activity.charAt(0).toUpperCase() + item.activity.slice(1)}
        </Text>
        <Text style={styles.creditTimestamp}>
          {formatTimestamp(item.timestamp)}
        </Text>
      </View>
      <View style={styles.creditHistoryRight}>
        {item.credits_earned > 0 && (
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.creditEarned}>+{item.credits_earned}</Text>
            <MaterialIcons name="monetization-on" size={24} color="gold" />
          </View>
        )}
        {item.credits_lost > 0 && (
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.creditLost}>-{item.credits_lost}</Text>
            <MaterialIcons name="monetization-on" size={24} color="gold" />
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <ImageBackground
        source={require("@/assets/images/background.png")}
        style={styles.background}
      >
        <View style={styles.loadingContainer}>
          <View style={styles.loadingAnimation}>
            <FontAwesome5 name="robot" size={60} color="#FF6B8B" />
            <Text style={styles.loadingText}>Loading Adventure...</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  const currentChild = childrenData[selectedChild];
  const credits = currentChild?.profile?.credits || {};
  const chatHistoryByDate = getChatHistoryByDate();

  return (
    <ImageBackground
      source={require("@/assets/images/login_image.png")}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleLogout}>
              <Feather name="log-out" size={20} color={"#fff"} />
              <Text style={styles.backButtonText}>Logout</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={styles.creditHistoryIcon}>
                <MaterialIcons name="monetization-on" size={24} color="gold" />
                <Text style={styles.statValue}>
                  {credits.total?.toString() || "0"}
                </Text>
              </View>
              <View>
                <TouchableOpacity
                  style={styles.creditHistoryIcon}
                  onPress={fetchCreditHistory}
                >
                  <Ionicons name="card-outline" size={28} color="gold" />
                  <Text style={[styles.creditHistoryText, { marginLeft: 4 }]}>
                    Credits
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Child Selection */}
          {childrenData.length > 1 && (
            <View style={styles.childSelector}>
              <Text style={styles.selectorLabel}>👦 Select Your Child:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {childrenData.map((child, index) => (
                  <TouchableOpacity
                    key={child.profile.id}
                    style={[
                      styles.childOption,
                      selectedChild === index && styles.childOptionSelected,
                    ]}
                    onPress={() => setSelectedChild(index)}
                  >
                    <MaterialIcons
                      name="child-care"
                      size={16}
                      color={selectedChild === index ? "#FF6B8B" : "#56BBF1"}
                    />
                    <Text
                      style={[
                        styles.childOptionText,
                        selectedChild === index &&
                          styles.childOptionTextSelected,
                      ]}
                    >
                      {child.profile.fullname}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Main Card */}
          <View style={styles.mainCard}>
            {/* Child Profile */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={require("@/assets/images/user.jpg")}
                  style={styles.avatar}
                />
                <View
                  style={[
                    styles.onlineIndicator,
                    isChildBlocked()
                      ? styles.blockedIndicator
                      : styles.activeIndicator,
                  ]}
                />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.childName}>
                  {currentChild?.profile?.fullname || "Little Explorer"}
                </Text>
                <View style={styles.lastLogin}>
                  <Text style={styles.lastLoginText}>
                    Status: {isChildBlocked() ? "Blocked" : "Active"} • Last
                    login: {formatDate(currentChild?.profile?.last_login)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Info Sections */}
            <View style={styles.infoSections}>
              {/* Flagged Messages */}
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <MaterialIcons name="warning" size={18} color="#FF6B8B" />
                  <Text style={styles.infoTitle}>Flagged Messages</Text>
                </View>
                <View style={styles.infoContent}>
                  <ScrollView style={styles.flaggedScroll} nestedScrollEnabled>
                    <Text style={styles.infoText}>{getFlaggedWords()}</Text>
                  </ScrollView>
                </View>
              </View>

              {/* Chat History */}
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <Feather name="message-square" size={18} color="#56BBF1" />
                  <Text style={styles.infoTitle}>Chat History</Text>
                </View>
                <View style={styles.infoContent}>
                  <ScrollView style={styles.chatScroll} nestedScrollEnabled>
                    {chatHistoryByDate.length === 0 ? (
                      <Text style={styles.noChatsText}>
                        No chat history yet. Start chatting!
                      </Text>
                    ) : (
                      chatHistoryByDate.map(
                        ({ date, formattedDate, messages }) => (
                          <View key={date} style={styles.dateSection}>
                            <TouchableOpacity
                              style={styles.dateHeader}
                              onPress={() => toggleDateExpansion(date)}
                            >
                              <View style={styles.dateHeaderLeft}>
                                <Feather
                                  name={
                                    expandedDates.has(date)
                                      ? "chevron-down"
                                      : "chevron-right"
                                  }
                                  size={16}
                                  color="#56BBF1"
                                />
                                <Text style={styles.dateHeaderText}>
                                  {formattedDate}
                                </Text>
                              </View>
                            </TouchableOpacity>

                            {expandedDates.has(date) && (
                              <View style={styles.messagesContainer}>
                                {messages.map((chat, index) => (
                                  <View key={index} style={styles.chatItem}>
                                    <View style={styles.messageRow}>
                                      <Text style={styles.userLabel}>You:</Text>
                                      <Text style={styles.messageText}>
                                        {chat.message}
                                      </Text>
                                    </View>
                                    <View style={styles.messageRow}>
                                      <Text style={styles.botLabel}>AI:</Text>
                                      <Text style={styles.messageText}>
                                        {chat.response}
                                      </Text>
                                    </View>
                                    <Text style={styles.timestamp}>
                                      {new Date(
                                        chat.timestamp
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        )
                      )
                    )}
                  </ScrollView>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => router.push("/(tabs)/components/changePassword")}
              >
                <MaterialIcons name="lock" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>
                  Change Child Password
                </Text>
              </TouchableOpacity>

              {isChildBlocked() ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.successButton]}
                  onPress={handleUnblockChild}
                >
                  <MaterialIcons name="lock-open" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Unblock Child</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.warningButton]}
                  onPress={handleBlockChild}
                >
                  <MaterialIcons name="block" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Block Child</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.infoButton]}
                onPress={() =>
                  router.push("/(tabs)/components/changeParentPass")
                }
              >
                <Feather name="shield" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>
                  Change Parent Password
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Credit History Modal */}
      <Modal
        visible={isCreditHistoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreditHistoryModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setIsCreditHistoryModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, styles.creditHistoryModal]}>
                <Text style={styles.modalTitle}>Credit History</Text>
                <Text style={styles.modalSubtitle}>
                  Track your child's coins journey! ✨
                </Text>

                {/* Date Filter Section with DateTimePicker */}
                <View style={styles.filterContainer}>
                  <Text style={styles.filterLabel}>Filter by Date:</Text>

                  <View style={styles.dateInputContainer}>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={showDatePicker}
                    >
                      <Text
                        style={[
                          styles.datePickerButtonText,
                          !selectedDate && { color: "#999" },
                        ]}
                      >
                        {selectedDate ? selectedDate : "Select Date"}
                      </Text>
                      <Feather name="calendar" size={20} color="#56BBF1" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.filterButtons}>
                    <TouchableOpacity
                      style={[styles.filterButton, styles.applyButton]}
                      onPress={handleDateFilter}
                    >
                      <Text style={styles.filterButtonText}>Apply Filter</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterButton, styles.clearButton]}
                      onPress={handleClearFilter}
                    >
                      <Text style={styles.filterButtonText}>Show All</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* DateTimePicker Modal */}
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  maximumDate={new Date()}
                  onConfirm={handleDateConfirm}
                  onCancel={hideDatePicker}
                />

                {creditHistoryLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator
                      size="large"
                      color="#56BBF1"
                      style={styles.spinner}
                    />
                    <Text style={styles.loadingText}>
                      Loading credit history...
                    </Text>
                  </View>
                ) : filteredCreditHistory.length > 0 ? (
                  <View style={styles.creditHistoryList}>
                    <FlatList
                      data={filteredCreditHistory}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={CreditHistoryItem}
                      showsVerticalScrollIndicator={false}
                      style={styles.creditHistoryFlatList}
                    />
                  </View>
                ) : (
                  <View style={styles.noCreditHistory}>
                    <Text style={styles.noCreditHistoryText}>
                      {selectedDate
                        ? "No credit history found for the selected date! 📅"
                        : "No credit history yet! \nYour child hasn't earned any coins yet. \nEncourage them to start chatting and playing! 🌟"}
                    </Text>
                  </View>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() => setIsCreditHistoryModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingAnimation: {
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "ComicRelief-Regular",
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B8B",
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
    fontFamily: "ComicRelief-Bold",
  },
  creditHistoryIcon: {
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  creditHistoryText: {
    color: "#fabf36ff",
    fontSize: 14,
    fontFamily: "ComicRelief-Bold",
    marginTop: 2,
  },
  childSelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    fontFamily: "ComicRelief-Bold",
  },
  childOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  childOptionSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderColor: "#FFD166",
  },
  childOptionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
    fontFamily: "ComicRelief-Regular",
  },
  childOptionTextSelected: {
    color: "#FFD166",
  },
  mainCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#56BBF1",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    backgroundColor: "#4CD964",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "ComicRelief-Bold",
    marginBottom: 4,
  },
  lastLogin: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastLoginText: {
    fontSize: 12,
    color: "#494949ff",
    marginLeft: 4,
    fontFamily: "ComicRelief-Regular",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f4bb35ff",
    fontFamily: "ComicRelief-Bold",
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#484848ff",
    fontFamily: "ComicRelief-Regular",
    textAlign: "center",
    marginTop: 4,
  },
  infoSections: {
    gap: 16,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#56BBF1",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
    fontFamily: "ComicRelief-Bold",
  },
  infoContent: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#4b4b4bff",
    lineHeight: 20,
    fontFamily: "ComicRelief-Regular",
  },
  flaggedScroll: {
    maxHeight: 120,
  },
  chatScroll: {
    maxHeight: 400,
  },
  noChatsText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    fontFamily: "ComicRelief-Regular",
    padding: 20,
  },
  dateSection: {
    marginBottom: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  dateHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#56bbf1",
    fontFamily: "ComicRelief-Bold",
    marginLeft: 8,
  },
  messageCount: {
    fontSize: 12,
    color: "#999",
    fontFamily: "ComicRelief-Regular",
    marginLeft: 8,
  },
  messagesContainer: {
    padding: 8,
  },
  chatItem: {
    backgroundColor: "#f8f9fa",
    padding: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  userLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FF6B8B",
    fontFamily: "ComicRelief-Bold",
    width: 30,
  },
  botLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4CD964",
    fontFamily: "ComicRelief-Bold",
    width: 30,
  },
  messageText: {
    flex: 1,
    fontSize: 12,
    color: "#333333ff",
    fontFamily: "ComicRelief-Regular",
    lineHeight: 16,
  },
  timestamp: {
    fontSize: 10,
    color: "#999",
    fontFamily: "ComicRelief-Regular",
    textAlign: "right",
    marginTop: 4,
  },
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButton: {
    backgroundColor: "#56BBF1",
  },
  successButton: {
    backgroundColor: "#4CD964",
  },
  infoButton: {
    backgroundColor: "#FF6B8B",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
    fontFamily: "ComicRelief-Bold",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 4,
    borderColor: "#FFD700",
  },
  creditHistoryModal: {
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "ComicRelief-Bold",
    color: "#FF6B8B",
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "ComicRelief-Regular",
    color: "#666",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  confirmButton: {
    backgroundColor: "#56BBF1",
  },
  modalButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "ComicRelief-Bold",
  },
  // Credit History specific styles
  creditHistoryList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  creditHistoryFlatList: {
    flexGrow: 0,
  },
  creditHistoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  creditHistoryItemEven: {
    backgroundColor: "#F8F9FA",
  },
  creditHistoryItemOdd: {
    backgroundColor: "#FFFFFF",
  },
  creditHistoryLeft: {
    flex: 1,
  },
  creditHistoryRight: {
    alignItems: "flex-end",
  },
  creditActivity: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "ComicRelief-Bold",
    marginBottom: 4,
  },
  creditTimestamp: {
    fontSize: 12,
    color: "#666",
    fontFamily: "ComicRelief-Regular",
  },
  creditEarned: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CD964",
    fontFamily: "ComicRelief-Bold",
  },
  creditLost: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B8B",
    fontFamily: "ComicRelief-Bold",
  },
  noCreditHistory: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  noCreditHistoryText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    lineHeight: 24,
  },
  // Filter styles
  filterContainer: {
    padding: 2,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
    fontFamily: "ComicRelief-Bold",
    marginLeft: 6,
  },
  dateInputContainer: {
    marginBottom: 15,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  datePickerButtonText: {
    fontSize: 14,
    fontFamily: "ComicRelief-Regular",
    color: "#333",
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  filterButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  applyButton: {
    backgroundColor: "#56BBF1",
  },
  clearButton: {
    backgroundColor: "#6c757d",
  },
  filterButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "ComicRelief-Bold",
  },
  warningButton: {
    backgroundColor: "#FF9500",
  },
  blockedIndicator: {
    backgroundColor: "#FF3B30",
  },
  activeIndicator: {
    backgroundColor: "#4CD964",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  blockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  blockedText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
    fontFamily: "ComicRelief-Bold",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f4bb35ff",
    fontFamily: "ComicRelief-Bold",
    textAlign: "center",
    marginLeft: 8,
  },
});