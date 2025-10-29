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

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [childId, setChildId] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(true);

  useEffect(() => {
    loadChildId();
  }, []);

  useEffect(() => {
    if (childId) {
      fetchUserData();
    }
  }, [childId]);

  useEffect(() => {
    if (childId && userData) {
      fetchAvatar();
    }
  }, [childId, userData]);

  const loadChildId = async () => {
    try {
      const storedChildId = await AsyncStorage.getItem("childId");
      console.log("Stored Child ID:", storedChildId);

      if (storedChildId) {
        setChildId(storedChildId);
      } else {
        Alert.alert("Error", "Child ID not found. Please login again.");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error getting child ID:", error);
      Alert.alert("Error", "Failed to initialize app");
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      if (!childId) {
        Alert.alert("Error", "Child ID not available");
        return;
      }

      console.log("Fetching data for child ID:", childId);

      const response = await fetch(`${API_BASE}/child-profile/${childId}`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched user data:", data);

      setUserData(data);
      setEditedData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvatar = async () => {
    try {
      setAvatarLoading(true);
      if (!childId || !userData) {
        console.log("No child ID or user data available for avatar fetch");
        return;
      }

      console.log("Fetching avatar for child ID:", childId);
      console.log("Dream career:", userData.default_dream_career);

      const response = await fetch(`${API_BASE}/set-avatar`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child_id: parseInt(childId),
          selected_career: userData.default_dream_career,
        }),
      });

      console.log("Avatar response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Avatar response data:", data);

      if (data.avatar) {
        const avatarFullUrl = `${API_BASE.replace('/kids/v1', '')}/v1/avatars/${data.avatar}`;
        console.log("Avatar URL set:", avatarFullUrl);
        setAvatarUrl(avatarFullUrl);
      } else {
        console.warn("No avatar returned from backend");
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error("Error fetching avatar:", error);
      setAvatarUrl(null);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarError = (error) => {
    console.log("Failed to load avatar:", error.nativeEvent);
    console.log("Failed URL:",avatarUrl);
    setAvatarUrl(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("@/assets/images/theme1.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </ImageBackground>
    );
  }

  if (!userData) {
    return (
      <ImageBackground
        source={require("@/assets/images/theme1.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          <Text style={styles.errorText}>Failed to load profile data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/theme1.png")}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/chatbot")}
          >
            <Feather name="arrow-left" size={24} color={"#fff"} />
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <View style={styles.mainContainer}>
            <View style={{ alignItems: "center" }}>
              <Image
                source={avatarUrl ? { uri: avatarUrl } : require("@/assets/images/user.jpg")}
                style={styles.logo}
                onError={handleAvatarError}
              />
              {avatarLoading && (
                <Text style={styles.avatarLoadingText}>Loading avatar...</Text>
              )}
              <Text style={styles.userName}>{userData.fullname}</Text>
              <Text style={styles.username}>@{userData.username}</Text>
            </View>

            <View style={styles.subContainer}>
              <View style={styles.columnsContainer}>
                <View style={styles.column}>
                  <View style={styles.inputField}>
                    <Text style={styles.input}>Total Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={userData.credits?.total?.toString() || "0"}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.input}>Gender</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={userData.gender}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.input}>Story Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={userData.credits?.story?.toString() || "0"}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.input}>Quiz Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={userData.credits?.quiz?.toString() || "0"}
                      editable={false}
                    />
                  </View>
                  <View style={styles.inputField}>
                    <Text style={styles.input}>Chat Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={userData.credits?.chat?.toString() || "0"}
                      editable={false}
                    />
                  </View>
                </View>

                <View style={styles.column}>
                  <View style={styles.inputField}>
                    <Text style={styles.input}>Dream Career</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={userData.default_dream_career}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.input}>DOB</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={formatDate(userData.dob)}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.input}>Question Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={userData.credits?.question?.toString() || "0"}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.input}>Joke Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={userData.credits?.joke?.toString() || "0"}
                      editable={false}
                    />
                  </View>
                  <View style={styles.inputField}>
                    <Text style={styles.input}>Game Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      value={userData.credits?.game?.toString() || "0"}
                      editable={false}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#33b445ff" }]}
              >
                <Text style={styles.buttonText}>Switch Career</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#ff4b4bff" }]}
              >
                <Text 
                style={styles.buttonText}
                onPress={()=> router.push("/(tabs)/redeemRewards")}
                >Redeem Rewards</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#1bc7c5ff" }]}
              >
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
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
    padding: 20,
    justifyContent: "center",
  },
  backButton: {
    width: 160,
    left: 0,
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#f66c46ff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 20,
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
  logo: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarLoadingText: {
    marginTop: 5,
    fontSize: 12,
    color: "#fff",
    fontFamily: "ComicRelief-Regular",
  },
  userName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
  },
  username: {
    marginTop: 4,
    fontSize: 14,
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
  nonEditableInput: {
    backgroundColor: "#f5f5f5",
    color: "#363636ff",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  button: {
    backgroundColor: "#56bbf1",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginTop: 12,
    alignItems: "center",
    flex: 1,
    minWidth: 160,
    maxWidth: 160,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    lineHeight: 16,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#f66c46ff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "ComicRelief-Regular",
  },
});
