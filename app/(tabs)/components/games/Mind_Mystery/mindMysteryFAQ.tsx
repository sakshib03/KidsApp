import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";

// Enable animation on Android
// if (Platform.OS === "android") {
//   UIManager.setLayoutAnimationEnabledExperimental &&
//     UIManager.setLayoutAnimationEnabledExperimental(true);
// }

export default function MindMysteryFAQ() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const mindMysteryFAQ = [
  {
    question: "❓ 1. What do I do in this game?",
    answer:
      "👉 You look at shadow images and solve fun riddles to guess the right answer!",
  },
  {
    question: "❓ 2. How do I start playing?",
    answer: "👉 Choose a level and press the Start button to begin the mystery.",
  },
  {
    question: "❓ 3. Why is there a timer?",
    answer:
      "👉 Because you must solve the riddle or identify the shadow before the time runs out!",
  },
  {
    question: "❓ 4. What happens when I finish a level?",
    answer: "👉 You unlock the next level and get a cool reward! 🎉",
  },
  {
    question: "❓ 5. What if I can’t solve a riddle?",
    answer:
      "👉 No worries! You can try again or replay the level until you crack the mystery. 😊",
  },
  {
    question: "❓ 6. Why are there shadow images?",
    answer:
      "👉 Because Mind Mystery helps you think, imagine, and guess using just shapes and hints! 🌟",
  },
  {
    question: "❓ 7. Can I replay old levels?",
    answer: "👉 Yes! You can replay any completed level anytime to improve your score.",
  },
  {
    question: "❓ 8. What are stars or points for?",
    answer:
      "👉 Stars show how well you solved the mystery. More stars mean you’re a super detective! ⭐",
  },
  {
    question: "❓ 9. What if I pick the wrong answer?",
    answer:
      "👉 It’s okay! Mistakes help you learn. You can try again and solve the mystery!",
  },
  {
    question: "❓ 10. Is Mind Mystery a hard game?",
    answer:
      "👉 Not at all! It starts easy and becomes more fun and exciting as you go.",
  },
  {
    question: "❓ 11. What is My Progress?",
    answer:
      "👉 It shows the levels you completed, your stars, and rewards you collected.",
  },
  {
    question: "❓ 12. Why should I play Mind Mystery?",
    answer:
      "👉 Because it boosts your thinking power, improves imagination, and makes learning fun! 🧠✨",
  },
];


  useEffect(() => {
    loadFonts();
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

  const toggleAnswer = (index) => {
    LayoutAnimation.easeInEaseOut();
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!fontsLoaded) {
    return (
      <ImageBackground
        source={require("@/assets/images/games/mindMystery/bg3.png")}
        style={styles.background}
      >
        <Text style={{ color: "#fff" }}>Loading...</Text>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/games/mindMystery/bg3.png")}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.mainContainer}>
        <ScrollView style={{ width: "100%" }}>

          <Text style={styles.headerText}>Brainy Fruits FAQ</Text>

          {mindMysteryFAQ.map((item, index) => (
            <View key={index} style={styles.questionBox}>
              <TouchableOpacity
                style={styles.questionRow}
                onPress={() => toggleAnswer(index)}
              >
                <Text style={styles.questionText}>{item.question}</Text>

                <Ionicons
                  name={
                    openIndex === index
                      ? "chevron-up-outline"
                      : "chevron-down-outline"
                  }
                  size={25}
                  color="#223E52"
                />
              </TouchableOpacity>

              {openIndex === index && (
                <Text style={styles.answerText}>{item.answer}</Text>
              )}
            </View>
          ))}

          <View style={{ height: 30 }} />
        </ScrollView>
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
    width: "90%",
    height: "85%",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 15,
    padding: 15,
  },

  headerText: {
    fontSize: 26,
    fontFamily: "ComicRelief-Bold",
    fontWeight:700,
    textAlign: "center",
    marginBottom: 30,
    marginTop:15,
    color: "#223E52",
  },

  questionBox: {
    marginBottom: 20,
    backgroundColor: "#d9ebffff",
    borderRadius: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: "#314c5fff",
  },

  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  questionText: {
    fontSize: 16,
    fontFamily: "ComicRelief-Bold",
    color: "#223E52",
    width: "90%",
  },

  answerText: {
    fontSize: 15,
    fontFamily: "ComicRelief-Regular",
    color: "#3b3b3b",
    marginTop: 8,
    paddingLeft: 5,
    lineHeight: 22,
  },
});
