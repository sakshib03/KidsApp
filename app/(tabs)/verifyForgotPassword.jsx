import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./config";
import { Feather } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function VerifyForgotPassword() {
  const router = useRouter();
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType]=useState("");

  const [errors, setErrors] = useState({
    identifier: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [formData, setFormData] = useState({
    identifier: "",
    otp_code: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem("resetUsername");
        const savedEmail = await AsyncStorage.getItem("resetEmail");
        if (savedUsername) {
          setFormData(prev => ({ ...prev, identifier: savedUsername }));
          setUserType("child");
        } else if (savedEmail) {
          setFormData(prev => ({ ...prev, identifier: savedEmail }));
          setUserType("parent");
        }
      } catch (error) {
        console.error("Error fetching user info from storage:", error);
      }
    };
    getUserInfo();
  }, []);

  const validateForm = () => {
    let valid = true;
    const newErrors = { identifier: "", otp: "", password: "", confirmPassword: "" };

    if (!formData.otp_code) {
      newErrors.otp = "OTP is required";
      valid = false;
    } else if (formData.otp_code.length !== 6) {
      newErrors.otp = "OTP must be 6 digits";
      valid = false;
    }

    if (!formData.new_password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.new_password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    if (!formData.confirm_password) {
      newErrors.confirmPassword = "Confirm password is required";
      valid = false;
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/verify-forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          otp: formData.otp_code,
          new_password: formData.new_password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Password reset successful - navigating to login");
        await AsyncStorage.multiRemove(["resetUsername", "resetEmail"]);

        router.replace("/(tabs)/login");
      } else {
        const errorMessage =
          data.detail ||
          data.message ||
          data.error ||
          `Failed to change password`;
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error("Change password error:", error);
      Alert.alert("Network Error", "Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const getIdentifierLabel=()=>{
    return userType === "child" ? "Username" : "Email";
  };

  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContainer}
          enableOnAndroid
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Change Password</Text>

            <View>
              <Text style={styles.label}>{getIdentifierLabel()}</Text>
              <TextInput
                style={styles.input}
                value={formData.identifier}
                editable={false}
              />
            </View>

            <View>
              <Text style={styles.label}>Enter OTP</Text>
              <TextInput
                style={[styles.input, errors.otp && styles.errorInput]}
                keyboardType="number-pad"
                maxLength={6}
                value={formData.otp_code}
                onChangeText={(text) => handleInputChange("otp_code", text)}
              />
              {errors.otp ? (
                <Text style={styles.errorText}>{errors.otp}</Text>
              ) : null}
            </View>

            <View>
              <Text style={styles.label}>New Password</Text>
              <View
                style={[styles.inputRow, errors.password && styles.errorInput]}
              >
                <TextInput
                  style={styles.inputText}
                  secureTextEntry={securePassword}
                  value={formData.new_password}
                  onChangeText={(text) =>
                    handleInputChange("new_password", text)
                  }
                />
                <TouchableOpacity
                  onPress={() => setSecurePassword(!securePassword)}
                >
                  <Feather
                    name={securePassword ? "eye-off" : "eye"}
                    size={16}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            <View>
              <Text style={styles.label}>Confirm Password</Text>
              <View
                style={[
                  styles.inputRow,
                  errors.confirmPassword && styles.errorInput,
                ]}
              >
                <TextInput
                  style={styles.inputText}
                  secureTextEntry={secureConfirmPassword}
                  value={formData.confirm_password}
                  onChangeText={(text) =>
                    handleInputChange("confirm_password", text)
                  }
                />
                <TouchableOpacity
                  onPress={() =>
                    setSecureConfirmPassword(!secureConfirmPassword)
                  }
                >
                  <Feather
                    name={secureConfirmPassword ? "eye-off" : "eye"}
                    size={16}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
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
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  card: {
    width: "85%",
    marginTop: 40,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 30,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  label: {
    color: "gray",
    fontWeight: "500",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    color: "black",
    marginTop: 5,
    backgroundColor: "#f7f7f7",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: "white",
    marginTop: 5,
  },
  inputText: {
    flex: 1,
    paddingVertical: 10,
    color: "black",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
  },
  button: {
    backgroundColor: "#fe7650",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 25,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
