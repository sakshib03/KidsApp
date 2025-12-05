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

export default function SpellBreakerFAQ() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const spellBreakerFAQ = [
  {
    question: "❓ 1. What do I do in this game?",
    answer: "👉 You break the wrong spelling by choosing the correct word!",
  },
  {
    question: "❓ 2. How do I start playing?",
    answer: "👉 Pick a level and tap the Start button to begin.",
  },
  {
    question: "❓ 3. Why is there a timer?",
    answer: "👉 You need to find the correct spelling before the time ends!",
  },
  {
    question: "❓ 4. What happens after I complete a level?",
    answer: "👉 You unlock the next level and earn stars! ⭐",
  },
  {
    question: "❓ 5. What if I pick the wrong word?",
    answer: "👉 No problem! You can try again and learn the correct spelling.",
  },
  {
    question: "❓ 6. Why are there words everywhere?",
    answer: "👉 Because the game helps you learn spellings in a fun way!",
  },
  {
    question: "❓ 7. Can I replay levels?",
    answer: "👉 Yes! You can replay any level to improve your score.",
  },
  {
    question: "❓ 8. What are stars or points?",
    answer: "👉 They show how well you played. More stars mean super spelling skills! 🌟",
  },
  {
    question: "❓ 9. What if I make a mistake?",
    answer: "👉 It's okay! Mistakes help you learn new spellings.",
  },
  {
    question: "❓ 10. Is this game difficult?",
    answer: "👉 Not at all! It starts easy and gets more exciting step by step.",
  },
  {
    question: "❓ 11. What is My Progress?",
    answer: "👉 It's where you see your levels, stars, and achievements.",
  },
  {
    question: "❓ 12. Why should I play Spell Breaker?",
    answer: "👉 Because it makes you a spelling champion while having fun! 🧠✨",
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
      <View
        style={styles.background}
      >
        <Text style={{ color: "#fff" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View
      style={styles.background}
    >
      <View style={styles.mainContainer}>
        <ScrollView style={{ width: "100%" }}>

          <Text style={styles.headerText}>Brainy Fruits FAQ</Text>

          {spellBreakerFAQ.map((item, index) => (
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
                  color="#861C90"
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
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fadcfeff",
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
    color: "#861C90",
    fontWeight:700,
  },

  questionBox: {
    marginBottom: 20,
    backgroundColor: "#f9e5ffff",
    borderRadius: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: "#861C90",
  },

  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  questionText: {
    fontSize: 16,
    fontFamily: "ComicRelief-Bold",
    color: "#861C90",
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
