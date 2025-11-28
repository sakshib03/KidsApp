import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
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
    View,
} from "react-native";
import { API_BASE } from "../utils/config";

export default function ForgotPassParent() {
  const [email, setEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isValidEmail = (email) => {
    setLoginError("");

    if (!email) {
      setLoginError("Please enter a valid email address");
      return false;
    }

    if (/[A-Z]/.test(email)) {
      setLoginError("Email should not contain capital letters");
      return false;
    }

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email)) {
      setLoginError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!isValidEmail(email)) return;

    setIsLoading(true);
    setLoginError("");

    try {
      const response = await fetch(`${API_BASE}/forgot-password-parent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("resetEmail", email);
        Alert.alert("Success", "OTP sent to your email address");
        setTimeout(()=>{
          router.push("/(tabs)/components/verifyForgotPassword");
        },1000)
      } else {
        setLoginError(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setLoginError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Text style={styles.title}>Password Reset</Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Enter your e-mail address below, and
                we'll send you an e-mail allowing you to reset it.
              </Text>
            </View>

            <Text style={styles.label}>Email Address</Text>

            <TextInput
              style={[
                styles.input,
                { borderColor: loginError ? "red" : "#ccc" },
              ]}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (loginError) setLoginError("");
              }}
              onSubmitEditing={handleResetPassword}
            />

            {loginError.length > 0 && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{loginError}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, isLoading && { opacity: 0.7 }]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Request OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 30,
    marginTop:80,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#fde499",
    borderColor: "#fde499ff",
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
  infoText: {
    color: "#7c6f1eff",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "500",
  },
  label: {
    color: "gray",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    color: "black",
    marginBottom: 5,
  },
  errorBox: {
    backgroundColor: "#ffe5e5",
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  errorText: {
    color: "#d00",
    fontSize: 13,
  },
  button: {
    backgroundColor: "#fe7650",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
