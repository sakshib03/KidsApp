import {
  Text,
  View,
  ImageBackground,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import * as Font from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "@/app/(tabs)/config";

export default function LandingPage() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadFonts();
    startLoading();
    fetchMessage();
  }, []);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        "ComicRelief-Bold": require("../../../../../assets/fonts/ComicRelief-Bold.ttf"),
        "ComicRelief-Regular": require("../../../../../assets/fonts/ComicRelief-Regular.ttf"),
      });
      setFontsLoaded(true);
    } catch (error) {
      console.error("Error loading fonts:", error);
    }
  };

  const startLoading = () => {
    let timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          router.push("/(tabs)/components/games/Mind_Mystery/welcomePage");
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const fetchMessage = async () => {
    try {
      setLoading(true);
      const childId = await AsyncStorage.getItem("childId");
      console.log("Fetching welcome message for child ID:", childId);

      if (!childId) {
        console.log("No child ID found in storage");
        setMessage({ message: "Welcome to Mind Mystery! 🎉" });
        return;
      }

      const response = await fetch(
        `${API_BASE}/welcome/mind/${childId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        if (response.status === 404) {
          // Child not found in database, but endpoint exists
          const errorData = await response.json();
          console.log("Child not found error:", errorData);
          setMessage({ message: "Welcome to Mind Mystery! 🎉" });
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      console.log("Welcome message data:", data);
      setMessage(data);
    } catch (error) {
      console.error("Error fetching welcome message:", error);
      // Fallback message that matches your backend format
      setMessage({
        message: "Welcome to Mind Mystery! Get ready for an adventure! 🚀",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/games/mindMystery/bg1.png")}
      style={styles.background}
    >
      <View style={styles.mainContainer}>
        <Text style={styles.headerTitle}>Mind Mystery</Text>

        <View style={styles.loaderContainer}>
          <View style={styles.loaderBackground}>
            <View style={[styles.loaderFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.loadingText}>
            Bundle up! It's tme for frosty fun!
          </Text>
        </View>

        <View>
          <Image
            source={require("@/assets/images/games/mindMystery/cloud.png")}
            style={{height:120, width:240, marginTop:60, marginBottom:30, marginLeft:140, position:"relative"}}
          />
          <Text style={styles.headerSubTitle}>
          {loading ? "Loading your welcome message..." : message?.message || ""}
        </Text>
        </View>

        
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  mainContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 600,
    color: "#081C5B",
    fontFamily: "ComicRelief-Bold",
  },
  headerSubTitle: {
    width:180,
    fontSize: 14,
    padding: 10,
    textAlign: "center",
    color: "#081C5B",
    fontFamily: "ComicRelief-Regular",
    position:"relative",
    bottom:120,
    left:160
  },
  loaderContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  loaderBackground: {
    width: 280,
    height: 20,
    backgroundColor: "#a3b2f5ff",
    borderRadius: 10,
    overflow: "hidden",
  },
  loaderFill: {
    height: "100%",
    backgroundColor: "#081C5B",
  },
  loadingText: {
    marginTop: 14,
    fontWeight: 600,
    fontSize: 18,
    color: "#081C5B",
    fontFamily: "ComicRelief-Regular",
  },
});
