import { Feather } from "@expo/vector-icons";
import * as Font from "expo-font";
import { router } from "expo-router";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { API_BASE } from "../utils/config";

export default function SignUpScreen() {
  const [secureChild, setSecureChild] = useState(true);
  const [secureConfirmChild, setSecureConfirmChild] = useState(true);
  const [secureParent, setSecureParent] = useState(true);
  const [secureConfirmParent, setSecureConfirmParent] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [step, setStep] = useState("child");
  const [dob, setDob] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Form states
  const [childFullName, setChildFullName] = useState("");
  const [childUsername, setChildUsername] = useState("");
  const [childPassword, setChildPassword] = useState("");
  const [childConfirmPassword, setChildConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [dreamCareer, setDreamCareer] = useState("");
  const [dreamCareer1, setDreamCareer1] = useState("");
  const [dreamCareer2, setDreamCareer2] = useState("");

  const [parentFullName, setParentFullName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [parentConfirmPassword, setParentConfirmPassword] = useState("");
  const [parentGender, setParentGender] = useState("");
  const [relation, setRelation] = useState("");

  // OTP states
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Validation states
  const [passwordErrors, setPasswordErrors] = useState({
    child: [],
    parent: [],
  });
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showCareerDropdown, setShowCareerDropdown] = useState(false);
  const [showCareerDropdown1, setShowCareerDropdown1] = useState(false);
  const [showCareerDropdown2, setShowCareerDropdown2] = useState(false);
  const [showRelationDropdown, setShowRelationDropdown] = useState(false);
  const [showParentGenderDropdown, setShowParentGenderDropdown] =
    useState(false);

  const inputsRef = useRef([]);

  const genderOptions = ["Male", "Female", "Other"];
  const genderOptions2 = ["Male", "Female", "Other"];

  const careerOptions = [
    "Actor",
    "Air Force Officer",
    "AI Engineer",
    "Animal Caretaker",
    "Animator",
    "App Developer",
    "Architect",
    "Army Soldier",
    "Artist",
    "Astronaut",
    "Athlete",
    "Auto Engineer",
    "Baker",
    "Badminton Player",
    "Basketball Player",
    "Botanist",
    "Business Owner",
    "Carpenter",
    "Chef",
    "Chocolatier",
    "Computer Scientist",
    "Content Creator",
    "Cricketer",
    "Cyclist",
    "Cybersecurity Expert",
    "Dancer",
    "Data Scientist",
    "Dentist",
    "Designer",
    "Doctor",
    "Drone Operator",
    "Editor",
    "Electrician",
    "Electronics Engineer",
    "Engineer",
    "Entrepreneur",
    "Explorer",
    "Fashion Designer",
    "Farmer",
    "Filmmaker",
    "Financial Advisor",
    "Firefighter",
    "Food Scientist",
    "Footballer",
    "Game Developer",
    "Game Streamer",
    "Gardener",
    "Graphic Designer",
    "Gymnast",
    "Illustrator",
    "Inventor",
    "Lawyer",
    "Librarian",
    "Lifeguard",
    "Magician",
    "Manager",
    "Marine Biologist",
    "Marketing Specialist",
    "Martial Artist",
    "Mechanic",
    "Musician",
    "Mountain Rescuer",
    "Navy Officer",
    "Nurse",
    "Painter",
    "Paramedic",
    "Pharmacist",
    "Photographer",
    "Pilot",
    "Plumber",
    "Poet",
    "Police Officer",
    "Programmer",
    "Restaurant Owner",
    "Runner",
    "Scientist",
    "Shop Owner",
    "Singer",
    "Skateboarder",
    "Social Worker",
    "Software Engineer",
    "Space Traveler",
    "Storyteller",
    "Surgeon",
    "Swimmer",
    "Teacher",
    "Teacher Assistant",
    "Technician",
    "Tennis Player",
    "Veterinarian",
    "Veterinarian Assistant",
    "Web Developer",
    "Wildlife Photographer",
    "Writer",
    "YouTuber",
    "Zookeeper",
    "Zoologist",
  ];

  const relationOptions = [
    "Mother",
    "Father",
    "Brother",
    "Sister",
    "Guardian",
    "Grand Mother",
    "Grand Father",
    "Uncle",
    "Aunt",
    "Cousin",
    "Step Mother",
    "Step Father",
    "Other",
  ];

  useEffect(() => {
    Font.loadAsync({
      "ComicRelief-Bold": require("../../../assets/fonts/ComicRelief-Regular.ttf"),
      "ComicRelief-Regular": require("../../../assets/fonts/ComicRelief-Regular.ttf"),
    }).then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Validate password strength
  const validatePassword = (password, type) => {
    const errors = [];

    if (password.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("One lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("One uppercase letter");
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push("One number");
    }
    if (!/(?=.*[@$!%*#?&])/.test(password)) {
      errors.push("One special character (@$!%*#?&)");
    }

    setPasswordErrors((prev) => ({
      ...prev,
      [type]: errors,
    }));

    return errors.length === 0;
  };

  if (!fontsLoaded) return null;

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    setDob(formattedDate);
    hideDatePicker();
  };

  const validateChildForm = () => {
    setIsAlreadyRegistered(false);

    // Clear previous password errors
    setPasswordErrors((prev) => ({ ...prev, child: [] }));

    if (!childFullName.trim()) {
      Alert.alert("Error", "Please enter child's full name");
      return false;
    }
    if (!childUsername.trim()) {
      Alert.alert("Error", "Please enter username");
      return false;
    }
    if (!childPassword) {
      Alert.alert("Error", "Please enter password");
      return false;
    }

    // Validate password on submit
    const isChildPasswordValid = validatePassword(childPassword, "child");
    if (!isChildPasswordValid) {
      Alert.alert(
        "Error",
        "Please fix password requirements:\n• At least 8 characters\n• One lowercase letter\n• One uppercase letter\n• One number\n• One special character (@$!%*#?&)"
      );
      return false;
    }

    if (childPassword !== childConfirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }
    if (!dob) {
      Alert.alert("Error", "Please select date of birth");
      return false;
    }
    if (!gender) {
      Alert.alert("Error", "Please select gender");
      return false;
    }
    if (!dreamCareer) {
      Alert.alert("Error", "Please select dream career");
      return false;
    }
    return true;
  };

  const validateParentForm = () => {
    // Clear previous password errors
    setPasswordErrors((prev) => ({ ...prev, parent: [] }));

    if (!parentFullName.trim()) {
      Alert.alert("Error", "Please enter parent's full name");
      return false;
    }
    if (!parentEmail.trim() || !/\S+@\S+\.\S+/.test(parentEmail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    if (!parentPassword) {
      Alert.alert("Error", "Please enter password");
      return false;
    }

    // Validate password on submit
    const isParentPasswordValid = validatePassword(parentPassword, "parent");
    if (!isParentPasswordValid) {
      Alert.alert(
        "Error",
        "Please fix password requirements:\n• At least 8 characters\n• One lowercase letter\n• One uppercase letter\n• One number\n• One special character (@$!%*#?&)"
      );
      return false;
    }

    if (parentPassword !== parentConfirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }
    if (!parentGender) {
      Alert.alert("Error", "Please select parent's gender");
      return false;
    }
    if (!relation) {
      Alert.alert("Error", "Please select relation with child");
      return false;
    }
    return true;
  };

  const handleChildSubmit = () => {
    if (validateChildForm()) {
      setStep("parent");
    }
  };

  const handleRequestOTP = async () => {
    if (!validateParentForm()) return;

    setIsLoading(true);
    try {
      const signupData = {
        fullname: childFullName,
        username: childUsername,
        dob: dob,
        gender: gender,
        default_dream_career: dreamCareer,
        optional_dream_career_1: dreamCareer1,
        optional_dream_career_2: dreamCareer2,
        password: childPassword,
        parent_name: parentFullName,
        parent_gender: parentGender,
        parent_email: parentEmail,
        parent_password: parentPassword,
        relation: relation,
      };

      console.log("Sending signup data:", signupData);

      const response = await fetch(`${API_BASE}/initiate-signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("otp");
        setCountdown(300);
        Alert.alert("Success", "OTP sent to your parent's email address");
      } else {
        if (
          response.status === 409 ||
          data.message?.toLowerCase().includes("already exists") ||
          data.message?.toLowerCase().includes("already registered")
        ) {
          setIsAlreadyRegistered(true);
          Alert.alert(
            "Registration Error",
            data.message ||
              "This username or email is already registered. Please try logging in."
          );
        } else {
          Alert.alert("Error", data.message || "Failed to send OTP");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch(`${API_BASE}/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: parentEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(300);
        Alert.alert("Success", "OTP resent successfully");
      } else {
        Alert.alert("Error", data.message || "Failed to resend OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter complete OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/complete-signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: otpCode,
          email: parentEmail, // Include email for verification
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Signup completed successfully!", [
          { text: "OK", onPress: () => router.push("/") },
        ]);
      } else {
        if (response.status === 409) {
          setIsAlreadyRegistered(true);
          Alert.alert(
            "Registration Error",
            data.message ||
              "This account is already registered. Please try logging in."
          );
          router.push("/(tabs)/auth/login");
        } else {
          Alert.alert("Error", data.message || "Invalid OTP");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  const renderDropdownItem = ({ item, onSelect, dropdownType }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        onSelect(item);
        if (dropdownType === "gender") setShowGenderDropdown(false);
        if (dropdownType === "career")
          [
            setShowCareerDropdown(false),
            setShowCareerDropdown1(false),
            setShowCareerDropdown2(false),
          ];
        if (dropdownType === "relation") setShowRelationDropdown(false);
        if (dropdownType === "parentGender") setShowParentGenderDropdown(false);
      }}
    >
      <Text style={styles.dropdownItemText}>{item}</Text>
    </TouchableOpacity>
  );

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
            renderItem={({ item }) =>
              renderDropdownItem({ item, onSelect, dropdownType })
            }
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <ImageBackground
      source={require("@/assets/images/login/bg1.png")}
      style={styles.background}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: 600, color: "#0F6424" }}>
            Welcome, SignUp to Continue
          </Text>
        </View>

        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {step === "child" && (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f7f4aeff",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#0F6424",
                  fontWeight: 400,
                  marginTop: 10,
                  fontFamily: "ComicRelief-Regular",
                }}
              >
                Child Information
              </Text>

              <View style={styles.input}>
                <TextInput
                  style={styles.inputText}
                  placeholder="Full Name"
                  placeholderTextColor="#0F6424"
                  value={childFullName}
                  onChangeText={setChildFullName}
                />
              </View>

              <View style={styles.input}>
                <TextInput
                  style={styles.inputText}
                  placeholder="Username"
                  placeholderTextColor="#0F6424"
                  value={childUsername}
                  onChangeText={setChildUsername}
                />
              </View>

              <View
                style={[
                  styles.input,
                  {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  },
                ]}
              >
                <TextInput
                  style={styles.inputText}
                  placeholder="Password"
                  placeholderTextColor="#0F6424"
                  secureTextEntry={secureChild}
                  value={childPassword}
                  onChangeText={setChildPassword}
                />
                <TouchableOpacity onPress={() => setSecureChild(!secureChild)}>
                  <Feather
                    name={secureChild ? "eye-off" : "eye"}
                    size={16}
                    marginTop={12}
                    color="#0F6424"
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.input,
                  {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  },
                ]}
              >
                <TextInput
                  style={styles.inputText}
                  placeholder="Confirm Password"
                  placeholderTextColor="#0F6424"
                  secureTextEntry={secureConfirmChild}
                  value={childConfirmPassword}
                  onChangeText={setChildConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setSecureConfirmChild(!secureConfirmChild)}
                >
                  <Feather
                    name={secureConfirmChild ? "eye-off" : "eye"}
                    size={16}
                    marginTop={12}
                    color="#0F6424"
                  />
                </TouchableOpacity>
              </View>

              <View>
                <TouchableOpacity style={styles.input} onPress={showDatePicker}>
                  <Text style={[styles.inputText]}>
                    {dob
                      ? moment(dob).format("MM-DD-YYYY")
                      : "Enter Date of Birth"}
                  </Text>
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  maximumDate={new Date()}
                  minimumDate={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 15)
                    )
                  }
                  onConfirm={handleConfirm}
                  onCancel={hideDatePicker}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                ]}
                onPress={() => setShowGenderDropdown(true)}
              >
                <Text
                  style={[styles.inputText, !gender && { color: "#0F6424" }]}
                >
                  {gender ? gender : "Select Gender"}
                </Text>
                <Feather
                  name="chevron-down"
                  size={16}
                  marginTop={14}
                  color="#0F6424"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                ]}
                onPress={() => setShowCareerDropdown(true)}
              >
                <Text
                  style={[
                    styles.inputText,
                    !dreamCareer && { color: "#0F6424" },
                  ]}
                >
                  {dreamCareer ? dreamCareer : "Select Dream Career"}
                </Text>
                <Feather name="chevron-down" size={16} color="#0F6424" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                ]}
                onPress={() => setShowCareerDropdown1(true)}
              >
                <Text
                  style={[
                    styles.inputText,
                    !dreamCareer1 && { color: "#0F6424" },
                  ]}
                >
                  {dreamCareer1 ? dreamCareer1 : "Optional Dream Career 1"}
                </Text>
                <Feather name="chevron-down" size={16} color="#0F6424" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                ]}
                onPress={() => setShowCareerDropdown2(true)}
              >
                <Text
                  style={[
                    styles.inputText,
                    !dreamCareer2 && { color: "#0F6424" },
                  ]}
                >
                  {dreamCareer2 ? dreamCareer2 : "Optional Dream Career 2"}
                </Text>
                <Feather name="chevron-down" size={16} color="#0F6424" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={handleChildSubmit}
              >
                <Text style={styles.buttonText}>CONTINUE</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === "parent" && (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: 16,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f7f4aeff",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#0F6424",
                  fontWeight: 400,
                  marginTop: 10,
                  fontFamily: "ComicRelief-Regular",
                }}
              >
                Parent Information
              </Text>

              <View style={styles.input}>
                <TextInput
                  style={styles.inputText}
                  placeholder="Full Name"
                  placeholderTextColor="#0F6424"
                  value={parentFullName}
                  onChangeText={setParentFullName}
                />
              </View>

              <View style={styles.input}>
                <TextInput
                  style={styles.inputText}
                  placeholder="Parent email"
                  placeholderTextColor="#0F6424"
                  value={parentEmail}
                  onChangeText={setParentEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View
                style={[
                  styles.input,
                  {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  },
                ]}
              >
                <TextInput
                  style={styles.inputText}
                  placeholder="Password"
                  placeholderTextColor="#0F6424"
                  secureTextEntry={secureParent}
                  value={parentPassword}
                  onChangeText={setParentPassword}
                />
                <TouchableOpacity
                  onPress={() => setSecureParent(!secureParent)}
                >
                  <Feather
                    name={secureParent ? "eye-off" : "eye"}
                    size={16}
                    marginTop={12}
                    color="#0F6424"
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.input,
                  {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  },
                ]}
              >
                <TextInput
                  style={styles.inputText}
                  placeholder="Confirm Password"
                  placeholderTextColor="#0F6424"
                  secureTextEntry={secureConfirmParent}
                  value={parentConfirmPassword}
                  onChangeText={setParentConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setSecureConfirmParent(!secureConfirmParent)}
                >
                  <Feather
                    name={secureConfirmParent ? "eye-off" : "eye"}
                    size={16}
                    marginTop={12}
                    color="#0F6424"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                ]}
                onPress={() => setShowParentGenderDropdown(true)}
              >
                <Text
                  style={[
                    styles.inputText,
                    !parentGender && { color: "#0F6424" },
                  ]}
                >
                  {parentGender ? parentGender : "Select Gender"}
                </Text>
                <Feather
                  name="chevron-down"
                  size={16}
                  marginTop={14}
                  color="#0F6424"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                ]}
                onPress={() => setShowRelationDropdown(true)}
              >
                <Text
                  style={[styles.inputText, !relation && { color: "#0F6424" }]}
                >
                  {relation ? relation : "Select Relation"}
                </Text>
                <Feather
                  name="chevron-down"
                  size={16}
                  marginTop={14}
                  color="#0F6424"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  isLoading && { backgroundColor: "#9c9a9aff" },
                ]}
                onPress={handleRequestOTP}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "SENDING..." : "REQUEST OTP"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === "otp" && (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: 20,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f7f4aeff",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
              }}
            >
              <View style={{ marginTop: 20, width: 300 }}>
                <Text
                  style={{ color: "#0F6424", fontSize: 14, marginBottom: 10 }}
                >
                  Enter OTP sent to {parentEmail}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 15,
                    marginTop: 10,
                  }}
                >
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (inputsRef.current[index] = ref)}
                      style={{
                        width: 40,
                        height: 50,
                        textAlign: "center",
                        fontSize: 20,
                        borderWidth: 1,
                        borderColor: "#0F6424",
                        borderRadius: 5,
                        color: "#0F6424",
                      }}
                      maxLength={1}
                      keyboardType="numeric"
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    />
                  ))}
                </View>

                {countdown > 0 && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#0F6424",
                      marginBottom: 10,
                      textAlign: "center",
                    }}
                  >
                    OTP expires in {Math.floor(countdown / 60)}:
                    {(countdown % 60).toString().padStart(2, "0")}
                  </Text>
                )}

                <TouchableOpacity
                  style={{ marginTop: 10, alignItems: "center" }}
                  onPress={handleResendOTP}
                >
                  <Text
                    style={{
                      color: "#0F6424",
                      fontSize: 14,
                      fontFamily: "ComicRelief-Regular",
                    }}
                  >
                    Resend OTP
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    !isOtpComplete && { backgroundColor: "#9c9a9aff" },
                  ]}
                  onPress={handleVerifyOTP}
                  disabled={!isOtpComplete || isLoading}
                >
                  {isLoading ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <ActivityIndicator size="small" color="#f9f9f9ff" />
                      <Text style={styles.buttonText}>VERIFYING...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>VERIFY OTP</Text>
                  )}
                </TouchableOpacity>

                {isLoading && (
                  <Text style={styles.dontGoBackText}>
                    Please wait, don't go back until the process completes! ⏳
                  </Text>
                )}
              </View>
            </View>
          )}

          <Text style={{ fontFamily: "ComicRelief-Regular", color: "#0F6424" }}>
            Already have an account?{" "}
            <Text
              style={{
                color: "#0F6424",
                fontFamily: "ComicRelief-Regular",
                textDecorationLine: "underline",
              }}
              onPress={() => router.push("/")}
            >
              Login
            </Text>
          </Text>
        </View>

        {/* Dropdown Modals */}
        <DropdownModal
          visible={showGenderDropdown}
          options={genderOptions}
          onSelect={setGender}
          onClose={() => setShowGenderDropdown(false)}
          dropdownType="gender"
        />

        <DropdownModal
          visible={showCareerDropdown}
          options={careerOptions}
          onSelect={setDreamCareer}
          onClose={() => setShowCareerDropdown(false)}
          dropdownType="career"
        />

        <DropdownModal
          visible={showCareerDropdown1}
          options={careerOptions}
          onSelect={setDreamCareer1}
          onClose={() => setShowCareerDropdown1(false)}
          dropdownType="career"
        />

        <DropdownModal
          visible={showCareerDropdown2}
          options={careerOptions}
          onSelect={setDreamCareer2}
          onClose={() => setShowCareerDropdown2(false)}
          dropdownType="career"
        />

        <DropdownModal
          visible={showRelationDropdown}
          options={relationOptions}
          onSelect={setRelation}
          onClose={() => setShowRelationDropdown(false)}
          dropdownType="relation"
        />

        <DropdownModal
          visible={showParentGenderDropdown}
          options={genderOptions2}
          onSelect={setParentGender}
          onClose={() => setShowParentGenderDropdown(false)}
          dropdownType="parentGender"
        />
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
  input: {
    width: 280,
    height: 40,
    marginTop: 18,
    borderColor: "#0F6424",
    borderWidth: 1,
    paddingHorizontal: 25,
    borderRadius: 30,
    justifyContent: "center",
  },
  inputText: {
    fontSize: 16,
    fontFamily: "ComicRelief-Regular",
    fontWeight: 500,
    color: "#0F6424",
    paddingVertical: 0,
    width: "100%",
  },
  button: {
    width: "100%",
    marginTop: 30,
    backgroundColor: "#0F6424",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 500,
    color: "#fff",
    fontFamily: "ComicRelief-Regular",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
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
    color: "#0F6424",
    fontFamily: "ComicRelief-Regular",
  },
  dontGoBackText: {
    fontSize: 14,
    color: "#fa4747ff",
    fontFamily: "ComicRelief-Regular",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
    opacity: 0.8,
  },
});
