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
import Question from "../../question";

export default function Settings() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(true);
  const [openPlayInfo, setOpenPlayInfo] = useState(false);
  const [openFeature, setOpenFeature] = useState(false);
  const [openAccessibility, setOpenAccessibility] = useState(false);
  const [openQuestions, setOpenQuestions] = useState(false);

  useEffect(() => {
    loadFonts();
  }, []);

  const HOW_TO_PLAY_TEXT = `
Mind Mystery is a fun shadow-guessing and riddle game for kids!

• Choose a level and press Start
• Look carefully at the shadow image
• Read the riddle and guess the answer
• Select the correct option before the timer ends
• Submit your answer to complete the question
• Finish all questions to unlock the next level 🎉
`;

  const FEATURES_TEXT = `
• 100+ exciting shadow and riddle levels
• Fun timer-based guessing challenges
• Reward animations after each level
• Track your progress and earned stars
• Replay any level to improve your score
• Beautiful, kid-friendly shadow graphics 🌟
`;

  const ACCESSIBILITY_TEXT = `
• Large buttons and simple navigation
• High-contrast shadow images
• Easy-to-read riddles and options
• Designed for slow learners as well
• Safe, distraction-free kid experience ♿
`;

  const mindMysteryFAQ = [
    {
      question: "❓ 1. What do I do in this game?",
      answer:
        "👉 You solve fun fruit puzzles and answer questions to win points!",
    },
    {
      question: "❓ 2. How do I start playing?",
      answer: "Just pick a level and press the Start button.",
    },
    {
      question: "❓ 3. Why do I see a timer?",
      answer: "Because you need to finish the question before time runs out!",
    },
    {
      question: "❓ 4. What happens if I finish a level?",
      answer: "You unlock the next level and get a reward! 🎉",
    },
    {
      question: "❓ 5. What if I can’t solve a question?",
      answer: "Don’t worry! You can try again or replay the level. 😊",
    },
    {
      question: "❓ 6. Why are there fruits everywhere?",
      answer: "Because the game teaches you numbers using cute fruits! 🍎🍇",
    },
    {
      question: "Can I replay old levels?",
      answer: "Yes! You can replay any completed level anytime.",
    },
    {
      question: "What are the stars or points for?",
      answer:
        "They show how well you played the level. More stars means great job! ⭐",
    },
    {
      question: "What if I make a mistake?",
      answer: "It’s okay! Everyone learns by trying. You can try again!",
    },
    {
      question: "Is this game hard?",
      answer: "No! Levels start easy and get fun and challenging slowly.",
    },
    {
      question: "Can I pause the game?",
      answer: "Yes, you can pause using the pause button.",
    },
    {
      question: "What is Your Progress?",
      answer: "It shows the levels you finished and your rewards.",
    },
    {
      question: "Why should I play this game?",
      answer:
        "Because it makes you smarter with numbers while having fun! 🧠✨",
    },
  ];

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
      source={require("@/assets/images/games/mindMystery/bg3.png")}
      style={styles.background}
    >
      <View style={styles.mainContainer}>
        <View style={styles.contentWrapper}>
          <Image
            source={require("@/assets/images/games/cloud.png")}
            style={styles.completedBanner}
          />
          <Image
            source={require("@/assets/images/games/mindMystery/settings1.png")}
            style={[styles.completedBanner, { width: 150, top: -50 }]}
          />

          <View style={styles.container}>
            <View style={{ flexDirection: "row", gap: 20, marginTop: 20 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#223E52",
                  padding: 4,
                  borderRadius: 5,
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
                  router.push(
                    "/(tabs)/components/games/Mind_Mystery/welcomePage"
                  )
                }
              >
                <Image
                  source={require("@/assets/images/games/mindMystery/home.png")}
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#223E52",
                    padding: 8,
                    borderRadius: 5,
                  }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push(
                    "/(tabs)/components/games/Mind_Mystery/mindMysteryFAQ"
                  )
                }
              >
                <Image
                  source={require("@/assets/images/games/mindMystery/questions.png")}
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#223E52",
                    padding: 8,
                    borderRadius: 5,
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* <TouchableOpacity
              onPress={() =>
                router.push("/(tabs)/components/games/Mind_Mystery/gameLevel")
              }
              style={{ marginTop: 10 }}
            >
              <Text style={styles.progress}>Select Level</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={{
                flexDirection: "row",
                gap: 15,
                backgroundColor: "#223E52",
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 6,
                marginTop: 10,
              }}
              onPress={() =>
                router.push("/(tabs)/components/games/Mind_Mystery/progress")
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
                router.push("/(tabs)/components/games/Mind_Mystery/welcomePage")
              }
            >
              <Feather name="arrow-left" size={26} color={"#fff"} />

              <Text style={styles.buttonText}>BACK</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Image
          source={require("@/assets/images/games/mindMystery/tree.png")}
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
    paddingVertical: 10,
    paddingHorizontal: 10,
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
    bottom: 370,
  },
  container: {
    borderWidth: 16,
    borderColor: "#223E52",
    backgroundColor: "#E0F2FF",
    height: 400,
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
    marginTop: 10,
    marginLeft: 80,
    gap: 6,
    width: "100%",
    alignContent: "center",
  },
  progress: {
    fontSize: 18,
    color: "#223E52",
    fontFamily: "ComicRelief-Regular",
  },
  backButton: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#223E52",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
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
    height: 250,
    position: "absolute",
    bottom: -60,
    right: 150,
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
    marginTop: 10,
    fontSize: 22,
    fontFamily: "ComicRelief-Bold",
    color: "#223E52",
    marginBottom: 10,
    textAlign: "center",
  },

  modalContent: {
    fontSize: 16,
    fontFamily: "ComicRelief-Regular",
    color: "#3a3a3a",
    lineHeight: 24,
    marginBottom: 20,
  },

  closeBtn: {
    backgroundColor: "#223E52",
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
