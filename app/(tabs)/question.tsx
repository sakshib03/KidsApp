import { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./config";
import * as Font from "expo-font";

export default function Question() {
  const [questionData, setQuestionData] = useState(null);
  const [childId, setChildId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      "ComicRelief-Bold": require("../../assets/fonts/ComicRelief-Bold.ttf"),
      "ComicRelief-Regular": require("../../assets/fonts/ComicRelief-Regular.ttf"),
    }).then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    fetchChildId();
  }, []);

  const fetchChildId = async () => {
    try {
      const childData = await AsyncStorage.getItem("childDate");
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
      console.log("Full API response:", data); // Debug log
      setQuestionData(data);
    } catch (error) {
      console.error("Error fetching question:", error);
      Alert.alert("Error", "Failed to load question. Please try again.");
      setQuestionData(null);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer) => {
    if (!childId || !questionData) return;

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
      console.log("Answer submission result:", resultData); // Debug log

      setResult(resultData);
      setShowResult(true);
    } catch (error) {
      console.error("Error submitting answer:", error);
      Alert.alert("Error", "Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getOptionStyle = (optionKey) => {
    if (!selectedAnswer) return styles.optionButton;

    const isCorrect = result?.is_correct;
    const correctAnswer = questionData?.question?.correct_answer;

    if (optionKey === correctAnswer) {
      return styles.correctOption;
    } else if (optionKey === selectedAnswer && optionKey !== correctAnswer) {
      return styles.incorrectOption;
    }
    return styles.optionButton;
  };

  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/chatbot")}
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
              <ScrollView
                style={styles.questionContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <Text style={styles.questionTitle}>Question:</Text>
                <Text style={styles.questionText}>
                  {questionData.question.question ||
                    "No question text available"}
                </Text>

                <View style={styles.optionsContainer}>
                  {Object.entries(questionData.question.options || {}).map(
                    ([key, value]) => (
                      <TouchableOpacity
                        key={key}
                        style={getOptionStyle(key)}
                        onPress={() =>
                          !submitting && !selectedAnswer && submitAnswer(key)
                        }
                        disabled={submitting || selectedAnswer}
                      >
                        <Text
                          style={styles.optionText}
                        >{`${key}: ${value}`}</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </ScrollView>

              {showResult && result && (
                <View style={styles.resultContainer}>
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultTitle}>
                      {result.is_correct ? "" : "Try Again! 💪"}
                    </Text>
                    {result.is_correct && (
                      <>
                        <Image
                          source={require("../../assets/gifs/congratulations.gif")}
                          style={styles.celebrationGif}
                          resizeMode="contain"
                        />
                        <Text style={styles.resultExplanation}>
                          Correct answer.
                        </Text>
                      </>
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
              <Text style={styles.errorText}>Unable to load question.</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => childId && fetchQuestion(childId)}
              >
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
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
    marginTop: 20,
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
    borderRadius: 10,
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
    maxHeight: 430,
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
  correctOption: {
    backgroundColor: "#d4edda",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#28a745",
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
    alignSelf: 'center',
    width: '90%',
  },
  resultTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: "ComicRelief-Regular",
  },
  resultExplanation: {
    fontSize: 18,
    color:"#39a247ff",
    textAlign: 'center',
    fontWeight:600,
    fontFamily: "ComicRelief-Regular",
  },
  creditsText: {
    fontSize: 14,
    color: "#383838ff",
    textAlign: 'center',
    fontFamily: "ComicRelief-Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#3e3e3eff",
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
    color: "#f76868ff",
    marginTop: 15,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
  },
  retryButton: {
    backgroundColor: "#f35a5aff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "ComicRelief-Regular",
  },
});

