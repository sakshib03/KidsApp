import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { API_BASE } from "../utils/config";

export default function LoginScreen() {
  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [openChild, setOpenChild] = useState(true);
  const [openParent, setOpenParent] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    email: "",
    parent_password: "",
  });

  // Loading state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      "ComicRelief-Bold": require("../../../assets/fonts/ComicRelief-Bold.ttf"),
      "ComicRelief-Regular": require("../../../assets/fonts/ComicRelief-Regular.ttf"),
    }).then(() => setFontsLoaded(true));
  }, []);

  // Store authentication data
  const storeAuthData = async (userType, data) => {
    try {
      const loginTime = new Date().getTime().toString();

      await AsyncStorage.multiSet([
        ["accessToken", data.access_token || `token_${loginTime}`],
        ["loginTime", loginTime],
        ["userType", userType],
      ]);

      // Store user-specific data
      if (userType === "child") {
        await AsyncStorage.setItem("childId", data.child_id.toString());
        await AsyncStorage.setItem("parentId", data.parent_id.toString());
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify({
            child_id: data.child_id,
            username: data.username,
            fullname: data.fullname,
            parent_id: data.parent_id,
          })
        );
      } else if (userType === "parent") {
        await AsyncStorage.setItem("parentId", data.parent_id.toString());
        if (data.children && data.children.length > 0) {
          await AsyncStorage.setItem(
            "childId",
            data.children[0].child_id.toString()
          );
        }
        await AsyncStorage.setItem(
          "parentData",
          JSON.stringify({
            parent_id: data.parent_id,
            email: data.email,
            fullname: data.fullname,
            children: data.children,
          })
        );
      }
    } catch (error) {
      console.error("Error storing auth data:", error);
      throw error;
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setLoginData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Child login API call
  const handleChildLogin = async () => {
    if (!loginData.username || !loginData.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/child-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
         if (data.message && data.message.includes("blocked")) {
          Alert.alert("Account Blocked", data.message);
          console.log("Blocked login attempt:", data.message);
          return;
        }
        await storeAuthData("child", data);
        router.dismissAll();
        router.replace("/(tabs)/components/chatbot");
      } else {
        Alert.alert("Error", data.detail || "Login failed. Please try again.");
        console.log(data.detail);
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Parent login API call
  const handleParentLogin = async () => {
    if (!loginData.email || !loginData.parent_password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/parent-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          parent_password: loginData.parent_password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await storeAuthData("parent", data);
        router.dismissAll();
        router.replace("/(tabs)/components/dashboard");
      } else {
        Alert.alert("Error", data.detail || "Login failed. Please try again.");
        console.log(data.detail);
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (openChild) {
      handleChildLogin();
    } else {
      handleParentLogin();
    }
  };

  // Reset form when switching between child and parent
  const switchToChild = () => {
    setOpenChild(true);
    setOpenParent(false);
    setLoginData((prev) => ({
      ...prev,
      email: "",
      parent_password: "",
    }));
  };

  const switchToParent = () => {
    setOpenParent(true);
    setOpenChild(false);
    setLoginData((prev) => ({
      ...prev,
      username: "",
      password: "",
    }));
  };

  return (
    <ImageBackground
      source={require("@/assets/images/login/bg1.png")}
      style={styles.background}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Image
            source={require("@/assets/images/login/logo.png")}
            style={styles.logo}
          />
          <Text
            style={{
              fontSize: 20,
              marginBottom: 2,
              color: "#0F6424",
              fontWeight: 600,
              marginTop: 10,
            }}
          >
            Welcome Back!
          </Text>
          <Text style={{ fontFamily: "ComicRelief-Regular", color: "#0F6424" }}>
            Login to Continue your adventure.
          </Text>
        </View>

        <View
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: 30,
            marginTop: 30,
            
          }}
        >
          <View
            style={{ display: "flex", flexDirection: "row", marginBottom: 20 }}
          >
            <TouchableOpacity
              style={[
                styles.signupFor,
                {
                  marginRight: 2,
                  backgroundColor: openChild ? "#0F6424" : "#8dff98ff",
                },
              ]}
              onPress={switchToChild}
            >
              <Text style={styles.buttonText}>CHILD</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.signupFor,
                { backgroundColor: openParent ? "#0F6424" : "#8dff98ff" },
              ]}
              onPress={switchToParent}
            >
              <Text style={styles.buttonText}>PARENT</Text>
            </TouchableOpacity>
          </View>

          {openChild && (
            <View>
              <View style={[styles.input, { marginBottom: 0 }]}>
                <TextInput
                  style={styles.inputText}
                  placeholder="Username"
                  placeholderTextColor="#0F6424"
                  underlineColorAndroid="transparent"
                  value={loginData.username}
                  onChangeText={(text) => handleInputChange("username", text)}
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
                  style={[styles.inputText, { flex: 1 }]}
                  secureTextEntry={secure}
                  placeholder="Password"
                  placeholderTextColor="#0F6424"
                  value={loginData.password}
                  onChangeText={(text) => handleInputChange("password", text)}
                />
                <TouchableOpacity onPress={() => setSecure(!secure)}>
                  <Feather
                    name={secure ? "eye-off" : "eye"}
                    size={16}
                    marginTop={12}
                    color="#0F6424"
                  />
                </TouchableOpacity>
              </View>
              {/* <TouchableOpacity>
                <Text
                  style={{
                    marginTop: 10,
                    marginLeft: 20,
                    fontFamily: "ComicRelief-Regular",
                    color: "#0F6424",
                  }}
                  onPress={() => router.push("/(tabs)/forgotPassword")}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity> */}
            </View>
          )}

          {openParent && (
            <View>
              <View style={[styles.input, { marginBottom: 0 }]}>
                <TextInput
                  style={styles.inputText}
                  placeholder="Email"
                  placeholderTextColor="#0F6424"
                  underlineColorAndroid="transparent"
                  value={loginData.email}
                  onChangeText={(text) => handleInputChange("email", text)}
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
                  style={[styles.inputText, { flex: 1 }]}
                  secureTextEntry={secureConfirm}
                  placeholder="Password"
                  placeholderTextColor="#0F6424"
                  value={loginData.parent_password}
                  onChangeText={(text) =>
                    handleInputChange("parent_password", text)
                  }
                />
                <TouchableOpacity
                  onPress={() => setSecureConfirm(!secureConfirm)}
                >
                  <Feather
                    name={secureConfirm ? "eye-off" : "eye"}
                    size={16}
                    marginTop={12}
                    color="#0F6424"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity>
                <Text
                  style={{
                    color: "#0F6424",
                    marginTop: 10,
                    marginLeft: 20,
                    fontFamily: "ComicRelief-Regular",
                  }}
                  onPress={() => router.push("/(tabs)/components/forgotPassParent")}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "LOGGING IN..." : "LOGIN"}
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            fontFamily: "ComicRelief-Regular",
            marginTop: 6,
            color: "#0F6424",
          }}
        >
          Don't have an account?{" "}
          <Text
            style={{ color: "#0F6424" }}
            onPress={() => router.push("/(tabs)/auth/signup")}
          >
            SignUp
          </Text>
        </Text>
      </View>
      {/* <Image
      source={require("@/assets/images/login/hello.png")}
      style={{height:150, width:140, right:-10, position:"relative", bottom:10}}
      /> */}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 30,
  },
  input: {
    width: 300,
    height:45,
    marginTop: 22,
    borderColor: "#0F6424",
    borderWidth: 1,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  inputText: {
    fontSize: 16,
    fontFamily: "ComicRelief-Regular",
    fontWeight: 500,
    color: "#1c7833ff",
  },
  button: {
    width: 300,
    marginTop: 6,
    backgroundColor: "#0F6424",
    padding: 12,
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#b2f892ff",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "ComicRelief-Regular",
    fontWeight: 500,
    color: "#fff",
  },
  signupFor: {
    width: 150,
    marginTop: 4,
    padding: 12,
    paddingVertical: 10,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
});
