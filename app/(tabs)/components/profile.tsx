import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTheme } from "../utils/ThemeContext";
import { API_BASE } from "../utils/config";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [childId, setChildId] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [isSwitchCareerModalVisible, setIsSwitchCareerModalVisible] =
    useState(false);
  const [selectedCareer, setSelectedCareer] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const { theme } = useTheme();

  // Credit History States
  const [isCreditHistoryModalVisible, setIsCreditHistoryModalVisible] =
    useState(false);
  const [creditHistory, setCreditHistory] = useState([]);
  const [creditHistoryLoading, setCreditHistoryLoading] = useState(false);

  const [bounceAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));

  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showCareerDropdown, setShowCareerDropdown] = useState(false);
  const [showOptionalCareer1Dropdown, setShowOptionalCareer1Dropdown] =
    useState(false);
  const [showOptionalCareer2Dropdown, setShowOptionalCareer2Dropdown] =
    useState(false);

  // Date Picker State
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Dropdown options
  const genderOptions = ["female", "male", "other"];
  const careerOptions = [
    "Doctor",
    "Engineer",
    "Teacher",
    "Scientist",
    "Artist",
    "Athlete",
    "Astronaut",
    "Veterinarian",
    "Actor/Actress",
    "Singer",
    "Police Officer",
    "Pilot",
    "Chef",
    "FireFighter",
    "Lawyer",
    "Fashion Designer",
    "Dancer",
    "Writer/Author",
    "Musician",
    "Architect",
    "Entrepreneur",
    "Computer Programmer/Software Developer",
    "Marine Biologist",
    "Archaeologist",
    "Environmental Scientist",
    "Other",
  ];

  useEffect(() => {
    loadChildId();
    startAnimations();
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

  const startAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slide in animation for content
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  // Date Picker Functions
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    handleInputChange("dob", formattedDate);
    hideDatePicker();
  };

  const loadChildId = async () => {
    try {
      const storedChildId = await AsyncStorage.getItem("childId");
      console.log("Stored Child ID:", storedChildId);

      if (storedChildId) {
        setChildId(storedChildId);
      } else {
        Alert.alert(
          "Oops!",
          "We couldn't find your profile. Please login again."
        );
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error getting child ID:", error);
      Alert.alert("Oops!", "Something went wrong!");
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      if (!childId) {
        Alert.alert("Oops!", "No child ID available");
        return;
      }

      const response = await fetch(`${API_BASE}/child-profile/${childId}`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUserData(data);
      console.log("User Data:", data);
      setEditedData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Oops!", "Couldn't load your profile");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Credit History
  const fetchCreditHistory = async () => {
    try {
      setCreditHistoryLoading(true);

      const parentId = await AsyncStorage.getItem("parentId");

      if (!parentId) {
        Alert.alert(
          "Oops!",
          "Parent information not found. Please login again."
        );
        return;
      }

      if (!childId) {
        Alert.alert("Oops!", "Child information not found.");
        return;
      }

      const response = await fetch(
        `${API_BASE}/credit-history/${parentId}/${childId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCreditHistory(data.credit_history || []);
      setIsCreditHistoryModalVisible(true);
    } catch (error) {
      console.error("Error fetching credit history:", error);
      Alert.alert("Oops!", "Couldn't load credit history");
    } finally {
      setCreditHistoryLoading(false);
    }
  };

  const fetchAvatar = async () => {
    try {
      setAvatarLoading(true);
      if (!childId || !userData?.default_dream_career) {
        console.log("Missing child ID or career data");
        return;
      }

      const directUrl = `${API_BASE}/avatar/${childId}?t=${Date.now()}`;
      const testResponse = await fetch(directUrl, { method: "HEAD" });

      if (testResponse.ok) {
        setAvatarUrl(directUrl);
        return;
      }

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

      if (response.ok) {
        const data = await response.json();
        if (data.avatar_url) {
          const fullUrl = `https://semantic.onesmarter.com${
            data.avatar_url
          }?t=${Date.now()}`;
          setAvatarUrl(fullUrl);
          console.log("Generated Avatar URL:", fullUrl); 
        } else {
          setAvatarUrl(null);
        }
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
    setAvatarUrl(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return moment(dateString).format("MM-DD-YYYY");
    } catch (error) {
      return dateString;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedData(userData);
      setShowGenderDropdown(false);
      setShowCareerDropdown(false);
      setShowOptionalCareer1Dropdown(false);
      setShowOptionalCareer2Dropdown(false);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);

      if (!childId || !editedData) {
        Alert.alert("Oops!", "No data to save");
        setIsSaving(false);
        return;
      }

      const updateData = {
        child_id: parseInt(childId),
        fullname: editedData.fullname,
        username: editedData.username,
        dob: editedData.dob,
        gender: editedData.gender,
        default_dream_career: editedData.default_dream_career,
        optional_dream_career_1: editedData.optional_dream_career_1,
        optional_dream_career_2: editedData.optional_dream_career_2,
      };

      const response = await fetch(`${API_BASE}/edit-profile`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setUserData(editedData);
      setIsEditing(false);

      if (userData.default_dream_career !== editedData.default_dream_career) {
        fetchAvatar();
      }

      Alert.alert("Yay!", "Profile updated successfully! 🎉");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Oops!", "Couldn't update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchCareer = async () => {
    if (!selectedCareer.trim()) {
      Alert.alert("Wait!", "Please pick a new career! 🎯");
      setIsSwitching(false);
      return;
    }

    try {
      setIsSwitching(true);
      const switchData = {
        child_id: parseInt(childId),
        selected_career: selectedCareer,
      };

      const response = await fetch(`${API_BASE}/switch-career`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(switchData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      await fetchUserData();

      setIsSwitchCareerModalVisible(false);
      setSelectedCareer("");

      Alert.alert("Awesome!", `You're now a ${selectedCareer}! 🚀`);
    } catch (error) {
      console.error("Error switching career:", error);
      Alert.alert("Oops!", "Couldn't switch career");
    } finally {
      setIsSwitching(false);
    }
  };

  const getAvailableCareers = () => {
    const careers = [];
    if (userData.optional_dream_career_1) {
      careers.push(userData.optional_dream_career_1);
    }
    if (userData.optional_dream_career_2) {
      careers.push(userData.optional_dream_career_2);
    }
    return careers.filter((career) => career !== userData.default_dream_career);
  };

  const DropdownModal = ({
    visible,
    options,
    onSelect,
    onClose,
    dropdownType,
  }) => (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <View style={styles.dropdownList}>
          <Text style={styles.dropdownTitle}>
            Choose {dropdownType === "gender" ? "Gender" : "Career"} ✨
          </Text>
          <FlatList
            data={options}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => onSelect(item)}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

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
          <Text style={styles.creditEarned}>+{item.credits_earned} ⭐</Text>
        )}
        {item.credits_lost > 0 && (
          <Text style={styles.creditLost}>-{item.credits_lost} ⭐</Text>
        )}
      </View>
    </View>
  );

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  if (loading) {
    return (
      <ImageBackground
        // source={require("@/assets/images/theme1.png")}
        style={styles.background}
        source={theme.background}
      >
        <View style={styles.loadingCon}>
          <ActivityIndicator
            size="large"
            color="#FFD700"
            style={styles.spinner}
          />
          <Text
            style={{
              color: "#fa6f6fff",
              marginTop: 20,
              fontFamily: "ComicRelief-Regular",
              fontSize: 18,
            }}
          >
            Loading your awesome profile... 🌟
          </Text>
        </View>
      </ImageBackground>
    );
  }

  if (!userData) {
    return (
      <ImageBackground
        // source={require("@/assets/images/theme1.png")}
        style={styles.background}
        source={theme.background}
      >
        <View style={styles.container}>
          <Text style={styles.errorText}>Couldn't load your profile 😢</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
            <Text style={styles.retryButtonText}>Try Again 🔄</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      // source={require("@/assets/images/theme1.png")}
      style={styles.background}
      source={theme.background}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animated.View
            style={[styles.container, { transform: [{ translateY }] }]}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push("/(tabs)/components/chatbot")}
              >
                <Feather name="arrow-left" size={24} color={"#fff"} />
                <Text style={styles.backButtonText}>Back to Fun! 🏠</Text>
              </TouchableOpacity>
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
              <TouchableOpacity
                style={styles.creditHistoryIcon}
                onPress={fetchCreditHistory}
              >
                <Ionicons name="card-outline" size={28} color="#f4bb35ff" />
                <Text style={styles.creditHistoryText}>Credits</Text>
              </TouchableOpacity>
              <View style={styles.avatarSection}>
                <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                  {/* <ImageBackground
                  source={require("../../../assets/images/rewards/profile_frame1.png")}
                  style={styles.avatarBackground}
                  > */}
                  <Image
                    source={
                      avatarUrl
                        ? {
                            uri: avatarUrl,
                            cache: "reload",
                          }
                        : require("@/assets/images/user.jpg")
                    }
                    style={styles.avatar}
                    onError={handleAvatarError}
                    key={avatarUrl}
                  />
                  {/* </ImageBackground> */}
                </Animated.View>

                {avatarLoading && (
                  <Text style={styles.avatarLoadingText}>
                    Creating your avatar... 🎨
                  </Text>
                )}

                <View style={styles.nameSection}>
                  {isEditing ? (
                    <>
                      <TextInput
                        style={[styles.editableInput, styles.userNameInput]}
                        value={editedData.fullname}
                        onChangeText={(text) =>
                          handleInputChange("fullname", text)
                        }
                        placeholder="Your Full Name"
                        placeholderTextColor="#888"
                      />
                      <TextInput
                        style={[styles.editableInput, styles.usernameInput]}
                        value={editedData.username}
                        onChangeText={(text) =>
                          handleInputChange("username", text)
                        }
                        placeholder="Cool Username"
                        placeholderTextColor="#888"
                      />
                    </>
                  ) : (
                    <>
                      <Text style={styles.userName}>{userData.fullname}</Text>
                      <Text style={styles.username}>
                        @{userData.username} ✨
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {/* Stats Grid */}
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {userData.credits?.total_credits?.toString() || "0"}
                    </Text>
                    <Text style={styles.statLabel}>Total Score⭐</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {userData.credits?.quiz?.toString() || "0"}
                    </Text>
                    <Text style={styles.statLabel}>Quiz 🧩</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {userData.credits?.chat_credits_earned?.toString() || "0"}
                    </Text>
                    <Text style={styles.statLabel}>Chat Credit Earned📚</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {userData.credits?.chat_credits_lost?.toString() || "0"}
                    </Text>
                    <Text style={styles.statLabel}>Chat Credit Lost📚</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {userData.credits?.joke?.toString() || "0"}
                    </Text>
                    <Text style={styles.statLabel}>Joke 🧩</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {userData.credits?.story?.toString() || "0"}
                    </Text>
                    <Text style={styles.statLabel}>Story 🏠</Text>
                  </View>
                  {/* <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {userData.credits?.game?.toString() || "0"}
                  </Text>
                  <Text style={styles.statLabel}>Game 🧩</Text>
                </View> */}
                </View>
              </ScrollView>

              {/* Profile Details */}
              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Dream Career</Text>
                    {isEditing ? (
                      <TouchableOpacity
                        style={[
                          styles.inputText,
                          styles.editableInput,
                          styles.dropdownButton,
                        ]}
                        onPress={() => setShowCareerDropdown(true)}
                      >
                        <Text
                          style={[
                            !editedData.default_dream_career && {
                              color: "#888",
                            },
                          ]}
                        >
                          {editedData.default_dream_career ||
                            "Pick Your Dream! ✨"}
                        </Text>
                        <Feather
                          name="chevron-down"
                          size={16}
                          color="#FF6B6B"
                        />
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.inputText, styles.nonEditableInput]}>
                        <Text style={styles.detailValue}>
                          {userData.default_dream_career}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Birthday</Text>
                    {isEditing ? (
                      <>
                        <TouchableOpacity
                          style={[
                            styles.inputText,
                            styles.editableInput,
                            styles.dropdownButton,
                          ]}
                          onPress={showDatePicker}
                        >
                          <Text
                            style={[
                              !editedData.dob && { color: "#888" }
                            ]}
                          >
                            {editedData.dob ? moment(editedData.dob).format("MM-DD-YYYY") : "Select Birthday"}
                          </Text>
                          <Feather name="calendar" size={16} color="#FF6B6B" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={[styles.inputText, styles.nonEditableInput]}>
                        <Text style={styles.detailValue}>
                          {formatDate(userData.dob)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Gender</Text>
                    {isEditing ? (
                      <TouchableOpacity
                        style={[
                          styles.inputText,
                          styles.editableInput,
                          styles.dropdownButton,
                        ]}
                        onPress={() => setShowGenderDropdown(true)}
                      >
                        <Text style={[!editedData.gender && { color: "#888" }]}>
                          {editedData.gender || "Select"}
                        </Text>
                        <Feather
                          name="chevron-down"
                          size={16}
                          color="#FF6B6B"
                        />
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.inputText, styles.nonEditableInput]}>
                        <Text style={styles.detailValue}>
                          {userData.gender}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Other Career 1</Text>
                    {isEditing ? (
                      <TouchableOpacity
                        style={[
                          styles.inputText,
                          styles.editableInput,
                          styles.dropdownButton,
                        ]}
                        onPress={() => setShowOptionalCareer1Dropdown(true)}
                      >
                        <Text
                          style={[
                            !editedData.optional_dream_career_1 && {
                              color: "#888",
                            },
                          ]}
                        >
                          {editedData.optional_dream_career_1 ||
                            "Another Dream?"}
                        </Text>
                        <Feather
                          name="chevron-down"
                          size={16}
                          color="#FF6B6B"
                        />
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.inputText, styles.nonEditableInput]}>
                        <Text style={styles.detailValue}>
                          {userData.optional_dream_career_1 || "Not set"}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Other Career 2</Text>
                    {isEditing ? (
                      <TouchableOpacity
                        style={[
                          styles.inputText,
                          styles.editableInput,
                          styles.dropdownButton,
                        ]}
                        onPress={() => setShowOptionalCareer2Dropdown(true)}
                      >
                        <Text
                          style={[
                            !editedData.optional_dream_career_2 && {
                              color: "#888",
                            },
                          ]}
                        >
                          {editedData.optional_dream_career_2 ||
                            "One More Dream?"}
                        </Text>
                        <Feather
                          name="chevron-down"
                          size={16}
                          color="#FF6B6B"
                        />
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.inputText, styles.nonEditableInput]}>
                        <Text style={styles.detailValue}>
                          {userData.optional_dream_career_2 || "Not set"}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {isEditing ? (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator
                          size="small"
                          color="#fff"
                          style={styles.spinner}
                        />
                        <Text style={styles.buttonText}>Saving...</Text>
                      </View>
                    ) : (
                      <Text style={styles.buttonText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleEditToggle}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.button, styles.careerButton]}
                      onPress={() => setIsSwitchCareerModalVisible(true)}
                    >
                      <Text style={styles.buttonText}>Switch Career</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, styles.rewardsButton]}
                      onPress={() =>
                        router.push("/(tabs)/components/redeemRewards")
                      }
                    >
                      <Text style={styles.buttonText}>Redeem Rewards</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.button, styles.editButton]}
                      onPress={handleEditToggle}
                    >
                      <Text style={styles.buttonText}>Edit Profile</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Dropdown Modals */}
        <DropdownModal
          visible={showGenderDropdown}
          options={genderOptions}
          onSelect={(value) => {
            handleInputChange("gender", value);
            setShowGenderDropdown(false);
          }}
          onClose={() => setShowGenderDropdown(false)}
          dropdownType="gender"
        />

        <DropdownModal
          visible={showCareerDropdown}
          options={careerOptions}
          onSelect={(value) => {
            handleInputChange("default_dream_career", value);
            setShowCareerDropdown(false);
          }}
          onClose={() => setShowCareerDropdown(false)}
          dropdownType="career"
        />

        <DropdownModal
          visible={showOptionalCareer1Dropdown}
          options={careerOptions}
          onSelect={(value) => {
            handleInputChange("optional_dream_career_1", value);
            setShowOptionalCareer1Dropdown(false);
          }}
          onClose={() => setShowOptionalCareer1Dropdown(false)}
          dropdownType="career"
        />

        <DropdownModal
          visible={showOptionalCareer2Dropdown}
          options={careerOptions}
          onSelect={(value) => {
            handleInputChange("optional_dream_career_2", value);
            setShowOptionalCareer2Dropdown(false);
          }}
          onClose={() => setShowOptionalCareer2Dropdown(false)}
          dropdownType="career"
        />

        {/* DateTimePicker Modal for Edit Mode */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          maximumDate={new Date()}
          minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 15))}
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
        />

        {/* Switch Career Modal */}
        <Modal
          visible={isSwitchCareerModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsSwitchCareerModalVisible(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => setIsSwitchCareerModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Switch Your Career! 🚀</Text>
                  <Text style={styles.modalSubtitle}>
                    Current: {userData.default_dream_career}
                  </Text>

                  <View style={styles.careerOptions}>
                    {getAvailableCareers().map((career, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.careerOption,
                          selectedCareer === career &&
                            styles.selectedCareerOption,
                        ]}
                        onPress={() => setSelectedCareer(career)}
                      >
                        <Text style={styles.careerOptionText}>{career}</Text>
                        {selectedCareer === career && (
                          <Feather name="check" size={20} color="#4ECDC4" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  {getAvailableCareers().length === 0 && (
                    <Text style={styles.noCareersText}>
                      No other careers to switch to yet! Add more career dreams
                      first! 🌈
                    </Text>
                  )}

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => {
                        setIsSwitchCareerModalVisible(false);
                        setSelectedCareer("");
                      }}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        styles.confirmButton,
                        (!selectedCareer ||
                          getAvailableCareers().length === 0) &&
                          styles.disabledButton,
                      ]}
                      onPress={handleSwitchCareer}
                      disabled={
                        !selectedCareer || getAvailableCareers().length === 0
                      }
                    >
                      {isSwitching ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator
                            size="small"
                            color="#fff"
                            style={styles.spinner}
                          />
                          <Text style={styles.buttonText}>Switching</Text>
                        </View>
                      ) : (
                        <Text style={styles.buttonText}>Let's Go!</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

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
                  <Text style={styles.modalTitle}>Credit History 💫</Text>
                  <Text style={styles.modalSubtitle}>
                    Your amazing journey of earning stars!✨
                  </Text>

                  {creditHistoryLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator
                        size="large"
                        color="#4ECDC4"
                        style={styles.spinner}
                      />
                      <Text style={styles.loadingText}>
                        Loading your credit history...
                      </Text>
                    </View>
                  ) : creditHistory.length > 0 ? (
                    <View style={styles.creditHistoryList}>
                      <FlatList
                        data={creditHistory}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={CreditHistoryItem}
                        showsVerticalScrollIndicator={false}
                        style={styles.creditHistoryFlatList}
                      />
                    </View>
                  ) : (
                    <View style={styles.noCreditHistory}>
                      <Text style={styles.noCreditHistoryText}>
                        No credit history yet! {"\n"}
                        Start chatting, playing games, and taking quizzes to
                        earn stars! 🌟
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.confirmButton]}
                      onPress={() => setIsCreditHistoryModalVisible(false)}
                    >
                      <Text style={styles.modalButtonText}>Got It! 👍</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </KeyboardAvoidingView>
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
    marginTop:25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    backgroundColor: "#FF6B6B",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
    fontFamily: "ComicRelief-Regular",
  },
  profileCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 30,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  creditHistoryIcon: {
    position: "absolute",
    right: 20,
    top: 20,
    alignItems: "center",
    borderRadius: 20,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  creditHistoryText: {
    color: "#f85c5cff",
    fontSize: 12,
    fontFamily: "ComicRelief-Bold",
    marginTop: 2,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarBackground: {
    width: 170,
    height: 170,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#4ECDC4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarLoadingText: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    fontFamily: "ComicRelief-Regular",
  },
  nameSection: {
    alignItems: "center",
    marginTop: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  userNameInput: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    color: "#333",
    borderBottomWidth: 2,
    borderBottomColor: "#4ECDC4",
  },
  username: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    marginTop: 4,
  },
  usernameInput: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    color: "#666",
    borderBottomWidth: 2,
    borderBottomColor: "#4ECDC4",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(78, 205, 196, 0.1)",
    padding: 14,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4ECDC4",
    gap:12
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
    fontFamily: "ComicRelief-Regular",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: "ComicRelief-Regular",
    textAlign: "center",
    marginTop: 4,
  },
  detailsSection: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    fontFamily: "ComicRelief-Regular",
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontFamily: "ComicRelief-Regular",
  },
  inputText: {
    width: "100%",
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 2,
    borderRadius: 15,
    padding: 12,
    fontSize: 14,
    fontFamily: "ComicRelief-Regular",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  nonEditableInput: {
    backgroundColor: "#F8F9FA",
    borderColor: "#E9ECEF",
  },
  editableInput: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    borderColor: "#4ECDC4",
    borderWidth: 2,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: 24,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    flex: 1,
    minWidth: 140,
    maxWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  saveButton: {
    backgroundColor: "#4ECDC4",
  },
  cancelButton: {
    backgroundColor: "#ff5353ff",
  },
  careerButton: {
    backgroundColor: "#fc7346ff",
  },
  rewardsButton: {
    backgroundColor: "#FFD93D",
  },
  editButton: {
    backgroundColor: "#6C5CE7",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    marginTop: 16,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "ComicRelief-Regular",
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
    borderRadius: 30,
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
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "ComicRelief-Regular",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "ComicRelief-Regular",
    color: "#666",
  },
  careerOptions: {
    marginBottom: 24,
  },
  careerOption: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedCareerOption: {
    borderColor: "#4ECDC4",
    backgroundColor: "#E8F5E8",
  },
  careerOptionText: {
    fontSize: 16,
    fontFamily: "ComicRelief-Regular",
    color: "#333",
    flex: 1,
  },
  noCareersText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    fontFamily: "ComicRelief-Regular",
    marginBottom: 24,
    fontStyle: "italic",
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  cancelButton: {
    backgroundColor: "#FF6B6B",
  },
  confirmButton: {
    backgroundColor: "#4ECDC4",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  modalButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "ComicRelief-Regular",
  },
  // Dropdown Styles
  dropdownList: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    maxHeight: 400,
    width: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "ComicRelief-Regular",
    color: "#333",
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#FF6B6B",
    fontFamily: "ComicRelief-Regular",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  spinner: {
    marginRight: 4,
  },
  // Credit History Styles
  creditHistoryList: {
    maxHeight: 300,
    marginBottom: 20,
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
    fontFamily: "ComicRelief-Regular",
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
    color: "#4ECDC4",
    fontFamily: "ComicRelief-Regular",
  },
  creditLost: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
    fontFamily: "ComicRelief-Regular",
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
  loadingCon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 50,
    backgroundColor: "#fff",
  },
});