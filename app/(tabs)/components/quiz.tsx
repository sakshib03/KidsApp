import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../utils/ThemeContext";
import { API_BASE } from "../utils/config";

export default function Quiz() {
  const [quizData, setQuizData] = useState(null);
  const [childId, setChildId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [topic, setTopic] = useState("");
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentTopic, setCurrentTopic] = useState(""); 
  const {theme}=useTheme();

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
      const childData = await AsyncStorage.getItem("childDate");
      if (childData) {
        const parsedData = JSON.parse(childData);
        setChildId(parsedData.child_id);
      }
    } catch (error) {
      console.error("Error fetching child ID:", error);
    }
  };

  const fetchQuiz = async (id, userTopic = "") => {
    try {
      setLoading(true);
      setSelectedAnswer(null);
      setShowResult(false);
      setResult(null);
      setDailyLimitReached(false);

      // Check if daily limit reached (5 questions)
      if (questionCount >= 5) {
        setDailyLimitReached(true);
        setQuizData(null);
        setLoading(false);
        Alert.alert(
          "Daily Limit Reached",
          "You've completed 5 questions today. Try again tomorrow!"
        );
        return;
      }

      const response = await fetch(`${API_BASE}/generate-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child_id: id,
          topic: userTopic,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json();
          setDailyLimitReached(true);
          throw new Error(
            errorData.detail || "Daily quiz limit reached! Try again tomorrow."
          );
        }
        throw new Error("Failed to fetch quiz");
      }

      const data = await response.json();
      console.log("Full API response:", data);

      if (data.quiz && data.quiz.question === "Unable to generate quiz question at this time.") {
      throw new Error("Unable to generate quiz question for this topic. Please try a different topic.");
    }


      setQuizData(data.quiz);

      // Increment question count
      setQuestionCount((prev) => {
        const newCount = prev + 1;
        if (newCount > 5) {
          setDailyLimitReached(true);
        }
        return newCount;
      });
    } catch (error) {
      console.error("Error fetching quiz:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to load quiz. Please try again."
      );
      setQuizData(null);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer) => {
    if (!childId || !quizData) return;

    try {
      setSubmitting(true);
      setSelectedAnswer(answer);

      const response = await fetch(`${API_BASE}/submit-quiz-answer`, {
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
    } catch (error) {
      console.error("Error submitting answer:", error);
      Alert.alert("Error", "Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSend = () => {
    if (topic.trim() && childId) {
      // Reset question count when starting a new topic
      setQuestionCount(0);
      setDailyLimitReached(false);
      setCurrentTopic(topic.trim()); // Store the topic
      fetchQuiz(childId, topic.trim());
      setTopic(""); // Clear input but keep currentTopic
    } else if (!topic.trim()) {
      Alert.alert("Please enter a topic");
    }
  };

  const handleNextQuestion = () => {
    if (childId && !dailyLimitReached && currentTopic) {
      // Check if we've reached the daily limit
      if (questionCount >= 5) {
        setDailyLimitReached(true);
        setQuizData(null);
        Alert.alert(
          "Daily Limit Reached",
          "You've completed 5 questions today. Try again tomorrow!"
        );
        return;
      }

      // Keep the same topic for next question
      setQuizData(null);
      setShowResult(false);
      setSelectedAnswer(null);
      setResult(null);
      fetchQuiz(childId, currentTopic); // Use currentTopic instead of topic
    }
  };

  const getOptionStyle = (optionKey) => {
    if (!selectedAnswer) return styles.optionButton;

    const isCorrect = result?.is_correct;
    const correctAnswer = quizData?.correct_answer;

    if (optionKey === correctAnswer) {
      return styles.correctOption;
    } else if (optionKey === selectedAnswer && optionKey !== correctAnswer) {
      return styles.incorrectOption;
    }
    return styles.optionButton;
  };

  return (
    <ImageBackground
      // source={require("@/assets/images/login_image.png")}
      style={styles.background}
      source={theme.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", gap: 50 }}>
            <View>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push("/(tabs)/components/chatbot")}
              >
                <Feather name="arrow-left" size={24} color={"#fff"} />
                <Text style={styles.backButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>

            <View>
              {currentTopic && questionCount > 0 && !dailyLimitReached && (
                <View
                  style={{
                    marginTop: 10,
                    maxWidth:132
                  }}
                >
                  <Text style={styles.topicText}>Topic: {currentTopic}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <View style={styles.textInputWrapper}>
                <TextInput
                  style={styles.inputText}
                  placeholder="Enter a Topic"
                  placeholderTextColor="#595959ff"
                  value={topic}
                  onChangeText={setTopic}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                />
                <TouchableOpacity onPress={handleSend}>
                  <Feather name="send" size={24} color="#52b9f1ff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.mainContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f35a5aff" />
                <Text style={styles.loadingText}>
                  Generating your question...
                </Text>
              </View>
            ) : quizData && quizData.question ? (
              <View style={styles.questionWrapper}>
                <View style={styles.questionContainer}>
                  <View style={{ flexDirection: "row", gap: 70 }}>
                    <View>
                      <Text style={styles.questionTitle}>Question:</Text>
                    </View>
                    <View>
                      {currentTopic &&
                        questionCount > 0 &&
                        !dailyLimitReached && (
                          <View
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              gap: 60,
                              marginTop: 5,
                            }}
                          >
                            <Text style={styles.counterText}>
                              Question {questionCount} of 5
                            </Text>
                          </View>
                        )}
                    </View>
                  </View>

                  <ScrollView
                    style={styles.questionScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.questionText}>
                      {quizData.question || "No question text available"}
                    </Text>
                  </ScrollView>

                  <View style={styles.optionsContainer}>
                    {Object.entries(quizData.options || {}).map(
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

                  {showResult && (
                    <TouchableOpacity
                      style={[
                        styles.nextButton,
                        (dailyLimitReached || questionCount >= 5) &&
                          styles.disabledButton,
                      ]}
                      onPress={handleNextQuestion}
                      disabled={
                        loading || dailyLimitReached || questionCount >= 5
                      }
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : dailyLimitReached || questionCount >= 5 ? (
                        <Text style={styles.nextButtonText}>
                          Daily Limit Reached
                        </Text>
                      ) : (
                        <Text style={styles.nextButtonText}>Next Question</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {showResult && result && (
                  <View style={styles.resultContainer}>
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultTitle}>
                        {result.is_correct ? "" : "Try Again! 💪"}
                      </Text>
                      {result.is_correct && (
                        <>
                          <Image
                            source={require("../../../assets/gifs/congratulations.gif")}
                            style={styles.celebrationGif}
                            resizeMode="contain"
                          />
                          <Text style={styles.resultExplanation}>
                            Correct answer!
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
              <View style={styles.initialStateContainer}>
                {dailyLimitReached ? (
                  <>
                    <Feather
                      name="alert-triangle"
                      size={60}
                      color="#f35a5aff"
                    />
                    <Text style={styles.limitErrorText}>
                      Daily quiz limit reached!
                    </Text>
                    <Text style={styles.limitErrorSubtext}>
                      You've completed 5 questions today. Try again tomorrow!
                    </Text>
                  </>
                ) : (
                  <>
                    <Feather name="help-circle" size={60} color="#52b9f1ff" />
                    <Text style={styles.initialStateText}>
                      Enter a topic above to generate your quiz!
                    </Text>
                    <Text style={styles.initialStateSubtext}>
                      Examples: Animals, Space, Math, History
                    </Text>
                    <Text style={styles.limitInfoText}>
                      Daily limit: 5 questions
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>
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
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "flex-start",
    marginTop: 20,
    marginBottom: 10,
    flexDirection: "column",
    gap: 10,
    paddingHorizontal: 10,
  },
  backButton: {
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
  inputSection: {
    width: "100%",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "100%",
    maxWidth: 400,
  },
  textInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 2,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    borderWidth: 2,
    borderColor: "#56bbf1",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputText: {
    fontSize: 16,
    fontFamily: "ComicRelief-Regular",
    color: "#000",
    flex: 1,
    padding: 0,
    margin: 0,
    textAlignVertical: "top",
    minHeight: 35,
  },
  counterText: {
    fontSize: 14,
    color: "#f35a5aff",
    fontFamily: "ComicRelief-Regular",
    fontWeight: "bold",
  },
  topicText: {
    fontSize: 14,
    color: "#f35a5aff",
    fontFamily: "ComicRelief-Regular",
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  mainContainer: {
    flex: 1,
    minHeight: 500,
  },
  questionWrapper: {
    flex: 1,
  },
  questionContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    padding: 25,
  },
  questionScroll: {
    maxHeight: 130,
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f76868ff",
    marginBottom: 10,
    fontFamily: "ComicRelief-Regular",
  },
  questionText: {
    fontSize: 16,
    lineHeight: 28,
    color: "#333",
    textAlign: "left",
    fontFamily: "ComicRelief-Regular",
  },
  optionsContainer: {
    marginTop: 2,
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
  nextButton: {
    backgroundColor: "#f35a5aff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "ComicRelief-Regular",
  },
  resultExplanation: {
    fontSize: 20,
    color: "#39a247ff",
    textAlign: "center",
    fontWeight: "600",
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
  },
  loadingText: {
    fontSize: 16,
    color: "#3e3e3eff",
    fontWeight: "500",
    marginTop: 15,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
  },
  initialStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 40,
  },
  initialStateText: {
    fontSize: 18,
    color: "#52b9f1ff",
    marginTop: 20,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    fontWeight: "bold",
  },
  initialStateSubtext: {
    fontSize: 14,
    color: "#52b9f1ff",
    marginTop: 10,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    fontStyle: "italic",
  },
  limitInfoText: {
    fontSize: 12,
    color: "#f35a5aff",
    marginTop: 15,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
  },
  limitErrorText: {
    fontSize: 18,
    color: "#f35a5aff",
    marginTop: 20,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    fontWeight: "bold",
  },
  limitErrorSubtext: {
    fontSize: 16,
    color: "#f76868ff",
    marginTop: 10,
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
