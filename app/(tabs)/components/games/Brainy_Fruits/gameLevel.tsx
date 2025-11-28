import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function LevelSelect() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [childId, setChildId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadFonts();
    fetchChildId();
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

  const fetchChildId = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setChildId(userData.child_id);
      }
    } catch (error) {
      console.error("Error fetching child ID:", error);
      Alert.alert("Error", "Failed to load user data");
    }
  };

  const handleLevelSelect = async (levelNumber) => {
    if (!childId) {
      Alert.alert("Error", "User data not available");
      return;
    }
    if (loading) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/game/select_level/${childId}?desired_level=${levelNumber}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem("gameSessionId", data.session_id);
         await AsyncStorage.setItem("currentGameData", JSON.stringify(data));
         console.log("🎮 Level selected, storing game data:", data);
         
        router.push("/(tabs)/components/games/Brainy_Fruits/loadingPage");
      } else if (response.status === 403) {
        const errorData = await response.json();
        setErrorMessage(errorData.detail);
        console.log(errorData.detail);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error selecting level:", error);
      Alert.alert("Error", "Failed to start level. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded || !childId) {
    return (
      <ImageBackground
        source={require("@/assets/images/games/bg1.png")}
        style={styles.background}
      >
        <Text style={styles.loadingText}>Loading...</Text>
      </ImageBackground>
    );
  }

  const levels = [];
  for (let i = 1; i <= 100; i++) {
    levels.push(i);
  }

  return (
    <ImageBackground
      source={require("@/assets/images/games/bg2.png")}
      style={styles.background}
    >
      <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.push("/(tabs)/components/games/Brainy_Fruits/welcomePage")}
              disabled={loading}
            >
              <Image
                source={require("@/assets/images/games/back-arrow.png")}
                style={styles.backIcon}
              />
            </TouchableOpacity>
      {/* <TouchableOpacity
        onPress={()=>router.push("/(tabs)/components/games/Brainy_Fruits/settings")}
      >
        <Image
          source={require("@/assets/images/games/settings.png")}
          style={styles.bottomIcon}
        />
      </TouchableOpacity> */}
      <View style={styles.container}>
        <Text style={styles.title}>Select Level</Text>

        <Text
          style={{
            marginTop: 15,
            marginBottom: 30,
            fontSize: 18,
            color: "#643a1aff",
            textAlign: "center",
            fontFamily: "ComicRelief-regular",
          }}
        >
          {errorMessage}
        </Text>

        <ScrollView contentContainerStyle={styles.levelsContainer}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.levelButton, loading && styles.disabledButton]}
              onPress={() => handleLevelSelect(level)}
              disabled={loading}
            >
              <Text style={styles.levelText}>Level {level}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Starting Level...</Text>
          </View>
        )}
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
  container: {
    flex: 1,
    width: "100%",
    padding: 20,
    alignItems: "center",
  },
  backBtn: { marginRight: 250, marginTop:30 },
  backIcon: {
    width: 38,
    height: 38,
  },
  title: {
    fontSize: 32,
    fontFamily: "ComicRelief-Bold",
    color: "#6C0303",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  levelsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
    paddingHorizontal: 10,
  },
  levelButton: {
    width: 120,
    height: 120,
    padding: 4,
    backgroundColor: "#fdeaab",
    borderWidth: 4,
    borderColor: "#764F1C",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  levelText: {
    fontSize: 20,
    fontFamily: "ComicRelief-Bold",
    color: "#6C0303",
    textAlign: "center",
  },
  loadingText: {
    fontSize: 18,
    fontFamily: "ComicRelief-Regular",
    color: "#6C0303",
    textAlign: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomIcon: {
    width: 50,
    height: 50,
    left: 130,
    top: 30,
  },
});
