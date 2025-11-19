import { Background, HeaderTitle } from "@react-navigation/elements";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Font from "expo-font";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WelcomePage() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [childId, setChildId] = useState(null);
  const [loading, setLoading] = useState(false);

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
    }
  };

  const handlePlayGame = async () => {
    if (!childId) {
      Alert.alert("Error", "User data not available");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/game/start?child_id=${childId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem("gameSessionId", data.session_id);
        await AsyncStorage.setItem("currentGameData", JSON.stringify(data));
        console.log(
          "🎮 Start API called successfully, storing game data:",
          data
        );

        console.log("🎮 Start API called successfully, navigating to game");
        router.push("/(tabs)/components/games/Brainy_Fruits/fruitGame");
      } else {
        Alert.alert("Error", "Failed to start game");
      }
    } catch (error) {
      console.error("Error starting game:", error);
      Alert.alert("Error", "Failed to start game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/games/bg1.png")}
      style={styles.background}
    >
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.push("/(tabs)/components/games/gamesDashboard")}
        disabled={loading}
      >
        <Image
          source={require("@/assets/images/games/back-arrow.png")}
          style={styles.backIcon}
        />
      </TouchableOpacity>
      <View
        style={{
          flexDirection: "column",
          gap: 12,
          marginTop: 20,
          position: "relative",
          marginLeft: 20,
        }}
      >
        <TouchableOpacity
          // style={{
          //   backgroundColor: "#fff",
          //   width: 40,
          //   height: 40,
          //   alignItems: "center",
          //   borderRadius: 10,
          // }}
        >
          {/* <Ionicons
            name="volume-medium-outline"
            size={28}
            marginTop={14}
            color="#1b4621ff"
          /> */}
          <Image
            source={require("@/assets/images/games/audio.png")}
            style={{ width: 40, height: 40 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.push("/(tabs)/components/games/Brainy_Fruits/gameLevel")
          }
        >
          <Image
            source={require("@/assets/images/games/level2.png")}
            style={{ width: 40, height: 40 }}
          />
        </TouchableOpacity>

        <TouchableOpacity>
          <Image
            source={require("@/assets/images/games/question.png")}
            style={{ width: 40, height: 40 }}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.welcomeContainer}>
        <View style={styles.imageWrapper}>
          <Image
            source={require("@/assets/images/games/welcome 1.png")}
            style={styles.welcomeImage}
          />

          <View style={styles.overlayButtons}>
            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton]}
              onPress={handlePlayGame}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "STARTING..." : "Play"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#081C5B" }]}
              onPress={() =>
                router.push("/(tabs)/components/games/Brainy_Fruits/progress")
              }
            >
              <Text style={styles.buttonText}>My Progress</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={() =>
            router.push("/(tabs)/components/games/Brainy_Fruits/settings")
          }
        >
          <Image
            source={require("@/assets/images/games/settings.png")}
            style={styles.bottomIcon}
          />
        </TouchableOpacity>

        <Image
          source={require("@/assets/images/games/apple.png")}
          style={styles.bottomImage}
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
    justifyContent: "space-between",
    paddingVertical: 30,
  },
  welcomeContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeImage: {
    width: 350,
    height: 500,
    resizeMode: "contain",
  },
  backBtn: { marginLeft: 20 },
  backIcon: {
    width: 38,
    height: 38,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
  },
  overlayButtons: {
    position: "absolute",
    bottom: 160,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#FF4C4C",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 8,
    alignItems: "center",
    width: 170,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "ComicRelief-Bold",
  },
  bottomContainer: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    marginBottom: 20,
    position: "absolute",
    bottom: 0,
  },
  bottomIcon: {
    width: 50,
    height: 50,
    left: 10,
    resizeMode: "contain",
  },
  bottomImage: {
    width: 130,
    height: 130,
    resizeMode: "contain",
  },
});
