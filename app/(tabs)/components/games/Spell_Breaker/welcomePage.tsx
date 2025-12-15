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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { soundManager } from "@/app/(tabs)/utils/soundManager";
import { API_BASE } from "@/app/(tabs)/utils/config";
import { globalSound } from "@/app/(tabs)/utils/globalSound";

export default function WelcomePage() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [childId, setChildId] = useState(null);
  const [loading, setLoading] = useState(false);
  const {isSoundPlaying, toggleSound} = globalSound();

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
        `${API_BASE}/game/start/spell?child_id=${childId}`,
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
        router.push("/(tabs)/components/games/Spell_Breaker/spellGame");
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
    <View style={styles.background}>
      <TouchableOpacity
        onPress={() =>
          router.push("/(tabs)/components/games/Spell_Breaker/settings")
        }
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 35,
            gap: 20,
          }}
        >
          <View>
            <TouchableOpacity
              style={styles.backBtn}
              disabled={loading}
              onPress={() => router.push("/components/games/gamesDashboard")}
            >
              <Image
                source={require("@/assets/images/games/spellGame/left-arrow.png")}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Image
              source={require("@/assets/images/games/spellGame/img4.png")}
              style={{ width: 160, height: 110 }}
            />
          </View>

          <View
            style={{
              flexDirection: "column",
              gap: 12,
              marginTop: 20,
              position: "relative",
              marginRight: 20,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#8f3db6ff",
                width: 45,
                height: 45,
                alignItems: "center",
                justifyContent: "center",
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
              onPress={() =>
                router.push("/(tabs)/components/games/Spell_Breaker/gameLevel")
              }
            >
              <Image
                source={require("@/assets/images/games/spellGame/level-spell.png")}
                style={{ width: 45, height: 45, borderRadius: 50 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/(tabs)/components/games/Spell_Breaker/spellBreakerFAQ"
                )
              }
            >
              <Image
                source={require("@/assets/images/games/spellGame/questions.png")}
                style={{ width: 45, height: 45, borderRadius: 50 }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push("/components/games/Spell_Breaker/settings")
              }
            >
              <Image
                source={require("@/assets/images/games/spellGame/settings.png")}
                style={{
                  height: 45,
                  width: 45,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.welcomeContainer}>
        <View style={styles.imageWrapper}>
          <Image
            source={require("@/assets/images/games/spellGame/welcome.png")}
            style={{ width: 250, height: 100 }}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handlePlayGame}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Starting..." : "Play"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push("/(tabs)/components/games/Spell_Breaker/progress")
            }
          >
            <Text style={styles.buttonText}>My Progress</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* <TouchableOpacity
        onPress={() => router.push("/components/games/Spell_Breaker/settings")}
      >
        <Image
          source={require("@/assets/images/games/spellGame/settings.png")}
          style={{
            height: 45,
            width: 45,
            position: "absolute",
            left: 10,
          }}
        />
      </TouchableOpacity> */}

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
  welcomeContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  backBtn: {
    marginTop: 20,
    marginLeft: 10,
  },
  backIcon: {
    width: 40,
    height: 40,
  },
  button: {
    backgroundColor: "#E11D93",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
    width: 170,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "ComicRelief-Bold",
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
