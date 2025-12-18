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
  const {isSoundPlaying, toggleSound} =globalSound();
  const [openPlayInfo, setOpenPlayInfo] = useState(false);
  const [openFeature, setOpenFeature] = useState(false);
  const [openAccessibility, setOpenAccessibility] = useState(false);

  useEffect(() => {
    loadFonts();
  }, []);

  const HOW_TO_PLAY_TEXT = `
Brainy Fruits is a fun learning game for kids!

• Select a level and press Start
• Answer the questions before the time ends
• Count fruits or solve puzzles to score points
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
    <ImageBackground
      source={require("@/assets/images/games/bg2.png")}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.mainContainer}>
        <View style={styles.contentWrapper}>
          <Image
            source={require("@/assets/images/games/cloud.png")}
            style={styles.completedBanner}
          />
          <Image
            source={require("@/assets/images/games/settings1.png")}
            style={[styles.completedBanner, { width: 150, top: -50 }]}
          />

          <View style={styles.container}>
            <View style={{ flexDirection: "row", gap: 25, marginTop: 30 }}>
              <TouchableOpacity
                style={{
                  width: 45,
                  height: 45,
                  padding: 4,
                  backgroundColor: "#fff",
                }}
                onPress={toggleSound}
              >
                <Ionicons
                  name={
                    isSoundPlaying
                      ? "volume-medium-outline"
                      : "volume-mute-outline"
                  }
                  size={40}
                  color="#1b4621ff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push(
                    "/(tabs)/components/games/Brainy_Fruits/welcomePage"
                  )
                }
              >
                <Image
                  source={require("@/assets/images/games/home.png")}
                  style={{ width: 50, height: 45 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
              onPress={()=>router.push("/(tabs)/components/games/Brainy_Fruits/brainyFruitsFAQ")}
              >
                <Image
                  source={require("@/assets/images/games/question.png")}
                  style={{ width: 45, height: 45 }}
                />
              </TouchableOpacity>
            </View>

            {/* <TouchableOpacity onPress={()=>router.push("/(tabs)/components/games/Brainy_Fruits/gameLevel")} style={{marginTop:10}}>
                <Text style={styles.progress}>Select Level</Text>
              </TouchableOpacity> */}

            <TouchableOpacity
              style={{
                flexDirection: "row",
                gap: 15,
                backgroundColor: "#46BEF5",
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 6,
                marginTop: 10,
              }}
              onPress={() =>
                router.push("/(tabs)/components/games/Brainy_Fruits/progress")
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
             
              <Text style={styles.buttonText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Image
          source={require("@/assets/images/games/apple2.png")}
          style={styles.character}
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
    width: 340,
    height: 100,
    resizeMode: "contain",
    position: "absolute",
    zIndex: 1000,
    bottom: 345,
  },
  container: {
    borderWidth: 16,
    borderColor: "#20860E",
    backgroundColor: "#FFF4F4",
    height: 380,
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
    fontSize: 20,
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
    width: "100%",
    gap: 8,
    alignContent: "center",
  },
  progress: {
    fontSize: 18,
    color: "#3B5924",
    fontFamily: "ComicRelief-Regular",
  },
  backButton: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#406027ff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 20,
  },
  buttonText: {
    marginTop: 2,
    fontSize: 18,
    fontFamily: "ComicRelief-Bold",
    color: "#fff",
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
  

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(1, 1, 1, 0.6)",
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
    color: "#1b4621",
    marginBottom: 5,
    textAlign: "center",
  },

  modalContent: {
    fontSize: 16,
    fontFamily: "ComicRelief-Regular",
    color: "#3a3a3a",
    lineHeight: 24,
    marginBottom: 15,
  },

  closeBtn: {
    backgroundColor: "#46BEF5",
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
