import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { API_BASE } from "../utils/config";

export default function ChangeParentPass() {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [parentId, setParentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadParentId();
  }, []);

  const loadParentId = async () => {
    try {
      const storedParentId = await AsyncStorage.getItem("parentId");
      console.log("Stored Parent Id:", storedParentId);
      if (storedParentId) {
        setParentId(parseInt(storedParentId));
      } else {
        Alert.alert(
          "Error",
          "Unable to find your account information. Please login again."
        );
      }
    } catch (error) {
      console.error("Error loading parent ID:", error);
      Alert.alert("Error", "Failed to load account information.");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.current_password.trim()) {
      newErrors.current_password = "Current password is required";
    }

    if (!formData.new_password.trim()) {
      newErrors.new_password = "New password is required";
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = "Password must be at least 6 characters";
    }

    if (!formData.confirm_password.trim()) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    if (!parentId) {
      Alert.alert(
        "Error",
        "Account information not found. Please try logging in again."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/change-parent-password`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent_id: parentId,
          current_password: formData.current_password,
          new_password: formData.new_password,
        }),
      });

      const result = await response.json();
      console.log("API Response:", response.status, result);

      if (response.ok) {
        Alert.alert("Success", "Parent password changed successfully`");
        setTimeout(() => {
          router.push("/(tabs)/auth/login");
        }, 1000);
      } else {
        const errorMessage =
          result.detail ||
          result.message ||
          "Failed to change password. Please check your current password and try again.";
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert(
        "Network Error",
        "Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.current_password.trim() &&
      formData.new_password.trim() &&
      formData.confirm_password.trim() &&
      formData.new_password === formData.confirm_password &&
      formData.new_password.length >= 6
    );
  };

  return (
    <ImageBackground
      source={require("@/assets/images/theme3.png")}
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.mainContainer}>
          <View style={styles.contentWrapper}>
            <Text style={styles.title}>Change Password</Text>

            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View
                style={[
                  styles.passwordContainer,
                  errors.current_password && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.inputText}
                  secureTextEntry={!showPassword.current}
                  value={formData.current_password}
                  onChangeText={(text) =>
                    handleInputChange("current_password", text)
                  }
                  editable={!loading}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => toggleShowPassword("current")}
                  disabled={loading}
                >
                  <Feather
                    name={showPassword.current ? "eye" : "eye-off"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.current_password && (
                <Text style={styles.errorText}>{errors.current_password}</Text>
              )}
            </View>

            {/* New Password */}
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View
                style={[
                  styles.passwordContainer,
                  errors.new_password && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.inputText}
                  secureTextEntry={!showPassword.new}
                  value={formData.new_password}
                  onChangeText={(text) =>
                    handleInputChange("new_password", text)
                  }
                  editable={!loading}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => toggleShowPassword("new")}
                  disabled={loading}
                >
                  <Feather
                    name={showPassword.new ? "eye" : "eye-off"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.new_password && (
                <Text style={styles.errorText}>{errors.new_password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View
                style={[
                  styles.passwordContainer,
                  errors.confirm_password && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.inputText}
                  secureTextEntry={!showPassword.confirm}
                  value={formData.confirm_password}
                  onChangeText={(text) =>
                    handleInputChange("confirm_password", text)
                  }
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleChangePassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => toggleShowPassword("confirm")}
                  disabled={loading}
                >
                  <Feather
                    name={showPassword.confirm ? "eye" : "eye-off"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirm_password && (
                <Text style={styles.errorText}>{errors.confirm_password}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: isFormValid() ? "#45c556ff" : "#cccccc" },
              ]}
              onPress={handleChangePassword}
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  container: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
  },
  mainContainer: {
    width: "100%",
    maxHeight: "80%",
    padding: 30,
    backgroundColor: "#7560ecff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  contentWrapper: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  inputField: {
    width: "100%",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 8,
  },
  inputText: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    color:"#0c0c0cff"
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    padding: 8,
  },
  button: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
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
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  cancelButton: {
    width: "100%",
    paddingVertical: 12,
    marginTop: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
    opacity: 0.8,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  inputError: {
    borderColor: "#ff6b6b",
    borderWidth: 1,
  },
});
