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
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function BrainyFruitsFAQ() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const brainyFruitsFAQ = [
    {
      question: "❓ 1. What do I do in this game?",
      answer:
        "👉 You solve fun fruit puzzles and answer questions to win points!",
    },
    {
      question: "❓ 2. How do I start playing?",
      answer: "👉 Just pick a level and press the Start button.",
    },
    {
      question: "❓ 3. Why do I see a timer?",
      answer:
        "👉 Because you need to finish the question before time runs out!",
    },
    {
      question: "❓ 4. What happens if I finish a level?",
      answer: "👉 You unlock the next level and get a reward! 🎉",
    },
    {
      question: "❓ 5. What if I can’t solve a question?",
      answer: "👉 Don’t worry! You can try again or replay the level. 😊",
    },
    {
      question: "❓ 6. Why are there fruits everywhere?",
      answer:
        "👉 Because the game teaches you numbers using cute fruits! 🍎🍇",
    },
    {
      question: "❓ 7. Can I replay old levels?",
      answer: "👉 Yes! You can replay any completed level anytime.",
    },
    {
      question: "❓ 8. What are the stars or points for?",
      answer:
        "👉 They show how well you played the level. More stars means great job! ⭐",
    },
    {
      question: "❓ 9. What if I make a mistake?",
      answer: "👉 It’s okay! Everyone learns by trying. You can try again!",
    },
    {
      question: "❓ 10. Is this game hard?",
      answer:
        "👉 No! Levels start easy and get fun and challenging slowly.",
    },
    {
      question: "❓ 11. What is Your Progress?",
      answer:
        "👉 It shows the levels you finished and your rewards.",
    },
    {
      question: "❓ 12. Why should I play this game?",
      answer:
        "👉 Because it makes you smarter with numbers while having fun! 🧠✨",
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
        source={require("@/assets/images/games/bg1.png")}
        style={styles.background}
      >
        <Text style={{ color: "#fff" }}>Loading...</Text>
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
        <ScrollView style={{ width: "100%" }}>

          <Text style={styles.headerText}>Brainy Fruits FAQ</Text>

          {brainyFruitsFAQ.map((item, index) => (
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
                  color="#1b4621"
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
    textAlign: "center",
    marginBottom: 30,
    marginTop:15,
    color: "#1b4621",
  },

  questionBox: {
    marginBottom: 20,
    backgroundColor: "#e8ffd9",
    borderRadius: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: "#77b55a",
  },

  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  questionText: {
    fontSize: 16,
    fontFamily: "ComicRelief-Bold",
    color: "#1b4621",
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
