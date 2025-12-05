import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Image,
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
          router.push("/(tabs)/components/games/Spell_Breaker/welcomePage");
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
        setMessage({ message: "Welcome to Spell Breaker! 🎉" });
        return;
      }

      const response = await fetch(
        `${API_BASE}/welcome/spell/${childId}`,
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
          setMessage({ message: "Welcome to Spell Breaker! 🎉" });
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
        message: "Welcome to Brainy Fruits! Get ready for an adventure! 🚀",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <View style={{marginTop:40}}>
        <Image
          source={require("@/assets/images/games/spellGame/butterfly.png")}
          style={{ height: 40, width: 40, position:"absolute", top:20, right:20 }}
        />
        <Image
          source={require("@/assets/images/games/spellGame/img4.png")}
          style={{ marginTop: 20 }}
        />
      </View>

      <View style={styles.mainContainer}>
        <Text style={styles.headerTitle}>Spell Breaker</Text>
        <View style={styles.loaderContainer}>
          <View style={styles.loaderBackground}>
            <View style={[styles.loaderFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
        <Text style={styles.headerSubTitle}>
          {" "}
          {loading ? "Loading your welcome message..." : message?.message || ""}
        </Text>
      </View>

      <View style={styles.bottomContainer}>
        <Image
          source={require("@/assets/images/games/spellGame/flower.png")}
          style={styles.flowerBottom}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#fadcfeff",
  },
  topContainer: {
    alignItems:"center"
  },
  mainContainer: {
    alignItems: "center",
    marginTop:90,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 600,
    color: "#541274",
    fontFamily: "ComicRelief-Bold",
  },
  headerSubTitle: {
    fontSize: 18,
    padding: 10,
    marginBottom: 120,
    textAlign: "center",
    color: "#580968",
    fontFamily: "ComicRelief-Regular",
  },
  loaderContainer: {
    marginTop: 20,
    alignItems: "center",
    marginBottom: 40,
  },
  loaderBackground: {
    width: 280,
    height: 20,
    backgroundColor: "#FF7DE5",
    borderRadius: 10,
    overflow: "hidden",
  },
  loaderFill: {
    height: "100%",
    backgroundColor: "#C324A3",
  },
  loadingText: {
    marginTop: 8,
    fontWeight: 400,
    fontSize: 14,
    color: "#4E0F6D",
    fontFamily: "ComicRelief-Regular",
  },
  bottomContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    position: "absolute",
    bottom: 0,
  },
  flowerBottom: {
    width: "100%",
    height: 300,
  },
});
