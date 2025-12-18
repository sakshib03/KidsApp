import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as Font from "expo-font";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../utils/ThemeContext";
import { API_BASE } from "../utils/config";

export default function Question() {
  const [questionData, setQuestionData] = useState(null);
  const [childId, setChildId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [sound, setSound] = useState(null);
  const { theme } = useTheme();

  // Helper function to check if user has already answered today
  const hasAlreadyAnswered = () => {
    return questionData?.note?.includes("already answered today");
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  async function playSound(isCorrect) {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const soundFile = isCorrect
        ? require("../../../assets/audio/mixkit-correct.wav")
        : require("../../../assets/audio/mixkit-wrong.wav");

      const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(console.error);
      }
    };
  }, [sound]);

  useEffect(() => {
    Font.loadAsync({
      "ComicRelief-Bold": require("../../../assets/fonts/ComicRelief-Bold.ttf"),
      "ComicRelief-Regular": require("../../../assets/fonts/ComicRelief-Regular.ttf"),
    }).then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    fetchChildId();
  }, []);

  const fetchChildId = async () => {
    try {
      const childData = await AsyncStorage.getItem("userData");
      console.log("Parsed userData:", childData);
      if (childData) {
        const parsedData = JSON.parse(childData);
        setChildId(parsedData.child_id);
        fetchQuestion(parsedData.child_id);
      }
    } catch (error) {
      console.error("Error fetching child ID:", error);
    }
  };

  const fetchQuestion = async (id) => {
    try {
      setLoading(true);
      setSelectedAnswer(null);
      setShowResult(false);
      setResult(null);

      const response = await fetch(`${API_BASE}/generate-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child_id: id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch question");
      }

      const data = await response.json();
      console.log("Full API response:", data);
      setQuestionData(data);
      
      // If already answered, don't show any selected answer
      if (data.note?.includes("already answered today")) {
        setSelectedAnswer(null);
        setShowResult(false);
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      Alert.alert("Error", "Failed to load question. Please try again.");
      setQuestionData(null);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer) => {
    if (!childId || !questionData || hasAlreadyAnswered()) return;

    try {
      setSubmitting(true);
      setSelectedAnswer(answer);

      const response = await fetch(`${API_BASE}/submit-question-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child_id: childId,
          selected_answer: answer,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      const resultData = await response.json();
      console.log("Answer submission result:", resultData);

      setResult(resultData);
      setShowResult(true);

      if (resultData.is_correct === true || resultData.is_correct === false) {
        await playSound(resultData.is_correct);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      Alert.alert("Error", "Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getOptionStyle = (optionKey) => {
    const correctAnswer = questionData?.correct_answer;
    
    // If user has already answered today, only highlight correct answer
    if (hasAlreadyAnswered()) {
      if (optionKey === correctAnswer) {
        return styles.correctOption;
      }
      return styles.optionButtonDisabled;
    }
    
    // Original logic for normal flow
    if (!selectedAnswer) return styles.optionButton;

    if (optionKey === correctAnswer) {
      return styles.correctOption;
    } else if (optionKey === selectedAnswer && optionKey !== correctAnswer) {
      return styles.incorrectOption;
    }
    return styles.optionButton;
  };

  // Helper function to get option text style
  const getOptionTextStyle = (optionKey) => {
    const correctAnswer = questionData?.correct_answer;
    
    if (hasAlreadyAnswered() && optionKey === correctAnswer) {
      return styles.correctOptionText;
    }
    return styles.optionText;
  };

  return (
    <ImageBackground
      style={styles.background}
      source={theme.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/components/chatbot")}
          >
            <Feather name="arrow-left" size={24} color={"#fff"} />
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#f35a5aff" />
              <Text style={styles.loadingText}>
                Generating your question...
              </Text>
            </View>
          ) : questionData && questionData.question ? (
            <View style={styles.questionWrapper}>
              {questionData?.note && (
                <View style={[
                  styles.noteContainer,
                  hasAlreadyAnswered() ? styles.noteContainerAnswered : styles.noteContainerNormal
                ]}>
                  <Text style={styles.noteText}>
                    {questionData.note}
                  </Text>
                </View>
              )}
              <ScrollView
                style={styles.questionContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <Text style={styles.questionTitle}>Question:</Text>
                <Text style={styles.questionText}>
                  {questionData.question || "No question text available"}
                </Text>

                <View style={styles.optionsContainer}>
                  {Object.entries(questionData.options || {}).map(
                    ([key, value]) => (
                      <TouchableOpacity
                        key={key}
                        style={getOptionStyle(key)}
                        onPress={() =>
                          !submitting && !selectedAnswer && !hasAlreadyAnswered() && submitAnswer(key)
                        }
                        disabled={submitting || !!selectedAnswer || hasAlreadyAnswered()}
                      >
                        <Text
                          style={getOptionTextStyle(key)}
                        >{`${key}: ${value}`}</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </ScrollView>

              {/* Only show result if NOT already answered today */}
              {showResult && result && !hasAlreadyAnswered() && (
                <View style={styles.resultContainer}>
                  <View style={styles.resultTextContainer}>
                    {result.is_correct === true ? (
                      <>
                        <Image
                          source={require("../../../assets/gifs/congratulations.gif")}
                          style={styles.celebrationGif}
                          resizeMode="contain"
                        />
                        <Text style={styles.resultExplanation}>
                          Correct answer.
                        </Text>
                      </>
                    ) : result.is_correct === false ? (
                      <Text style={styles.resultTitle}>Try Again! 💪</Text>
                    ) : (
                      <Text style={styles.errorText}>
                        {result.explanation ||
                          "Come back tomorrow for a new question!"}
                      </Text>
                    )}
                    
                    <Text style={styles.creditsText}>
                      Credits awarded: {result.credits_awarded}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={40} color="#f76868ff" />
              <Text style={styles.errorText}>
                {questionData?.message || "Unable to load question."}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 25,
    marginBottom: 60,
  },
  backButton: {
    position: "absolute",
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f35a5aff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
    fontFamily: "ComicRelief-Regular",
  },
  mainContainer: {
    flex: 1,
  },
  questionWrapper: {
    flex: 1,
  },
  questionContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    maxHeight: 500,
    borderRadius: 20,
    padding: 25,
  },
  scrollContent: {
    flexGrow: 1,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f76868ff",
    marginBottom: 10,
    fontFamily: "ComicRelief-Regular",
  },
  questionText: {
    fontSize: 18,
    lineHeight: 28,
    color: "#333",
    textAlign: "left",
    marginBottom: 25,
    fontFamily: "ComicRelief-Regular",
  },
  optionsContainer: {
    marginTop: 10,
  },
  celebrationGif: {
    width: 170,
    height: 170,
    marginVertical: 10,
  },
  optionButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  optionButtonDisabled: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    opacity: 0.7,
  },
  correctOption: {
    backgroundColor: "#d4edda",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#28a745",
  },
  correctOptionText: {
    fontSize: 16,
    color: "#155724",
    fontFamily: "ComicRelief-Regular",
    fontWeight: "600",
  },
  incorrectOption: {
    backgroundColor: "#f8d7da",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#dc3545",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "ComicRelief-Regular",
  },
  resultContainer: {
    padding: 15,
    borderRadius: 10,
    alignSelf: "center",
    width: "90%",
  },
  resultTextContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "ComicRelief-Regular",
  },
  resultExplanation: {
    fontSize: 18,
    color: "#39a247ff",
    textAlign: "center",
    fontWeight: 600,
    fontFamily: "ComicRelief-Regular",
  },
  creditsText: {
    fontSize: 14,
    color: "#383838ff",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    padding: 40,
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#fd7b7bff",
    fontWeight: "500",
    marginTop: 15,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#f33d3dff",
    marginTop: 15,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
  },
  noteContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  noteContainerAnswered: {
    backgroundColor: "#d4edda",
    borderWidth: 2,
    borderColor: "#28a745",
  },
  noteContainerNormal: {
    backgroundColor: "#fcc2c2ff",
  },
  noteText: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    color: "#155724",
  },
});