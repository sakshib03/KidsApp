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
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
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
  const [isSwitchCareerModalVisible, setIsSwitchCareerModalVisible] =
    useState(false);
  const [selectedCareer, setSelectedCareer] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Dropdown states
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showCareerDropdown, setShowCareerDropdown] = useState(false);
  const [showOptionalCareer1Dropdown, setShowOptionalCareer1Dropdown] =
    useState(false);
  const [showOptionalCareer2Dropdown, setShowOptionalCareer2Dropdown] =
    useState(false);

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
        const avatarFullUrl = `${API_BASE.replace("/kids/v1", "")}/v1/avatars/${
          data.avatar
        }`;
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
    console.log("Failed URL:", avatarUrl);
    setAvatarUrl(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD for input
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedData(userData);
      // Close all dropdowns when canceling edit
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
        Alert.alert("Error", "No data to save");
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

      console.log("Saving profile data:", updateData);

      const response = await fetch(`${API_BASE}/edit-profile`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      console.log("Save response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Profile update result:", result);

      // Update local state
      setUserData(editedData);
      setIsEditing(false);

      // Refresh avatar if career changed
      if (userData.default_dream_career !== editedData.default_dream_career) {
        fetchAvatar();
      }

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchCareer = async () => {
    if (!selectedCareer.trim()) {
      Alert.alert("Error", "Please select a career to switch to");
      setIsSwitching(false);
      return;
    }

    try {
      setIsSwitching(true);
      const switchData = {
        child_id: parseInt(childId),
        selected_career: selectedCareer,
      };

      console.log("Switching career:", switchData);

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
      console.log("Career switch result:", result);

      await fetchUserData();

      setIsSwitchCareerModalVisible(false);
      setSelectedCareer("");

      Alert.alert("Success", `Career switched to ${selectedCareer}`);
    } catch (error) {
      console.error("Error switching career:", error);
      Alert.alert("Error", "Failed to switch career");
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

  if (loading) {
    return (
      <ImageBackground
        source={require("@/assets/images/theme1.png")}
        style={styles.background}
      >
        <View style={styles.container}>
          <ActivityIndicator size="small" color="#fff" style={styles.spinner} />
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                  source={
                    avatarUrl
                      ? { uri: avatarUrl }
                      : require("@/assets/images/user.jpg")
                  }
                  style={styles.logo}
                  onError={handleAvatarError}
                />
                {avatarLoading && (
                  <Text style={styles.avatarLoadingText}>
                    Loading avatar...
                  </Text>
                )}

                {isEditing ? (
                  <>
                    <TextInput
                      style={[styles.editableInput, styles.userNameInput]}
                      value={editedData.fullname}
                      onChangeText={(text) =>
                        handleInputChange("fullname", text)
                      }
                      placeholder="Full Name"
                      placeholderTextColor="#888"
                    />
                    <TextInput
                      style={[styles.editableInput, styles.usernameInput]}
                      value={editedData.username}
                      onChangeText={(text) =>
                        handleInputChange("username", text)
                      }
                      placeholder="Username"
                      placeholderTextColor="#888"
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.userName}>{userData.fullname}</Text>
                    <Text style={styles.username}>@{userData.username}</Text>
                  </>
                )}
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
                      <Text style={styles.input}>Optional Dream Career 1</Text>
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
                              "Optional Career 1"}
                          </Text>
                          <Feather
                            name="chevron-down"
                            size={16}
                            color="#F25F3B"
                          />
                        </TouchableOpacity>
                      ) : (
                        <TextInput
                          style={[styles.inputText, styles.nonEditableInput]}
                          value={userData.optional_dream_career_1}
                          editable={false}
                        />
                      )}
                    </View>

                    <View style={styles.inputField}>
                      <Text style={styles.input}>Gender</Text>
                      {isEditing ? (
                        <TouchableOpacity
                          style={[
                            styles.inputText,
                            styles.editableInput,
                            styles.dropdownButton,
                          ]}
                          onPress={() => setShowGenderDropdown(true)}
                        >
                          <Text
                            style={[!editedData.gender && { color: "#888" }]}
                          >
                            {editedData.gender || "Select Gender"}
                          </Text>
                          <Feather
                            name="chevron-down"
                            size={16}
                            color="#F25F3B"
                          />
                        </TouchableOpacity>
                      ) : (
                        <TextInput
                          style={[styles.inputText, styles.nonEditableInput]}
                          value={userData.gender}
                          editable={false}
                        />
                      )}
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
                              "Select Dream Career"}
                          </Text>
                          <Feather
                            name="chevron-down"
                            size={16}
                            color="#F25F3B"
                          />
                        </TouchableOpacity>
                      ) : (
                        <TextInput
                          style={[styles.inputText, styles.nonEditableInput]}
                          value={userData.default_dream_career}
                          editable={false}
                        />
                      )}
                    </View>

                    <View style={styles.inputField}>
                      <Text style={styles.input}>Optional Dream Career 2</Text>
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
                              "Optional Career 2"}
                          </Text>
                          <Feather
                            name="chevron-down"
                            size={16}
                            color="#F25F3B"
                          />
                        </TouchableOpacity>
                      ) : (
                        <TextInput
                          style={[styles.inputText, styles.nonEditableInput]}
                          value={userData.optional_dream_career_2}
                          editable={false}
                        />
                      )}
                    </View>

                    <View style={styles.inputField}>
                      <Text style={styles.input}>DOB</Text>
                      {isEditing ? (
                        <TextInput
                          style={[styles.inputText, styles.editableInput]}
                          value={formatDate(editedData.dob)}
                          onChangeText={(text) =>
                            handleInputChange("dob", text)
                          }
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor="#888"
                        />
                      ) : (
                        <TextInput
                          style={[styles.inputText, styles.nonEditableInput]}
                          value={formatDate(userData.dob)}
                          editable={false}
                        />
                      )}
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
              {isEditing ? (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#33b445ff" }]}
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
                        <Text style={styles.buttonText}> Saving...</Text>
                      </View>
                    ) : (
                      <Text style={styles.buttonText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#ff4b4bff" }]}
                    onPress={handleEditToggle}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: "#33b445ff" }]}
                      onPress={() => setIsSwitchCareerModalVisible(true)}
                    >
                      <Text style={styles.buttonText}>Switch Career</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: "#ff4b4bff" }]}
                      onPress={() => router.push("/(tabs)/redeemRewards")}
                    >
                      <Text style={styles.buttonText}>Redeem Rewards</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: "#1bc7c5ff" }]}
                      onPress={handleEditToggle}
                    >
                      <Text style={styles.buttonText}>Edit Profile</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
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
                  <Text style={styles.modalTitle}>Switch Career</Text>
                  <Text style={styles.modalSubtitle}>
                    Current career: {userData.default_dream_career}
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
                      </TouchableOpacity>
                    ))}
                  </View>

                  {getAvailableCareers().length === 0 && (
                    <Text style={styles.noCareersText}>
                      No other careers available to switch to.
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
                          <Text style={styles.buttonText}> Switching...</Text>
                        </View>
                      ) : (
                        <Text style={styles.buttonText}>Switch</Text>
                      )}
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
  userNameInput: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    color: "#000",
  },
  username: {
    marginTop: 4,
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
  },
  usernameInput: {
    marginTop: 4,
    fontSize: 14,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    color: "#000",
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
  editableInput: {
    backgroundColor: "#ffffff",
    color: "#000000",
    borderColor: "#56bbf1",
    borderWidth: 2,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontSize: 18,
    fontWeight: 500,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "ComicRelief-Regular",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "ComicRelief-Regular",
    color: "#666",
  },
  careerOptions: {
    marginBottom: 20,
  },
  careerOption: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCareerOption: {
    borderColor: "#33b445ff",
    backgroundColor: "#e8f5e8",
  },
  careerOptionText: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    color: "#333",
  },
  noCareersText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    fontFamily: "ComicRelief-Regular",
    marginBottom: 20,
    fontStyle: "italic",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ff4b4bff",
  },
  confirmButton: {
    backgroundColor: "#33b445ff",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  modalButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "ComicRelief-Regular",
  },
  // Dropdown Styles
  dropdownList: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    maxHeight: 300,
    width: 250,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#F25F3B",
    fontFamily: "ComicRelief-Regular",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    marginRight: 8,
  },
});
