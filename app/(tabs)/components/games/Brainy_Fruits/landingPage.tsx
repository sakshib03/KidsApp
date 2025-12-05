import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ImageBackground,
    StyleSheet,
    Text,
    View
} from "react-native";
import { API_BASE } from "@/app/(tabs)/utils/config";

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
          router.push("/(tabs)/components/games/Brainy_Fruits/welcomePage");
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
      setMessage({ message: "Welcome to Brainy Fruits! 🎉" });
      return;
    }

    const response = await fetch(`${API_BASE}/welcome/${childId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        // Child not found in database, but endpoint exists
        const errorData = await response.json();
        console.log("Child not found error:", errorData);
        setMessage({ message: "Welcome to Brainy Fruits! 🎉" });
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
      message: "Welcome to Brainy Fruits! Get ready for an adventure! 🚀" 
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <ImageBackground
      source={require("@/assets/images/games/bg1.png")}
      style={styles.background}
    >
      <View style={styles.mainContainer}>
        <Text style={styles.headerTitle}>Brainy Fruits</Text>

        <View style={styles.loaderContainer}>
          <View style={styles.loaderBackground}>
            <View style={[styles.loaderFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>

        <Text style={styles.headerSubTitle}> {loading ? "Loading your welcome message..." : message?.message || ""}</Text>
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
    fontSize: 20,
    padding:10,
    textAlign:"center",
    color: "#125b08ff",
    fontFamily: "ComicRelief-Regular",
  },
  loaderContainer: {
    marginTop: 30,
    alignItems: "center",
    marginBottom: 70,
  },
  loaderBackground: {
    width: 280,
    height: 20,
    backgroundColor: "#f5a3a3",
    borderRadius: 10,
    overflow: "hidden",
  },
  loaderFill: {
    height: "100%",
    backgroundColor: "red",
  },
  loadingText: {
    marginTop: 8,
    fontWeight: 400,
    fontSize: 14,
    color: "#081C5B",
    fontFamily: "ComicRelief-Regular",
  },
});
