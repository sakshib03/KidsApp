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
  Animated,
  Easing,
} from "react-native";
import { router } from "expo-router";
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./config";

export default function Dashboard() {
  const [parentData, setParentData] = useState(null);
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [expandedDates, setExpandedDates] = useState(new Set());

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.message === "Child unblocked successfully") {
        Alert.alert("Success", "Child has been unblocked successfully!");
        fetchParentDashboard();
      } else {
        Alert.alert("Error", result.message || "Failed to unblock child");
      }
    } catch (error) {
      console.error("Error unblocking child:", error);
      Alert.alert("Error", "Failed to unblock child. Please try again.");
    }
  };

  const handleLogout = async () => {
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
      router.replace("/(tabs)/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
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
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
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
    const dates = Object.keys(chatHistory).sort((a, b) => new Date(b) - new Date(a));
    
    return dates.map(date => ({
      date,
      formattedDate: formatDateHeader(date),
      messages: chatHistory[date].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    }));
  };

  const getFlaggedWords = () => {
    if (!childrenData[selectedChild]?.flagged_messages) return " ";

    const flaggedMessages = childrenData[selectedChild].flagged_messages;

    if (!flaggedMessages || flaggedMessages.length === 0) return "No flagged messages! Great job! 🎉";

    let flaggedWords = "";

    flaggedMessages.forEach((msg) => {
      flaggedWords += `[${new Date(msg.timestamp).toLocaleString()}]\n${msg.message}\n\n`;
    });

    return flaggedWords;
  };

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
      source={require("@/assets/images/background.png")}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleLogout}>
              <Feather name="log-out" size={20} color={"#fff"} />
              <Text style={styles.backButtonText}>Logout</Text>
            </TouchableOpacity>
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
                        selectedChild === index && styles.childOptionTextSelected,
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
                <View style={styles.onlineIndicator} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.childName}>
                  {currentChild?.profile?.fullname || "Little Explorer"}
                </Text>
                <View style={styles.lastLogin}>
                  <Text style={styles.lastLoginText}>
                    Last login: {formatDate(currentChild?.profile?.last_login)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#FFD166' }]}>
                  <FontAwesome5 name="star" size={16} color="#fff" />
                </View>
                <Text style={styles.statValue}>{credits.total?.toString() || "0"}</Text>
                <Text style={styles.statLabel}>Total Score</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#56BBF1' }]}>
                  <FontAwesome5 name="graduation-cap" size={14} color="#fff" />
                </View>
                <Text style={styles.statValue}>
                  {currentChild?.profile?.default_dream_career || "N/A"}
                </Text>
                <Text style={styles.statLabel}>Dream Career</Text>
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
                    <Text style={styles.infoText}>
                      {getFlaggedWords()}
                    </Text>
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
                      chatHistoryByDate.map(({ date, formattedDate, messages }) => (
                        <View key={date} style={styles.dateSection}>
                          <TouchableOpacity 
                            style={styles.dateHeader}
                            onPress={() => toggleDateExpansion(date)}
                          >
                            <View style={styles.dateHeaderLeft}>
                              <Feather 
                                name={expandedDates.has(date) ? "chevron-down" : "chevron-right"} 
                                size={16} 
                                color="#56BBF1" 
                              />
                              <Text style={styles.dateHeaderText}>{formattedDate}</Text>
                              <Text style={styles.messageCount}>
                                ({messages.length} messages)
                              </Text>
                            </View>
                          </TouchableOpacity>
                          
                          {expandedDates.has(date) && (
                            <View style={styles.messagesContainer}>
                              {messages.map((chat, index) => (
                                <View key={index} style={styles.chatItem}>
                                  <View style={styles.messageRow}>
                                    <Text style={styles.userLabel}>You:</Text>
                                    <Text style={styles.messageText}>{chat.message}</Text>
                                  </View>
                                  <View style={styles.messageRow}>
                                    <Text style={styles.botLabel}>AI:</Text>
                                    <Text style={styles.messageText}>{chat.response}</Text>
                                  </View>
                                  <Text style={styles.timestamp}>
                                    {new Date(chat.timestamp).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      ))
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
                onPress={() => router.push("/(tabs)/changePassword")}
              >
                <MaterialIcons name="lock" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Change Child Password</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.successButton]}
                onPress={handleUnblockChild}
              >
                <MaterialIcons name="lock-open" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Unblock Child</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.infoButton]}
                onPress={() => router.push("/(tabs)/changeParentPass")}
              >
                <Feather name="shield" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Change Parent Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
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
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B8B",
    paddingVertical: 8,
    paddingHorizontal: 16,
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
    fontFamily: "ComicRelief-Regular",
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
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
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
    padding: 12,
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
    padding: 14,
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
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#56bbf1",
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
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
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
});