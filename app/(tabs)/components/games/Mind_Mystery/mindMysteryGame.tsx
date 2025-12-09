import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import * as Font from "expo-font";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { API_BASE } from "../../../utils/config";

export default function mindMysteryGame() {
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
  const [soundsLoaded, setSoundsLoaded] = useState(false); // NEW: Track if sounds are loaded
  const [showRewardMessage, setShowRewardMessage] = useState(false);
  const [levelAlreadyCompleted, setLevelAlreadyCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    loadFonts();
    initializeGame();
    loadSound();
    
    // Cleanup sounds on unmount
    return () => {
      if (completionSound) {
        completionSound.unloadAsync();
      }
      if (failureSound) {
        failureSound.unloadAsync();
      }
    };
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

  // FIXED: Improved sound loading with better error handling
  const loadSound = async () => {
    try {
      console.log("🔊 Loading sounds...");
      
      // Load completion sound
      const { sound: completion, status: completionStatus } = await Audio.Sound.createAsync(
        require("@/assets/audio/winner-game.mp3"),
        { shouldPlay: false },
        null,
        true // Load immediately
      );
      
      // Load failure sound  
      const { sound: failure, status: failureStatus } = await Audio.Sound.createAsync(
        require("@/assets/audio/game-over.mp3"),
        { shouldPlay: false },
        null,
        true // Load immediately
      );
      
      setCompletionSound(completion);
      setFailureSound(failure);
      setSoundsLoaded(true);
      
      console.log("✅ Sounds loaded successfully");
      console.log("Completion sound status:", completionStatus);
      console.log("Failure sound status:", failureStatus);
      
    } catch (error) {
      console.error("❌ Error loading sounds:", error);
      // Continue without sounds if loading fails
      setSoundsLoaded(false);
    }
  };

  // FIXED: Improved completion sound playback with pre-play check
  const playCompletionSound = async () => {
    try {
      console.log("🎵 Attempting to play completion sound...");
      
      if (!completionSound) {
        console.log("❌ Completion sound not loaded");
        return;
      }
      
      // Check if sound is loaded and ready
      const status = await completionSound.getStatusAsync();
      console.log("Completion sound status before play:", status);
      
      if (status.isLoaded) {
        // Stop and reset the sound before playing
        await completionSound.stopAsync();
        await completionSound.setPositionAsync(0);
        
        // Play the sound
        await completionSound.playAsync();
        console.log("✅ Completion sound played successfully");
      } else {
        console.log("❌ Completion sound is not loaded properly");
        // Try to reload the sound
        try {
          await completionSound.loadAsync(require("@/assets/audio/winner-game.mp3"));
          await completionSound.playAsync();
          console.log("🔄 Completion sound reloaded and played");
        } catch (reloadError) {
          console.error("❌ Failed to reload completion sound:", reloadError);
        }
      }
    } catch (error) {
      console.error("❌ Error playing completion sound:", error);
    }
  };

  // FIXED: Improved failure sound playback
  const playFailureSound = async () => {
    try {
      console.log("🎵 Attempting to play failure sound...");
      
      if (!failureSound) {
        console.log("❌ Failure sound not loaded");
        return;
      }
      
      const status = await failureSound.getStatusAsync();
      console.log("Failure sound status before play:", status);
      
      if (status.isLoaded) {
        await failureSound.stopAsync();
        await failureSound.setPositionAsync(0);
        await failureSound.playAsync();
        console.log("✅ Failure sound played successfully");
      } else {
        console.log("❌ Failure sound is not loaded properly");
        try {
          await failureSound.loadAsync(require("@/assets/audio/game-over.mp3"));
          await failureSound.playAsync();
          console.log("🔄 Failure sound reloaded and played");
        } catch (reloadError) {
          console.error("❌ Failed to reload failure sound:", reloadError);
        }
      }
    } catch (error) {
      console.error("❌ Error playing failure sound:", error);
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

  const loadExistingGameData = async () => {
    try {
      const storedSessionId = await AsyncStorage.getItem("gameSessionId");
      const storedGameData = await AsyncStorage.getItem("currentGameData");

      if (!storedSessionId || !storedGameData) {
        console.log("No session or game data available");
        Alert.alert("No Active Game", "Please select a level to start playing");
        router.push("/(tabs)/components/games/Mind_Mystery/gameLevel");
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
      router.push("/(tabs)/components/games/Mind_Mystery/gameLevel");
    }
  };

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
        router.push("/(tabs)/components/games/Mind_Mystery/gameLevel");
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
      const userAnswer = answer.trim().toLowerCase();

      const validOptions = ["a", "b", "c", "d"];
      if (!validOptions.includes(userAnswer)) {
        Alert.alert("Error", "Please enter a valid option (a,b,c,d)");
        setLoading(false);
        return;
      }

      console.log("Submitting answer:", userAnswer);

      // CAPTURE DATA BEFORE SUBMISSION
      const currentLevel = gameData?.level;
      const currentPoints = gameData?.points;
      const currentQuestion = gameData?.question_number;
      const totalQuestions = gameData?.total_questions_in_level;

      const response = await fetch(
        `${API_BASE}/mind-mystery/Submit?child_id=${childId}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            answer: userAnswer,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Submit answer SUCCESS:", result);

        setTimeLeft(result.time_left);
        setTimerActive(true);

        setGameData(result);
        // Store the updated game data
        await AsyncStorage.setItem("currentGameData", JSON.stringify(result));
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
          levelAlreadyCompleted,
          currentLevel,
          currentPoints,
          currentQuestion,
          totalQuestions,
          newLevel: result.level,
          newPoints: result.points,
          newLives: result.lives,
          wasLastQuestion: currentQuestion >= totalQuestions,
          rewardMessage: result.reward_message,
        });

        if (isGameOver) {
          console.log("❌ GAME OVER - Showing failed modal");
          setFailedData({
            level: currentLevel,
            points: currentPoints,
            rewardMessage: result.reward_message,
            lives: result.lives,
          });
          setShowFailedModal(true);
          setLevelAlreadyCompleted(false);
          // Play failure sound when modal opens
          playFailureSound();
        } else if (isLevelCompleted && !levelAlreadyCompleted) {
          console.log("🎉 LEVEL COMPLETED! Showing completion modal");
          setCompletionData({
            level: currentLevel,
            points: result.points,
            rewardMessage: result.reward_message,
            totalQuestions: totalQuestions,
          });
          setShowCompletionModal(true);
          setLevelAlreadyCompleted(true);
          // Play completion sound when modal opens
          playCompletionSound();
        } else if (isTimeout) {
          console.log("TIMEOUT - Continue to next question");
          setLevelAlreadyCompleted(false);
        } else {
          console.log("Continue with next question in same level");
          if (result.level === currentLevel) {
            setLevelAlreadyCompleted(false);
          }
        }
      } else if (response.status === 404) {
        await AsyncStorage.removeItem("gameSessionId");
        await AsyncStorage.removeItem("currentGameData");
        setLevelAlreadyCompleted(false);
        Alert.alert("Session Expired", "Your game session has expired.");
        router.push("/(tabs)/components/games/Mind_Mystery/gameLevel");
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
    const message = result.reward_message?.toLowerCase() || "";
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
    const message = result.reward_message?.toLowerCase() || "";

    const noLivesLeft = result.lives !== undefined && result.lives <= 0;

    const hasGameOverKeywords =
      message.includes("game over") ||
      message.includes("no more questions") ||
      message.includes("no more lives");

    const isGameOver = noLivesLeft || hasGameOverKeywords;

    console.log("💀 GAME OVER CHECK:", {
      noLivesLeft,
      hasGameOverKeywords,
      lives: result.lives,
      message: result.reward_message,
      shouldShowFailedModal: isGameOver,
    });

    return isGameOver;
  };

  // Check if level is completed
  const checkLevelCompletion = (newResult, oldGameData) => {
    if (!oldGameData || !newResult) return false;

    console.log("🔍 LEVEL COMPLETION CHECK:", {
      oldLevel: oldGameData.level,
      newLevel: newResult.level,
      oldQuestion: oldGameData.question_number,
      newQuestion: newResult.question_number,
      totalQuestions: oldGameData.total_questions_in_level,
      wasLastQuestion:
        oldGameData.question_number >= oldGameData.total_questions_in_level,
      rewardMessage: newResult.reward_message,
    });

    const wasLastQuestion =
      oldGameData.question_number >= oldGameData.total_questions_in_level;

    const message = newResult.reward_message?.toLowerCase() || "";
    const hasCompletionKeywords =
      message.includes("level completed") ||
      message.includes("completed successfully") ||
      message.includes("congratulations") ||
      message.includes("please start the next level") ||
      message.includes("you can start the next level");

    const isLevelCompleted =
      (wasLastQuestion && hasCompletionKeywords) || hasCompletionKeywords;

    console.log("🎯 LEVEL COMPLETION ANALYSIS:", {
      wasLastQuestion,
      hasCompletionKeywords,
      message: newResult.reward_message,
      isLevelCompleted,
    });

    return isLevelCompleted;
  };

  // Handle next level from completion modal
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
        `${API_BASE}/mind-mystery/NextLevel?child_id=${childId}`,
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
        setLevelAlreadyCompleted(false);
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
        `${API_BASE}/mind-mystery/Replay?child_id=${childId}`,
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
        await AsyncStorage.setItem(
          "currentGameData",
          JSON.stringify(newGameData)
        );
        setSessionId(newGameData.session_id);
        setGameData(newGameData);
        setAnswer("");
        setShowCompletionModal(false);
        setShowFailedModal(false);
        setCompletionData(null);
        setFailedData(null);
        setLevelAlreadyCompleted(false);
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
    router.push("/(tabs)/components/games/Mind_Mystery/gameLevel");
  };

  const handleBackToWelcome = () => {
    setShowCompletionModal(false);
    setShowFailedModal(false);
    setCompletionData(null);
    setFailedData(null);
    router.push("/(tabs)/components/games/Mind_Mystery/welcomePage");
  };

  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={require("@/assets/images/games/mindMystery/bg3.png")}
      style={styles.background}
    >
      {/* Main Game Container */}
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() =>
              router.push("/(tabs)/components/games/Mind_Mystery/welcomePage")
            }
            disabled={loading}
          >
            <Image
              source={require("@/assets/images/games/mindMystery/back-arrow.png")}
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

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Lives: {gameData?.lives ?? "?"}❤️ | Points: {gameData?.points ?? 0}{" "}
            ⭐ | Q: {gameData?.question_number ?? 1}/
            {gameData?.total_questions_in_level ?? 1}
          </Text>
        </View>

        {/* Puzzle area */}

        <View style={styles.puzzleBox}>
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContainer}
          >
            <Text style={styles.puzzleText}>
              Solve: {gameData?.question || "Loading question..."}
            </Text>

            {gameData?.image &&
            gameData.image.startsWith("http") &&
            !gameData.image.includes("📷") &&
            !gameData.image.includes("💡") ? (
              <View style={{ flexDirection: "row", marginTop: 20, gap: 5 }}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: gameData?.image }}
                    style={styles.animalImage}
                    resizeMode="contain"
                    onError={(error) =>
                      console.log(
                        "Image loading error:",
                        error.nativeEvent.error
                      )
                    }
                  />
                </View>

                <View style={styles.optionsContainer}>
                  <Text style={styles.puzzleSubText}>
                    {gameData?.options
                      ? Object.entries(gameData.options)
                          .map(([alphabet, value]) => `${alphabet} = ${value}`)
                          .join("\n")
                      : "Loading values..."}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.centeredOptionsContainer}>
                <Text style={styles.puzzleSubText}>
                  {gameData?.options
                    ? Object.entries(gameData.options)
                        .map(([alphabet, value]) => `${alphabet} = ${value}`)
                        .join("\n")
                    : "Loading values..."}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Input field */}
        <TextInput
          style={styles.input}
          placeholder="Enter your Answer"
          placeholderTextColor="#666"
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
          <View style={{ marginTop: 18 }}>
            <Text style={styles.rewardMessage}>{gameData?.reward_message}</Text>
            <Text style={[styles.rewardMessage, { color: "#f65252ff" }]}>
              {gameData?.fact}
            </Text>
          </View>
        )}

        <Image
          source={require("@/assets/images/games/mindMystery/snowman.png")}
          style={styles.character}
        />
      </View>

      {/* Level Completion Modal */}
      <Modal
        visible={showCompletionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCompletionModal(false)}
        onShow={() => {
          // FIXED: Play sound when modal is shown, not before
          playCompletionSound();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.completionCard}>
              {/* Completed Banner */}
              <Image
                source={require("@/assets/images/games/mindMystery/frame4.png")}
                style={styles.completedBanner}
              />

              <Text
                style={{
                  position: "absolute",
                  fontSize: 24,
                  top: -10,
                  fontFamily: "ComicRelief-Bold",
                  color: "#1c6d2cff",
                }}
              >
                YOU WON
              </Text>
              {/* Level Title */}
              <Text style={styles.levelTitle}>
                LEVEL {completionData?.level}
              </Text>

              {/* Questions Completed */}
              <Text style={styles.questionsCompleted}>
                You completed all {completionData?.totalQuestions} questions!
              </Text>

              {/* Congratulations Message */}
              <Text style={styles.congratsText}>
                {completionData?.rewardMessage ||
                  "Congratulations! Level Completed!"}
              </Text>

              {/* Score Display */}
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Total Score </Text>
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
        onShow={() => {
          // FIXED: Play sound when modal is shown
          playFailureSound();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.failedCard}>
              {/* Failed Banner */}
              <Image
                source={require("@/assets/images/games/mindMystery/frame4.png")}
                style={styles.failedBanner}
              />
              <Text
                style={{
                  position: "absolute",
                  fontSize: 24,
                  top: -10,
                  fontFamily: "ComicRelief-Bold",
                  color: "#c02b2bff",
                }}
              >
                YOU LOSE
              </Text>
              <Text style={styles.failedSubtitle}>
                LEVEL {failedData?.level}
              </Text>

              {/* Failure Message */}
              <Text style={styles.failedMessage}>
                {failedData?.rewardMessage || "Don't worry! Try again!"}
              </Text>

              {/* Score Display */}
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Your Score </Text>
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
    borderColor: "#013571ff",
    backgroundColor: "#e6fafeff",
    width: 300,
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
    width: 480,
    height: 150,
    resizeMode: "contain",
    marginTop: -120,
    marginBottom: 10,
  },
  failedSubtitle: {
    fontSize: 28,
    fontFamily: "ComicRelief-Bold",
    color: "#022751ff",
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

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  mainContainer: {
    alignItems: "center",
    backgroundColor: "#98EEFF",
    width: "90%",
    height: "90%",
    marginTop: 10,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 65,
  },
  backBtn: {
    padding: 6,
  },
  backIcon: {
    width: 45,
    height: 45,
  },
  levelText: {
    fontSize: 20,
    fontFamily: "ComicRelief-Bold",
    color: "#103655",
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
    color: "#103655",
  },
  title: {
    fontFamily: "ComicRelief-Bold",
    fontSize: 22,
    color: "#103655",
    marginTop: 30,
  },
  scrollContent: {
    flex: 1,
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 5,
  },
  puzzleBox: {
    backgroundColor: "#9ccfffff",
    borderRadius: 12,
    width: "100%",
    height: 280,
    paddingVertical: 15,
    paddingHorizontal: 12,
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
    textAlign: "left",
    color: "#0E4912",
    lineHeight: 26,
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
  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  optionsContainer: {
    flex: 1,
    padding: 10,
  },
  centeredOptionsContainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  animalImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  submitBtn: {
    backgroundColor: "#103655",
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
    color: "#103655",
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
  },
  modalContainer: {
    width: "90%",
    alignItems: "center",
  },
  completionCard: {
    borderWidth: 16,
    borderColor: "#013571ff",
    backgroundColor: "#e6fafeff",
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
    width: 540,
    height: 120,
    resizeMode: "contain",
    marginTop: -100,
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
    width: "90%",
    marginVertical: 15,
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#022751ff",
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
    backgroundColor: "#103655",
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
  character: {
    width: 90,
    height: 110,
    position: "absolute",
    bottom: 0,
    right: 0,
    resizeMode: "contain",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
  },
});
