import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as Font from "expo-font";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "@/app/(tabs)/utils/config";

export default function Progress() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [childId, setChildId] = useState("");
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFonts();
    fetchChildId();
  }, []);

  useEffect(() => {
    if (childId) {
      handleProgress();
    }
  }, [childId]);

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

  const handleProgress = async () => {
    if (!childId) {
      Alert.alert("Error", "User data not available");
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/game/progress/spell/${childId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Child Progress:", data);
        setProgressData(data);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching game data:", error);
      Alert.alert("Error", "Failed to load game data");
    }
  };

  if (!fontsLoaded) {
    return (
      <ImageBackground
        source={require("@/assets/images/games/bg1.png")}
        style={styles.background}
      >
        <Text style={styles.loadingText}>Loading...</Text>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.background}>
      <View style={styles.mainContainer}>
        <View style={styles.contentWrapper}>
          <Image
            source={require("@/assets/images/games/spellGame/Your Progress.png")}
            style={styles.completedBanner}
          />

          <View style={styles.container}>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <Image
                source={require("@/assets/images/games/user.png")}
                style={{ width: 40, height: 40 }}
              />
              <Text style={styles.levelTitle}>{progressData?.username}</Text>
            </View>

            <View style={styles.starsContainer}>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Current Level:</Text>
                <Text style={styles.progressValue}>
                  {progressData?.current_level}
                </Text>
              </View>

              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Next Unlock Level:</Text>
                <Text style={styles.progressValue}>
                  {progressData?.next_level}
                </Text>
              </View>

              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Total Levels:</Text>
                <Text style={styles.progressValue}>
                  {progressData?.total_levels}
                </Text>
              </View>
            </View>

            <ScrollView style={styles.levelPointsContainer}>
              <View>
                {progressData?.points_per_level &&
                  Object.entries(progressData.points_per_level).map(
                    ([level, points]) => (
                      <View key={level} style={styles.levelPointsRow}>
                        <Text style={styles.levelText}>Level {level}:</Text>
                        <Text style={styles.pointsText}>{points} points</Text>
                      </View>
                    )
                  )}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.exitButton}
              onPress={() =>
                router.push("/(tabs)/components/games/Spell_Breaker/welcomePage")
              }
            >
              <Text style={styles.buttonText}>BACK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <Image
          source={require("@/assets/images/games/spellGame/flower.png")}
          style={styles.flowerBottom}
          blurRadius={1}
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
    alignItems: "center",
    backgroundColor: "#fadcfeff",
  },
  mainContainer: {
    alignItems: "center",
    width: "90%",
    height: "85%",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    position: "relative",
  },
  contentWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    position: "relative",
  },
  completedBanner: {
    width: 240,
    height: 80,
    resizeMode: "contain",
    position: "absolute",
    zIndex: 1000,
    bottom: 422,
  },
  container: {
    marginTop:40,
    borderWidth: 18,
    borderColor: "#9F34A1",
    backgroundColor: "#FFBDBD",
    height: 450,
    width: 290,
    borderRadius: 10,
    padding: 6,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  levelTitle: {
    fontSize: 26,
    fontFamily: "ComicRelief-Bold",
    color: "#481255",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  progress: {
    fontSize: 16,
    color: "#0e0a0aff",
    fontFamily: "ComicRelief-Regular",
  },
  exitButton: {
    backgroundColor: "#8d23a7ff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 40,
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: "ComicRelief-Bold",
    color: "#fff",
    textAlign: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "ComicRelief-Regular",
  },
  starsContainer: {
    marginTop: 15,
    backgroundColor: "#fff9e6",
    borderRadius: 10,
    padding: 10,
    width: "90%",
  },
  progressItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  progressLabel: {
    fontSize: 16,
    color: "#333",
    fontFamily: "ComicRelief-Regular",
  },
  progressValue: {
    fontSize: 16,
    color: "#6C0303",
    fontFamily: "ComicRelief-Bold",
  },
  levelPointsContainer: {
    marginTop: 15,
    backgroundColor: "#ffeccc",
    borderRadius: 8,
    padding: 10,
    margin: 10,
    width: "100%",
  },
  levelPointsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 3,
  },
  levelText: {
    color: "#0e0a0a",
    fontFamily: "ComicRelief-Regular",
    fontSize: 15,
  },
  pointsText: {
    color: "#d49e0e",
    fontFamily: "ComicRelief-Bold",
    fontSize: 15,
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
    height: 280,
  },
});
