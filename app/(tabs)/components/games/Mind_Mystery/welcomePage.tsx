import { API_BASE } from "@/app/(tabs)/utils/config";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as Font from "expo-font";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { soundManager } from "@/app/(tabs)/utils/soundManager";
const { width, height } = Dimensions.get("window");

export default function WelcomePage() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [childId, setChildId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(true);

  useEffect(() => {
    loadFonts();
    fetchChildId();
  }, []);

  const toggleSound = async () => {
    try {
      await soundManager.toggle();
      setIsSoundPlaying(soundManager.getIsPlaying());
    } catch (error) {
      console.error("Error toggling sound:", error);
    }
  };

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
        `${API_BASE}/mind-mystery/Start?child_id=${childId}`,
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
        router.push("/(tabs)/components/games/Mind_Mystery/mindMysteryGame");
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
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/games/mindMystery/bg1.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() =>
                router.push("/(tabs)/components/games/gamesDashboard")
              }
              disabled={loading}
            >
              <Feather name="arrow-left" size={26} color={"#fff"} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "column",
              gap: 12,
              marginTop: 30,
              marginRight: 20,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#223E52",
                padding: 10,
                width: 50,
                borderRadius: 50,
              }}
              onPress={toggleSound}
            >
              <Ionicons
                name={
                  isSoundPlaying
                    ? "volume-medium-outline"
                    : "volume-mute-outline"
                }
                size={30}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "#223E52",
                padding: 10,
                width: 50,
                borderRadius: 50,
              }}
              onPress={() =>
                router.push("/(tabs)/components/games/Mind_Mystery/gameLevel")
              }
            >
              <Image
                source={require("@/assets/images/games/mindMystery/level-chart.png")}
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "#223E52",
                padding: 10,
                width: 50,
                borderRadius: 50,
              }}
            >
              <Image
                source={require("@/assets/images/games/mindMystery/questions.png")}
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* CLOUD */}
        <View style={styles.cloudContainer}>
          <Image
            source={require("@/assets/images/games/mindMystery/cloud.png")}
            style={styles.cloudImage}
            resizeMode="contain"
          />
          <Text style={styles.cloudText}>WELCOME</Text>
        </View>

        {/* SIGNBOARD IMAGE (shifted right) */}
        <View style={styles.signWrapper}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayGame}
            disabled={loading}
          >
            <Image
              source={require("@/assets/images/games/mindMystery/play2.png")}
              style={styles.playImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.progressButton}
            onPress={() =>
              router.push("/components/games/Mind_Mystery/progress")
            }
          >
            <Image
              source={require("@/assets/images/games/mindMystery/progress.png")}
              style={styles.progressImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* SETTINGS BUTTON */}
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push("/components/games/Mind_Mystery/settings")}
        >
          <Image
            source={require("@/assets/images/games/mindMystery/settings.png")}
            style={styles.settingsImg}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backBtn: {
    marginLeft: 20,
    marginTop: 30,
    backgroundColor: "#223E52",
    padding: 6,
    borderRadius: 5,
  },
  backIcon: {
    width: 45,
    height: 45,
  },
  /* CLOUD */
  cloudContainer: {
    alignItems: "center",
    marginTop: -80,
  },

  cloudImage: {
    width: width * 0.9,
    height: height * 0.22,
    marginTop: 60,
  },

  cloudText: {
    position: "absolute",
    top: height * 0.1,
    fontSize: 32,
    fontWeight: "900",
    color: "#052234",
    marginTop: 60,
  },

  signWrapper: {
    position: "absolute",
    bottom: 50,
    left: 145,
    width: width * 0.6,
    height: height * 0.38,
    alignItems: "center",
  },

  playButton: {
    width: "67%",
    height: "23%",
  },

  playImage: {
    width: "100%",
    height: "100%",
  },

  progressButton: {
    width: "70%",
    height: "26%",
  },

  progressImage: {
    width: "100%",
    height: "120%",
  },

  signBoard: {
    width: "70%",
    height: "26%",
  },

  /* SETTINGS BUTTON */
  settingsBtn: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  settingsImg: {
    width: 45,
    height: 45,
  },
});
