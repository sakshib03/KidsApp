import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Font from "expo-font";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { soundManager } from "@/app/(tabs)/utils/soundManager";
import { globalSound } from "@/app/(tabs)/utils/globalSound";

export default function Settings() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const {isSoundPlaying, toggleSound} = globalSound();
  const [openPlayInfo, setOpenPlayInfo] = useState(false);
  const [openFeature, setOpenFeature] = useState(false);
  const [openAccessibility, setOpenAccessibility] = useState(false);

  useEffect(() => {
    loadFonts();
  }, []);

  const HOW_TO_PLAY_TEXT = `
Spell Breaker is a fun learning game for kids!

• Select a level and press Start
• Answer the questions before the time ends
• Guess the correct word to score points
• Submit your answer to finish the level
• Complete levels to unlock new ones 🎉
`;

  const FEATURES_TEXT = `
• 100 exciting learning levels
• Timer-based fun challenges
• Reward animations after each level
• Track child's progress easily
• Replay previous levels anytime
• Colorful kid-friendly graphics 🎨
`;

  const ACCESSIBILITY_TEXT = `
• Big buttons and clean UI
• High contrast colors
• Simple and clear instructions
• Slow-learning friendly design
• Kid-safe and easy navigation ♿
`;

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
            source={require("@/assets/images/games/spellGame/snail.png")}
            style={[
              styles.completedBanner,
              { width: 150, top: -50, marginRight: 240 },
            ]}
          />
          <Image
            source={require("@/assets/images/games/spellGame/cloud.png")}
            style={styles.completedBanner}
          />
          <Image
            source={require("@/assets/images/games/spellGame/settings1.png")}
            style={[styles.completedBanner, { width: 150, top: -20 }]}
          />

          <View style={styles.container}>
            <View style={{ flexDirection: "row", gap: 14, marginTop: 30 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#FFF",
                  padding: 12,
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
                  size={35}
                  color="#8f3db6ff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push(
                    "/(tabs)/components/games/Spell_Breaker/welcomePage"
                  )
                }
                style={{
                  backgroundColor: "#FFF",
                  padding: 14,
                  borderRadius: 50,
                }}
              >
                <Image
                  source={require("@/assets/images/games/spellGame/home.png")}
                  style={{ width: 30, height: 30 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: "#FFF",
                  padding: 10,
                  borderRadius: 50,
                }}
                onPress={()=>router.push("/(tabs)/components/games/Spell_Breaker/spellBreakerFAQ")}
              >
                <Image
                  source={require("@/assets/images/games/spellGame/question (2).png")}
                  style={{ width: 40, height: 40 }}
                />
              </TouchableOpacity>
            </View>

            {/* <TouchableOpacity
              onPress={() =>
                router.push("/(tabs)/components/games/Spell_Breaker/gameLevel")
              }
              style={{ marginTop: 10 }}
            >
              <Text style={styles.progress}>Select Level</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={{
                flexDirection: "row",
                gap: 15,
                backgroundColor: "#fa3dd5ff",
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 6,
                marginTop: 10,
              }}
              onPress={() =>
                router.push("/(tabs)/components/games/Spell_Breaker/progress")
              }
            >
              <Text style={styles.levelTitle}>Your Progress</Text>
            </TouchableOpacity>

            {/* Stars Section */}
            <View style={styles.infoContainer}>
              <TouchableOpacity onPress={() => setOpenPlayInfo(true)}>
                <Text style={styles.progress}>{"\u25CF"} How to play</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setOpenFeature(true)}>
                <Text style={styles.progress}>{"\u25CF"} Features</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setOpenAccessibility(true)}>
                <Text style={styles.progress}>{"\u25CF"} Accessibility</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                router.push("/(tabs)/components/games/gamesDashboard")
              }
            >
              <Image
                source={require("@/assets/images/games/spellGame/left-arrow.png")}
                style={styles.backIcon}
              />

              <Text style={styles.buttonText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <Image
          source={require("@/assets/images/games/spellGame/flower.png")}
          style={styles.flowerBottom}
          blurRadius={2}
        />
      </View>

      {(openPlayInfo || openFeature || openAccessibility) && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {openPlayInfo
                ? "How to Play"
                : openFeature
                ? "Features"
                : "Accessibility"}
            </Text>

            <Text style={styles.modalContent}>
              {openPlayInfo
                ? HOW_TO_PLAY_TEXT
                : openFeature
                ? FEATURES_TEXT
                : ACCESSIBILITY_TEXT}
            </Text>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setOpenPlayInfo(false);
                setOpenFeature(false);
                setOpenAccessibility(false);
              }}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    marginTop: 100,
    position: "relative",
  },
  completedBanner: {
    width: 320,
    height: 90,
    resizeMode: "contain",
    position: "absolute",
    zIndex: 1000,
    bottom: 355,
  },
  container: {
    marginTop: 30,
    borderWidth: 18,
    borderColor: "#861C90",
    backgroundColor: "#FFC7C9",
    height: 400,
    width: 300,
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
    fontSize: 18,
    fontFamily: "ComicRelief-Bold",
    color: "#ffffffff",
    textAlign: "center",
    marginTop: 2,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  infoContainer: {
    marginTop: 15,
    marginLeft: 60,
    gap: 6,
    width: "100%",
    alignContent: "center",
  },
  progress: {
    fontSize: 18,
    color: "#451760",
    fontFamily: "ComicRelief-Regular",
  },
  backButton: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 15,
    marginBottom: 10,
    marginTop: 20,
  },
  buttonText: {
    marginTop: 2,
    fontSize: 18,
    fontFamily: "ComicRelief-Bold",
    color: "#451760",
    textAlign: "center",
  },
  character: {
    width: 220,
    height: 200,
    position: "absolute",
    bottom: -30,
    right: 10,
    resizeMode: "contain",
  },
  loadingText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "ComicRelief-Regular",
  },
  backIcon: {
    width: 30,
    height: 30,
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
    height: 270,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 22,
    fontFamily: "ComicRelief-Bold",
    color: "#451760",
    marginBottom: 10,
    textAlign: "center",
  },

  modalContent: {
    paddingHorizontal:10,
    fontSize: 16,
    fontFamily: "ComicRelief-Regular",
    color: "#3a3a3a",
    lineHeight: 24,
    marginBottom: 20,
  },

  closeBtn: {
    backgroundColor: "#451760",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  closeText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "ComicRelief-Bold",
  },
});
