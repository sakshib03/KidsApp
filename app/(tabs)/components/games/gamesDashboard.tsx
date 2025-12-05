import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Font from "expo-font";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { soundManager } from "../../utils/soundManager";

export default function GamesDashboard() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [backgroundSound, setBackgroundSound] = useState(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState(true);

  useEffect(() => {
    loadFonts();
    initializeSound();
    return () => {};
  }, []);

  const initializeSound = async () => {
    try {
      await soundManager.loadAndPlay();
      setIsSoundPlaying(soundManager.getIsPlaying());
    } catch (error) {
      console.error("Error initializing sound:", error);
    }
  };

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

  return (
    <ImageBackground
      source={require("@/assets/images/bg6.jpg")}
      style={styles.background}
      blurRadius={2}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/(tabs)/components/chatbot")}
      >
        <Feather name="arrow-left" size={24} color={"#fff"} />
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>

      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.labelContainer}>
            <Image
              source={require("@/assets/images/games/label.png")}
              style={styles.appleIcon}
            />

            <View style={styles.labelTextContainer}>
              <Text style={styles.labelText}>All</Text>
              <Text style={styles.labelText}>Games</Text>
            </View>
          </View>
        </View>

        {/* Game Grid */}
        <View style={styles.grid}>
          {/* Row 1 */}
          <View style={styles.row}>
            <View style={styles.cardContainer}>
              <View style={[styles.card, { borderColor: "#B71C1C" }]}>
                <Image
                  source={require("@/assets/images/games/game1.png")}
                  style={styles.cardImage}
                />
              </View>
              <TouchableOpacity
                style={styles.buttonRed}
                onPress={() =>
                  router.push(
                    "/(tabs)/components/games/Brainy_Fruits/landingPage"
                  )
                }
              >
                <Text style={styles.buttonText}>Brainy Fruits</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
              <View style={[styles.card, { borderColor: "#652e7dff" }]}>
                <Image
                  source={require("@/assets/images/games/spellGame/img4.png")}
                  style={styles.cardImage}
                />
              </View>
              <TouchableOpacity
                style={styles.buttonGreen}
                onPress={() =>
                  router.push(
                    "/(tabs)/components/games/Spell_Breaker/landingPage"
                  )
                }
              >
                <Text style={styles.buttonText}>Spell Breaker</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.row}>
            <View style={styles.cardContainer}>
              <View style={[styles.card, { borderColor: "#223E52" }]}>
                <Image
                  source={require("@/assets/images/games/game3.png")}
                  style={styles.cardImage}
                />
              </View>
              <TouchableOpacity
                style={styles.buttonBlue}
                onPress={() =>
                  router.push(
                    "/(tabs)/components/games/Mind_Mystery/landingPage"
                  )
                }
              >
                <Text style={styles.buttonText}>Mind Mystery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: "#ef523eff",
            padding: 10,
            width: 50,
            borderRadius: 50,
            marginLeft: 240,
          }}
          onPress={toggleSound}
        >
          <Ionicons
            name={
              isSoundPlaying ? "volume-medium-outline" : "volume-mute-outline"
            }
            size={30}
            color="#fff"
          />
        </TouchableOpacity>

        {/* <Image
          source={require("@/assets/images/games/settings.png")}
          style={styles.bottomIcon}
        /> */}
        {/* <Image
          source={require("@/assets/images/games/apple2.png")}
          style={styles.character}
        /> */}
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
    backgroundColor: "rgba(244, 255, 159, 0.95)",
    width: "90%",
    height: "80%",
    borderRadius: 25,
    paddingVertical: 20,
    paddingHorizontal: 15,
    position: "relative",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f45540ff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    left: -90,
    marginBottom: 20,
    marginTop: 25,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
    fontFamily: "ComicRelief-Bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
 labelTextContainer: {
  position: "absolute",
  top: "40%",
  left: "50%",
  transform: [{ translateY: -12 }],
  alignItems: "center",
},
labelText: {
  color: "#582525ff",
  fontSize: 18,
  fontFamily: "ComicRelief-Bold",
  textAlign: "center",
},
  appleIcon: {
    width: 160,
    height: 90,
    resizeMode: "contain",
  },
  grid: {
    width: "100%",
    flex: 1,
    marginTop: 30,
  },
  row: {
    flexDirection: "row",
    gap: 30,
    marginBottom: 30,
    justifyContent: "center",
  },
  cardContainer: {
    alignItems: "center",
    width: "44%",
  },
  card: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 4,
    marginBottom: 10,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  buttonRed: {
    backgroundColor: "#B71C1C",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonGreen: {
    backgroundColor: "#9b3ea9ff",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonBlue: {
    backgroundColor: "#223E52",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: "100%",
    alignItems: "center",
  },

  buttonText: {
    fontFamily: "ComicRelief-Bold",
    color: "#FFF",
    fontSize: 16,
  },
  footer: {
    width: "100%",
    position: "absolute",
    bottom: 10,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  settingIcon: {
    width: 40,
    height: 40,
  },
  footerCharacters: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  bottomIcon: {
    width: 60,
    height: 60,
    position: "absolute",
    bottom: -30,
    left: -10,
  },
  character: {
    width: 200,
    height: 170,
    position: "absolute",
    bottom: -55,
    right: -15,
    resizeMode: "contain",
  },
});
