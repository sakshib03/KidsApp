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
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./config";
import * as Font from "expo-font";

export default function Dashboard() {
  const [parentData, setParentData] = useState(null);
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(0);

  useEffect(() => {
    fetchParentDashboard();
  }, []);

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
        console.log("Child has been unblocked successfully!");
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

  const getChatHistoryText = () => {
    if (!childrenData[selectedChild]?.chat_history) return "";

    const chatHistory = childrenData[selectedChild].chat_history;
    let historyText = "";

    Object.keys(chatHistory).forEach((date) => {
      chatHistory[date].forEach((chat) => {
        historyText += `[${new Date(chat.timestamp).toLocaleString()}]\n`;
        historyText += `You: ${chat.message}\n`;
        historyText += `AI: ${chat.response}\n\n`;
      });
    });

    return historyText;
  };

  const getFlaggedWords = () => {
    if (!childrenData[selectedChild]?.flagged_messages) return "";

    const flaggedMessages = childrenData[selectedChild].flagged_messages;
    let flaggedWords = "";

    flaggedMessages.forEach((msg) => {
      flaggedWords += `[${new Date(msg.timestamp).toLocaleString()}] ${
        msg.message
      }\n`;
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
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ImageBackground>
    );
  }

  const currentChild = childrenData[selectedChild];
  const credits = currentChild?.profile?.credits || {};

  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={handleLogout}>
            <Feather name="arrow-left" size={24} color={"#fff"} />
            <Text style={styles.backButtonText}>Logout</Text>
          </TouchableOpacity>

          {/* Child Selection */}
          {childrenData.length > 1 && (
            <View style={styles.childSelector}>
              <Text style={styles.selectorLabel}>Select Child:</Text>
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

          <View style={styles.mainContainer}>
            <Text style={styles.userName}>
              Child Name: {currentChild?.profile?.fullname || "N/A"}
            </Text>
            <Text style={styles.userName}>
              Last Login: {formatDate(currentChild?.profile?.last_login)}
            </Text>

            <View style={styles.subContainer}>
              <View style={styles.columnsContainer}>
                <View style={styles.column}>
                  <View style={styles.inputField}>
                    <Text style={styles.input}>Total Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={credits.total?.toString() || "0"}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.input}>Story Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={credits.story?.toString() || "0"}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.input}>Quiz Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={credits.quiz?.toString() || "0"}
                      editable={false}
                    />
                  </View>
                  <View style={styles.inputField}>
                    <Text style={styles.input}>Chat Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={credits.chat?.toString() || "0"}
                      editable={false}
                    />
                  </View>
                </View>

                <View style={styles.column}>
                  <View style={styles.inputField}>
                    <Text style={styles.input}>Dream Career</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={
                        currentChild?.profile?.default_dream_career || "N/A"
                      }
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.input}>Question Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={credits.question?.toString() || "0"}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.input}>Joke Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={credits.joke?.toString() || "0"}
                      editable={false}
                    />
                  </View>
                  <View style={styles.inputField}>
                    <Text style={styles.input}>Game Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value="0" // Assuming this isn't in the API response
                      editable={false}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.subContainer}>
              <Text style={styles.input}>Used Wrong Words:</Text>
              <TextInput
                style={[styles.inputText, styles.multilineInputText]}
                multiline
                value={getFlaggedWords()}
                editable={false}
              />
            </View>
          </View>

          <View style={styles.subContainer}>
            <Text style={[styles.input, { color: "#182198ff", fontSize: 16 }]}>
              Chat History:
            </Text>
            <TextInput
              style={[styles.inputText, styles.multilineInput]}
              multiline
              value={getChatHistoryText()}
              editable={false}
            />
          </View>

          <View style={styles.buttonsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/(tabs)/changePassword")}
              >
                <Text style={styles.actionButtonText}>
                  Change Child Password
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleUnblockChild}
              >
                <Text style={styles.actionButtonText}>Unblock Child</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/(tabs)/changeParentPass")}
              >
                <Text style={styles.actionButtonText}>
                  Change Your Password
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
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
  },
  container: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "ComicRelief-Regular",
  },
  backButton: {
    maxWidth: 120,
    left: 0,
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#f66c46ff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 20,
  },
  parentInfo: {
    backgroundColor: "#468df6ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  parentName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "ComicRelief-Regular",
  },
  parentEmail: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "ComicRelief-Regular",
  },
  childSelector: {
    marginBottom: 16,
  },
  selectorLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "ComicRelief-Regular",
  },
  childOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#468df6ff",
    borderRadius: 20,
    marginRight: 8,
  },
  childOptionSelected: {
    backgroundColor: "#f66c46ff",
  },
  childOptionText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "ComicRelief-Regular",
  },
  childOptionTextSelected: {
    fontWeight: "bold",
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 20,
    marginTop: 20,
    marginBottom:40
  },
  actionButton: {
    flex: 1,
    minWidth: 180,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#468df6ff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight:10
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "ComicRelief-Regular",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
    marginLeft: 5,
    fontFamily: "ComicRelief-Regular",
  },
  mainContainer: {
    width: "100%",
    padding: 12,
    borderRadius: 4,
    backgroundColor: "#67b8faff",
  },
  subContainer: {
    backgroundColor: "#9cd2ffff",
    padding: 16,
    justifyContent: "center",
    borderRadius: 14,
    marginTop: 16,
  },
  columnsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 14,
    justifyContent: "center",
  },
  column: {
    flex: 1,
  },
  userName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
  },
  inputField: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 8,
  },
  input: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    color: "#222222ff",
    fontFamily: "ComicRelief-Regular",
  },
  inputText: {
    width: "100%",
    marginTop: 6,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    fontFamily: "ComicRelief-Regular",
  },
  multilineInputText: {
    minHeight: 50,
    textAlignVertical: "top",
  },
  multilineInput: {
    minHeight: 300,
    textAlignVertical: "top",
  },
  nonEditableInput: {
    backgroundColor: "#f5f5f5",
    color: "#363636ff",
  },
});
