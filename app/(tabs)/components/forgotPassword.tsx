import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { API_BASE } from "../utils/config";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOTP = async () => {
    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/forgot-password-child`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save email for the next screen
        await AsyncStorage.setItem("resetUsername", username.trim());
        
         Alert.alert("Success", "OTP sent to your parents email address");
        setTimeout(()=>{
          router.push("/(tabs)/components/verifyForgotPassword");
        },1000)

      } else {
        setError(data.detail || data.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Request OTP error:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      style={styles.background}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.mainContainer}>
            <View style={styles.contentWrapper}>
              
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Password Reset</Text>
                <View style={styles.prompt}>
                  <Text style={styles.promptText}>
                    Enter your username below, and we will send you an e-mail allowing you to reset it.
                  </Text>
                </View>
              </View>

              {/* Input Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter Username</Text>
                <View style={[styles.inputWrapper, error && styles.inputError]}>
                  <TextInput
                    style={styles.inputText}
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      setError("");
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>

              {/* Button */}
              <TouchableOpacity
                style={[
                  styles.button,
                  isLoading && styles.buttonDisabled
                ]}
                onPress={handleRequestOTP}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Request OTP</Text>
                )}
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
    alignItems: "center",
  },
  mainContainer: {
    width: "100%",
    maxWidth: 400,
    paddingHorizontal: 30,
    paddingVertical: 40,
    backgroundColor: "rgba(241, 241, 239, 0.95)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  contentWrapper: {
    width: "100%",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  prompt: {
    backgroundColor: "#fde499",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#f9c74f",
  },
  promptText: {
    color: "#7c6f1eff",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "500",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#504f4f",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputText: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
    paddingVertical: 0,
  },
  inputIcon: {
    marginLeft: 8,
  },
  inputError: {
    borderColor: "#ff4757",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#ff4757",
    fontSize: 14,
    marginTop: 6,
    fontWeight: "500",
  },
  button: {
    width: "100%",
    backgroundColor: "#fe7650",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#fe7650",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ffa285",
    shadowOpacity: 0.1,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    marginLeft: 8,
  },
});