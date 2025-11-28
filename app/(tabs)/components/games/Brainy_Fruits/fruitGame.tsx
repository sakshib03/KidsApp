import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as Font from "expo-font";
import { router } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function FruitGame() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [childId, setChildId] = useState("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [failedData, setFailedData] = useState(null);
  const [completionSound, setCompletionSound] = useState(null);
  const [failureSound, setFailureSound] = useState(null);
  const [showRewardMessage, setShowRewardMessage] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    loadFonts();
    initializeGame();
    loadSound();
  }, []);

  useEffect(() => {
    if (gameData?.time_left !== undefined) {
      setTimeLeft(gameData.time_left);
      setTimerActive(true);
    }
  }, [gameData?.time_left]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive, timeLeft]);

  useEffect(() => {
    if (gameData && gameData.question_number) {
      setTimerActive(true);
    }
  }, [gameData?.question_number]);

  useEffect(() => {
    if (showCompletionModal || showFailedModal) {
      setTimerActive(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [showCompletionModal, showFailedModal]);

  useEffect(() => {
    return () => {
      if (completionSound) {
        completionSound.unloadAsync();
      }
      if (failureSound) {
        failureSound.unloadAsync();
      }
    };
  }, [completionSound, failureSound]);

  const loadSound = async () => {
    try {
      console.log("🔊 Loading sounds...");
      const { sound: completion } = await Audio.Sound.createAsync(
        require("@/assets/audio/winner-game.mp3")
      );
      setCompletionSound(completion);

      const { sound: failure } = await Audio.Sound.createAsync(
        require("@/assets/audio/game-over.mp3")
      );
      setFailureSound(failure);
    } catch (error) {
      console.error("Error loading sounds:", error);
    }
  };

  const playCompletionSound = async () => {
    try {
      if (completionSound) {
        await completionSound.replayAsync();
      }
    } catch (error) {
      console.error("Error playing completion sound:", error);
    }
  };

  const playFailureSound = async () => {
    try {
      if (failureSound) {
        await failureSound.replayAsync();
      }
    } catch (error) {
      console.error("Error playing failure sound:", error);
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

  // In FruitGame component - update loadExistingGameData
  const loadExistingGameData = async () => {
    try {
      const storedSessionId = await AsyncStorage.getItem("gameSessionId");
      const storedGameData = await AsyncStorage.getItem("currentGameData");

      if (!storedSessionId || !storedGameData) {
        console.log("No session or game data available");
        Alert.alert("No Active Game", "Please select a level to start playing");
        router.push("/(tabs)/components/games/Brainy_Fruits/gameLevel");
        return;
      }

      console.log("Loading existing game session:", storedSessionId);
      const gameData = JSON.parse(storedGameData);

      setSessionId(storedSessionId);
      setGameData(gameData);
      console.log("🎮 Game data loaded from storage:", gameData);
    } catch (error) {
      console.error("Error loading existing game data:", error);
      Alert.alert("Error", "Failed to load game data");
      router.push("/(tabs)/components/games/Brainy_Fruits/gameLevel");
    }
  };

  // Update initializeGame
  const initializeGame = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");

      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const currentChildId = userData.child_id;
        setChildId(currentChildId);

        await loadExistingGameData();
      } else {
        Alert.alert("Error", "User data not found");
        router.push("/(tabs)/components/games/Brainy_Fruits/gameLevel");
      }
    } catch (error) {
      console.error("Error initializing game:", error);
      Alert.alert("Error", "Failed to initialize game");
    }
  };

  const submitAnswer = async () => {
    console.log("Current answer:", answer);
    if (!answer.trim()) {
      Alert.alert("Error", "Please enter an answer");
      return;
    }

    if (!sessionId || !childId) {
      Alert.alert("Error", "Game session not initialized");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const userAnswer = parseInt(answer);
      if (isNaN(userAnswer)) {
        Alert.alert("Error", "Please enter a valid number");
        setLoading(false);
        return;
      }

      console.log("Submitting answer:", userAnswer);

      // CAPTURE DATA BEFORE SUBMISSION
      const currentLevel = gameData?.level;
      const currentQuestion = gameData?.question_number;
      const totalQuestions = gameData?.total_questions_in_level;

      const response = await fetch(
        `http://127.0.0.1:8000/game/submit_answer/${childId}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            user_answer: userAnswer,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Submit answer SUCCESS:", result);

        setTimeLeft(result.time_left);
        setTimerActive(true);

        setGameData(result);
        setAnswer("");
        setShowRewardMessage(true);

        setTimeout(() => {
          setShowRewardMessage(false);
        }, 5000);

        const isTimeout = checkTimeout(result);
        const isGameOver = checkGameOver(result);
        const isLevelCompleted = checkLevelCompletion(result, gameData);

        console.log("FINAL DECISION:", {
          isTimeout,
          isGameOver,
          isLevelCompleted,
          currentLevel: gameData?.level,
          newLevel: result.level,
          currentQuestion: gameData?.question_number,
          newQuestion: result.question_number,
        });

        if (isGameOver) {
          console.log("❌ GAME OVER - Showing failed modal");
          setFailedData({
            level: currentLevel,
            points: result.points,
            rewardMessage: result.reward_message,
            lives: result.lives,
          });
          setShowFailedModal(true);
          playFailureSound();
        } else if (isLevelCompleted) {
          console.log("🎉 LEVEL COMPLETED! Showing completion modal");
          setCompletionData({
            level: currentLevel,
            points: result.points,
            rewardMessage: result.reward_message,
            totalQuestions: totalQuestions,
          });
          setShowCompletionModal(true);
          playCompletionSound();
        } else if (isTimeout) {
          console.log("TIMEOUT - Continue to next question");
        } else {
          console.log("Continue with next question in same level");
        }
      } else if (response.status === 404) {
        await AsyncStorage.removeItem("gameSessionId");
        Alert.alert("Session Expired", "Your game session has expired.");
        router.push("/(tabs)/components/games/Brainy_Fruits/gameLevel");
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Failed to submit answer");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      Alert.alert("Error", "Failed to submit answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkTimeout = (result) => {
    const message = result.reward_message.toLowerCase();
    const hasTimeoutKeywords =
      message.includes("time out") ||
      message.includes("timeout") ||
      message.includes("time's up");

    console.log("TIMEOUT CHECK:", {
      hasTimeoutKeywords,
      message: result.reward_message,
    });

    return hasTimeoutKeywords;
  };

  // Check if game is over (lives lost, time out, etc.)
  const checkGameOver = (result) => {
    const message = result.reward_message.toLowerCase() || "";

    const noLivesLeft = result.lives !== undefined && result.lives <= 0;

    console.log("💀 GAME OVER CHECK:", {
      noLivesLeft,
      lives: result.lives,
      message: result.reward_message,
    });

    return noLivesLeft;
  };

  const checkLevelCompletion = (newResult, oldGameData) => {
    if (!oldGameData || !newResult) return false;

    console.log("🔍 LEVEL COMPLETION CHECK - DETAILED:", {
      oldLevel: oldGameData.level,
      newLevel: newResult.level,
      oldQuestion: oldGameData.question_number,
      newQuestion: newResult.question_number,
      totalQuestions: oldGameData.total_questions_in_level,
      wasLastQuestion:
        oldGameData.question_number >= oldGameData.total_questions_in_level,
      levelIncreased: newResult.level > oldGameData.level,
      isNewLevelStarting:
        newResult.question_number === 1 && newResult.level > oldGameData.level,
      rewardMessage: newResult.reward_message,
    });

    const completedAllQuestions =
      oldGameData.question_number >= oldGameData.total_questions_in_level &&
      newResult.question_number === 1;

    const levelIncreased = newResult.level > oldGameData.level;

    const isNewLevelStarting =
      newResult.question_number === 1 && newResult.level > oldGameData.level;

    const message = newResult.reward_message?.toLowerCase() || "";
    const hasCompletionKeywords =
      message.includes("completed") ||
      message.includes("congrat") ||
      message.includes("level completed");

    const isCompleted =
      completedAllQuestions ||
      levelIncreased ||
      isNewLevelStarting ||
      hasCompletionKeywords;

    console.log("🎯 LEVEL COMPLETION RESULT:", {
      completedAllQuestions,
      levelIncreased,
      isNewLevelStarting,
      hasCompletionKeywords,
      finalResult: isCompleted,
    });

    return isCompleted;
  };

  const handleNextLevel = async () => {
    if (!childId) {
      Alert.alert("Error", "Child ID not found.");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      console.log("🚀 Starting next level for child:", childId);

      const response = await fetch(
        `http://127.0.0.1:8000/game/next_level/${childId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const newGameData = await response.json();
        console.log("✅ Next level started:", newGameData);

        // Clear the stored game data first
        await AsyncStorage.removeItem("currentGameData");

        // Store the new session and game data
        await AsyncStorage.setItem("gameSessionId", newGameData.session_id);
        await AsyncStorage.setItem(
          "currentGameData",
          JSON.stringify(newGameData)
        );

        // Update ALL state variables
        setGameData(newGameData);
        setSessionId(newGameData.session_id);
        setShowCompletionModal(false);
        setCompletionData(null);
        setAnswer("");

        // Force a re-initialization to ensure clean state
        setTimeout(() => {
          initializeGame();
        }, 100);

        console.log("🎮 Continuing with next level - State updated");
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error starting next level:", error);
      Alert.alert("Error", "Failed to start next level. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle replay level (for both completion and failure modals)
  const handleReplayLevel = async () => {
    if (!childId) {
      Alert.alert("Error", "Child ID not found.");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/game/replay_level/${childId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const newGameData = await response.json();
        console.log("✅ Replay successful:", newGameData);
        await AsyncStorage.setItem("gameSessionId", newGameData.session_id);
        setSessionId(newGameData.session_id);
        setGameData(newGameData);
        setAnswer("");
        setShowCompletionModal(false);
        setShowFailedModal(false);
        setCompletionData(null);
        setFailedData(null);
        console.log("🔄 Level replayed successfully");
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error replaying level:", error);
      Alert.alert("Error", "Failed to replay level. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLevels = () => {
    setShowCompletionModal(false);
    setShowFailedModal(false);
    setCompletionData(null);
    setFailedData(null);
    router.push("/(tabs)/components/games/Brainy_Fruits/gameLevel");
  };

  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={require("@/assets/images/games/bg1.png")}
      style={styles.background}
      blurRadius={2}
    >
      {/* Main Game Container */}
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() =>
              router.push("/(tabs)/components/games/Brainy_Fruits/welcomePage")
            }
            disabled={loading}
          >
            <Image
              source={require("@/assets/images/games/back-arrow.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>

          <View>
            <Text style={styles.levelText}>
              LEVEL {gameData?.level || "Loading..."}
            </Text>
          </View>

          {/* Timer Circle */}
          <View style={styles.circle}>
            <Text
              style={[
                styles.circleText,
                timeLeft <= 10 && { color: "#ff0000" },
              ]}
            >
              {timeLeft || "0"}
            </Text>
          </View>
        </View>

        {/* <View style={{ marginTop: 25 }}>
          <Text
            style={{ fontFamily: "ComicRelief-Regular", color: "#f82828ff" }}
          >
            Each question has 60 Sec time.
          </Text>
        </View> */}

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Lives: {gameData?.lives ?? "?"}❤️ | Points: {gameData?.points ?? 0}{" "}
            ⭐ | Q: {gameData?.question_number ?? 1}/
            {gameData?.total_questions_in_level ?? 1}
          </Text>
        </View>

        {/* Game title */}
        <Text style={styles.title}>🍇 Fruit Puzzle Game 🍎</Text>

        {/* Puzzle area */}
        <View style={styles.puzzleBox}>
          <Text style={styles.puzzleText}>
            Solve {gameData?.puzzle_expression || "Loading puzzle..."}
          </Text>
          <Text style={styles.puzzleSubText}>
            {gameData?.fruit_values
              ? Object.entries(gameData.fruit_values)
                  .map(([emoji, value]) => `${emoji} = ${value}`)
                  .join("\n")
              : "Loading values..."}
          </Text>
        </View>

        {/* Input field */}
        <TextInput
          style={styles.input}
          placeholder="Enter your Answer"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={answer}
          onChangeText={setAnswer}
          editable={!loading && !showCompletionModal && !showFailedModal}
        />

        <TouchableOpacity
          style={[
            styles.submitBtn,
            (loading || showCompletionModal || showFailedModal) &&
              styles.disabledButton,
          ]}
          onPress={submitAnswer}
          disabled={loading || showCompletionModal || showFailedModal}
        >
          <Text style={styles.submitText}>
            {loading ? "SUBMITTING..." : "SUBMIT"}
          </Text>
        </TouchableOpacity>

        {showRewardMessage && (
          <View style={{ marginTop: 15 }}>
            <Text style={styles.rewardMessage}>{gameData?.reward_message}</Text>
          </View>
        )}

        <Image
          source={require("@/assets/images/games/settings.png")}
          style={styles.bottomIcon}
        />

        <Image
          source={require("@/assets/images/games/apple.png")}
          style={styles.character}
        />
      </View>

      {/* Level Completion Modal */}
      <Modal
        visible={showCompletionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.completionCard}>
              {/* Completed Banner */}
              <Image
                source={require("@/assets/images/games/completed.png")}
                style={styles.completedBanner}
              />

              {/* Level Title */}
              <Text style={styles.levelTitle}>
                LEVEL {completionData?.level}
              </Text>

              {/* Questions Completed */}
              <Text style={styles.questionsCompleted}>
                You completed all {completionData?.totalQuestions || "5"}{" "}
                questions!
              </Text>

              {/* Congratulations Message */}
              <Text style={styles.congratsText}>
                {completionData?.rewardMessage ||
                  "Congratulations! Level Completed!"}
              </Text>

              {/* Score Display */}
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Total Score</Text>
                <Text style={styles.scoreValue}>
                  {completionData?.points ?? gameData?.points ?? 0} points
                </Text>
              </View>

              {/* Buttons Section */}
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.replayButton]}
                  onPress={handleReplayLevel}
                  disabled={loading}
                >
                  <Text style={styles.modalButtonText}>PLAY AGAIN</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.nextButton]}
                  onPress={handleNextLevel}
                  disabled={loading}
                >
                  <Text style={styles.modalButtonText}>
                    {loading ? "LOADING..." : "NEXT LEVEL"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.backToLevelsButton}
                onPress={handleBackToLevels}
              >
                <Text style={styles.backToLevelsText}>Back to Levels</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Level Failed Modal */}
      <Modal
        visible={showFailedModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFailedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.failedCard}>
              {/* Failed Banner */}
              <Image
                source={require("@/assets/images/games/failed.png")}
                style={styles.failedBanner}
              />
              <Text style={styles.failedSubtitle}>
                LEVEL {failedData?.level}
              </Text>

              {/* Failure Message */}
              <Text style={styles.failedMessage}>
                {failedData?.rewardMessage || "Don't worry! Try again!"}
              </Text>

              {/* Score Display */}
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Your Score</Text>
                <Text style={styles.scoreValue}>
                  {failedData?.points ?? gameData?.points ?? 0} points
                </Text>
              </View>

              {/* Buttons Section */}
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.replayButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={handleReplayLevel}
                  disabled={loading}
                >
                  <Text style={styles.modalButtonText}>
                    {loading ? "LOADING..." : "REPLAY LEVEL"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.backToLevelsButton}
                onPress={handleBackToLevels}
              >
                <Text style={styles.backToLevelsText}>Back to Levels</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  failedCard: {
    borderWidth: 16,
    borderColor: "#8B0000",
    backgroundColor: "#fdeaabff",
    width: 320,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  failedBanner: {
    width: 340,
    height: 100,
    resizeMode: "contain",
    marginTop: -90,
    marginBottom: 10,
  },
  failedSubtitle: {
    fontSize: 28,
    fontFamily: "ComicRelief-Bold",
    color: "#6C0303",
    textAlign: "center",
    marginBottom: 20,
  },
  failedMessage: {
    fontSize: 16,
    fontFamily: "ComicRelief-Regular",
    color: "#8B0000",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
    fontStyle: "italic",
  },

  // ... (rest of the styles remain the same)
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  mainContainer: {
    alignItems: "center",
    backgroundColor: "#F1FF8A",
    width: "90%",
    height: "85%",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent:"space-between",
    alignItems: "center",
    width: "100%",
    gap: 45,
  },
  backBtn: {
    padding: 8,
  },
  backIcon: {
    width: 38,
    height: 38,
  },
  levelText: {
    fontSize: 20,
    fontFamily: "ComicRelief-Bold",
    color: "#0E4912",
  },
  circle: {
    backgroundColor: "#f4f5f1ff",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  circleText: {
    fontFamily: "ComicRelief-Bold",
    fontSize: 18,
    color: "#0E4912",
  },
  title: {
    fontFamily: "ComicRelief-Bold",
    fontSize: 22,
    color: "#0E4912",
    marginTop: 30,
  },
  puzzleBox: {
    backgroundColor: "#F1FF8A",
    borderRadius: 12,
    width: "90%",
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginTop: 20,
  },
  puzzleText: {
    fontFamily: "ComicRelief-Bold",
    fontSize: 18,
    textAlign: "center",
    color: "#0E4912",
  },
  puzzleSubText: {
    fontFamily: "ComicRelief-Regular",
    fontSize: 16,
    textAlign: "center",
    color: "#0E4912",
    marginTop: 8,
    lineHeight: 24,
  },
  progressContainer: {
    width: "85%",
    marginTop: 15,
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    fontFamily: "ComicRelief-Regular",
    color: "#0E4912",
    marginBottom: 5,
  },
  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "85%",
    height: 45,
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    fontFamily: "ComicRelief-Regular",
  },
  submitBtn: {
    backgroundColor: "#00B050",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 40,
    marginTop: 20,
  },
  submitText: {
    color: "#fff",
    fontFamily: "ComicRelief-Bold",
    fontSize: 18,
  },
  statsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 10,
  },
  statsText: {
    fontFamily: "ComicRelief-Regular",
    fontSize: 14,
    color: "#0E4912",
    textAlign: "center",
  },
  rewardMessage: {
    color: "#036c69ff",
    fontSize: 18,
    fontFamily: "ComicRelief-Regular",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modalContainer: {
    width: "90%",
    alignItems: "center",
  },
  completionCard: {
    borderWidth: 16,
    borderColor: "#764F1C",
    backgroundColor: "#fdeaabff",
    width: 320,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  completedBanner: {
    width: 320,
    height: 100,
    resizeMode: "contain",
    marginTop: -80,
    marginBottom: 10,
  },
  levelTitle: {
    fontSize: 28,
    fontFamily: "ComicRelief-Bold",
    color: "#6C0303",
    textAlign: "center",
    marginBottom: 20,
  },
  questionsCompleted: {
    fontSize: 16,
    fontFamily: "ComicRelief-Bold",
    color: "#036c69ff",
    textAlign: "center",
    marginBottom: 10,
  },
  congratsText: {
    fontSize: 16,
    fontFamily: "ComicRelief-Regular",
    color: "#036c69ff",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  starsContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  star: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginHorizontal: 8,
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginVertical: 15,
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#764F1C",
  },
  scoreLabel: {
    fontSize: 18,
    fontFamily: "ComicRelief-Bold",
    color: "#761010",
  },
  scoreValue: {
    fontSize: 18,
    fontFamily: "ComicRelief-Bold",
    color: "#6C0303",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
    marginBottom: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  replayButton: {
    backgroundColor: "#0a4875",
  },
  nextButton: {
    backgroundColor: "#0A761E",
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: "ComicRelief-Bold",
    color: "#fff",
    textAlign: "center",
  },
  backToLevelsButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  backToLevelsText: {
    fontSize: 14,
    fontFamily: "ComicRelief-Regular",
    color: "#036c69ff",
    textDecorationLine: "underline",
  },
  bottomIcon: {
    width: 60,
    height: 60,
    position: "absolute",
    bottom: -30,
    left: -10,
  },
  character: {
    width: 120,
    height: 120,
    position: "absolute",
    bottom: -50,
    right: -15,
    resizeMode: "contain",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
  },
});
