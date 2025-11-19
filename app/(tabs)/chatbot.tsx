import { useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  TextInput,
  Alert,
  Platform,
  PermissionsAndroid,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import * as Font from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { API_BASE } from "./config";

export default function ChatBot() {
  const [micOn, setMicOn] = useState(false);
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  const textInputRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [sound, setSound] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechToSpeechLoading, setIsSpeechToSpeechLoading] = useState(false);

  // Sample initial messages for demo
  const initialMessages = [
    {
      id: "1",
      text: "Hi there! I'm your friendly learning buddy. What would you like to know today?",
      isUser: false,
      timestamp: new Date(),
    },
  ];

  useEffect(() => {
    loadFonts();
    loadUserData();
    setMessages(initialMessages);

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const fetchChatHistory = async () => {
    if (!userData.child_id) return;
    try {
      const response = await fetch(
        `${API_BASE}/chat-history/${userData.parent_id}/${userData.child_id}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("history data:", data);

      // Store the original date-wise structure
      setChatHistory(data.chat_history || {});
    } catch (error) {
      console.error("Error fetching chat history:", error);
      Alert.alert("Error", "Failed to load chat history");
    }
  };

  // State to track expanded dates
  const [expandedDates, setExpandedDates] = useState({});

  const toggleDateExpansion = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  // Function to format date for display
  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        "ComicRelief-Bold": require("../../assets/fonts/ComicRelief-Bold.ttf"),
        "ComicRelief-Regular": require("../../assets/fonts/ComicRelief-Regular.ttf"),
      });
      setFontsLoaded(true);
    } catch (error) {
      console.error("Error loading fonts:", error);
    }
  };

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        setUserData(JSON.parse(userDataString));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const requestMicrophonePermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message: "This app needs microphone access for voice input.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startSpeechToText = async () => {
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "Please enable microphone access in settings to use voice input."
        );
        return;
      }

      Alert.alert("Voice Input", "Speak now...", [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            setIsListening(false);
            setMicOn(false);
          },
        },
        {
          text: "Use Demo Text",
          onPress: () => {
            const demoQuestions = [
              "What do animals eat?",
              "How do birds fly?",
              "Tell me about ocean animals",
              "What colors can animals see?",
              "Why do cats purr?",
            ];
            const randomQuestion =
              demoQuestions[Math.floor(Math.random() * demoQuestions.length)];
            setText(randomQuestion);
            setIsListening(false);
            setMicOn(false);
          },
        },
      ]);

      setIsListening(true);
      setMicOn(true);
    } catch (error) {
      console.error("Speech Error:", error);
      Alert.alert("Error", "Unable to access microphone");
      setIsListening(false);
      setMicOn(false);
    }
  };

  const stopSpeechToText = () => {
    setIsListening(false);
    setMicOn(false);
  };

  const toggleMic = async () => {
    if (micOn) {
      stopSpeechToText();
    } else {
      await startSpeechToText();
    }
  };

  const sendMessageToAPI = async (message) => {
    if (!userData?.child_id) {
      console.warn("User data not loaded yet!");
      Alert.alert("Error", "User data not loaded yet!");
      return null;
    }
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child_id: userData.child_id,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.warning) {
        Alert.alert("Warning", data.warning);
      }

      return {
        text: data.response || "I'm here to help! What would you like to know?",
        message_id: data.message_id, // Store the message_id for audio generation
        flagged: data.flagged,
        credits_awarded: data.credits_awarded,
        total_credits: data.total_credits,
      };
    } catch (error) {
      console.error("API Error:", error);
      return {
        text: "Oops! I'm having trouble connecting right now. Please try again later! 🤔",
        message_id: null,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const generateAndPlayAudio = async (messageItem) => {
    if (!messageItem.text.trim()) return;

    try {
      if (messageItem.message_id && userData?.child_id) {
        const audioUrl = `${API_BASE}/generate-chat-audio?child_id=${userData.child_id}&message_id=${messageItem.message_id}`;

        console.log("Generating audio for message:", messageItem.message_id);

        // Fetch the audio
        const response = await fetch(audioUrl, {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Audio generation failed: ${response.status}`);
        }

        // Get the audio blob
        const audioBlob = await response.blob();

        // Create object URL from blob
        const audioObjectUrl = URL.createObjectURL(audioBlob);

        // Stop any currently playing sound
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
          setSound(null);
        }

        // Play the audio using Expo AV
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioObjectUrl },
          { shouldPlay: true }
        );

        setSound(newSound);

        // Handle playback completion
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            newSound.unloadAsync();
            setSound(null);
            // Clean up the object URL
            URL.revokeObjectURL(audioObjectUrl);
          }
        });
      } else {
        // Fallback: if no message_id, use text-to-speech
        console.warn("No message_id available, using text-to-speech fallback");
        Speech.speak(messageItem.text, {
          language: "en",
          pitch: 1.0,
          rate: 0.9,
        });
      }
    } catch (error) {
      console.error("Audio Generation/Playback Error:", error);

      // Fallback to text-to-speech if audio generation fails
      console.log("Falling back to text-to-speech");
      Speech.speak(messageItem.text, {
        language: "en",
        pitch: 1.0,
        rate: 0.9,
      });

      Alert.alert("Info", "Playing text-to-speech version");
    }
  };

  const speakText = async (messageItem) => {
    if (!messageItem.text.trim()) return;

    // Use the new audio generation function
    await generateAndPlayAudio(messageItem);
  };

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;

    const userMessage = text.trim();
    setText("");

    // Add user message to chat
    const newUserMessage = {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);

    // Get bot response with message_id from API
    const botResponse = await sendMessageToAPI(userMessage);

    if (botResponse) {
      const newBotMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        isUser: false,
        timestamp: new Date(),
        message_id: botResponse.message_id, // Store message_id for audio generation
      };

      setMessages((prev) => [...prev, newBotMessage]);
    }
  };

  const handleSpeechToSpeech = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow microphone access for speech-to-speech."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);

      Alert.alert("Recording", "Speak now...", [
        {
          text: "Stop Recording",
          onPress: async () => {
            await stopRecordingAndProcess();
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecordingAndProcess = async () => {
    try {
      if (!recording) return;
      setIsRecording(false);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        Alert.alert("Error", "No audio recorded");
        return;
      }

      // Show loading state
      setIsSpeechToSpeechLoading(true);

      const base64Audio = await audioToBase64(uri);

      if (!base64Audio) {
        Alert.alert("Error", "Failed to process audio");
        return;
      }

      // Send to speech-to-speech API
      await sendSpeechToSpeech(base64Audio);
    } catch (error) {
      console.error("Error processing recording:", error);
      Alert.alert("Error", "Failed to process recording");
    } finally {
      setRecording(null);
      setIsSpeechToSpeechLoading(false);
    }
  };

  const audioToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting audio to base64:", error);
      return null;
    }
  };

  const sendSpeechToSpeech = async (audioBase64) => {
    if (!userData?.child_id) {
      Alert.alert("Error", "User data not loaded");
      return;
    }
    try {
      setIsSpeechToSpeechLoading(true);
      const response = await fetch(`${API_BASE}/speech-to-speech`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child_id: userData.child_id,
          audio_base64: audioBase64,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Speech-to-speech Response:", data);

      const userMessage = {
        id: Date.now().toString(),
        text: data.transcribed_text || "[Voice message]",
        isUser: true,
        timestamp: new Date(),
      };

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
        message_id: data.message_id, // Store message_id for audio generation
      };

      setMessages((prev) => [...prev, userMessage, botMessage]);

      // Auto-play the audio response for speech-to-speech
      if (data.message_id) {
        await generateAndPlayAudio(botMessage);
      }
    } catch (error) {
      console.error("Speech-to-speech API Error:", error);
      Alert.alert("Error", "Failed to process speech-to-speech request");
    } finally {
      setIsSpeechToSpeechLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "accessToken",
        "loginTime",
        "userType",
        "childId",
        "parentId",
        "userData",
        "parentData",
      ]);
      router.replace("/(tabs)/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.isUser ? styles.userMessageText : styles.botMessageText,
        ]}
      >
        {item.text}
      </Text>
      <View style={styles.messageFooter}>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        {!item.isUser && (
          <TouchableOpacity
            style={styles.speakButton}
            onPress={() => speakText(item)}
          >
            <Ionicons name="volume-medium-outline" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View
      style={[styles.messageBubble, styles.botMessage, styles.typingBubble]}
    >
      <View style={styles.typingDots}>
        <View style={[styles.typingDot, styles.typingDot1]} />
        <View style={[styles.typingDot, styles.typingDot2]} />
        <View style={[styles.typingDot, styles.typingDot3]} />
      </View>
      <Text style={styles.typingText}>Thinking...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#56bbf1" barStyle="dark-content" />
      <ImageBackground
        source={require("@/assets/images/login_image.png")}
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  setShowHistory(!showHistory);
                  if (!showHistory) fetchChatHistory();
                }}
              >
                <Feather name="menu" size={22} color="#239a5e" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/(tabs)/profile")}
              >
                <Feather name="user" size={20} color="#239a5e" />
              </TouchableOpacity>
            </View>

            <Text style={styles.headerTitle}>Learning Buddy</Text>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/(tabs)/reminders")}
              >
                <Feather name="bell" size={20} color="#239a5e" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleLogout}
              >
                <Feather name="log-out" size={20} color="#239a5e" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Chat Area */}
          <View style={styles.chatContainer}>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />

            {isLoading && renderTypingIndicator()}
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                placeholder="Ask me about animals, science, or anything!..."
                placeholderTextColor="#999"
                value={text}
                onChangeText={setText}
                multiline
                maxLength={500}
                textAlignVertical="center"
              />

              <View style={styles.inputButtons}>
                {text.trim() ? (
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      (!text.trim() || isLoading || !userData?.child_id) &&
                        styles.sendButtonDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={!text.trim() || isLoading || !userData?.child_id}
                  >
                    <Feather name="send" size={18} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.voiceButton,
                        micOn && styles.listeningButton,
                      ]}
                      onPress={toggleMic}
                    >
                      <Feather
                        name={micOn ? "mic" : "mic-off"}
                        size={18}
                        color="#fff"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.voiceButton,
                        (isRecording || isSpeechToSpeechLoading) &&
                          styles.listeningButton,
                      ]}
                      onPress={handleSpeechToSpeech}
                      disabled={isRecording || isSpeechToSpeechLoading}
                    >
                      {isSpeechToSpeechLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Feather
                          name={isRecording ? "mic" : "activity"}
                          size={20}
                          color="#fff"
                        />
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Quick Action Buttons */}
          {/* <ScrollView
            style={styles.quickActions}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContent}
          >
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push("/(tabs)/quiz")}
            >
              <Text style={styles.quickActionText}>Go to Quiz</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push("/(tabs)/story")}
            >
              <Text style={styles.quickActionText}>Story of the Day</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>Games</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push("/(tabs)/question")}
            >
              <Text style={styles.quickActionText}>Question of the Day</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push("/(tabs)/joke")}
            >
              <Text style={styles.quickActionText}>Joke of the Day</Text>
            </TouchableOpacity>
          </ScrollView> */}

          {showHistory && (
            <View style={styles.chatHistory}>
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 20,
                  right: 10,
                  padding: 4,
                  zIndex: 1,
                }}
                onPress={() => setShowHistory(false)}
              >
                <Feather name="x" size={24} color="#f93232ff" />
              </TouchableOpacity>
              <View
                style={{
                  top: 40,
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: 10,
                }}
              >
                <View
                  style={{
                    marginBottom: 20,
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      marginBottom: 20,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.quickActionButton,
                        { backgroundColor: "#c53737ff" },
                      ]}
                      onPress={() => router.push("/(tabs)/quiz")}
                    >
                      <Text style={styles.quickActionText}>Go to Quiz</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.quickActionButton,
                        { backgroundColor: "#37c537ff" },
                      ]}
                      onPress={() => router.push("/(tabs)/story")}
                    >
                      <Text style={styles.quickActionText}>
                        Story of the Day
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View
                    style={{
                      marginBottom: 20,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.quickActionButton,
                        { backgroundColor: "#4cabe6ff" },
                      ]}
                      onPress={() => router.push("/(tabs)/question")}
                    >
                      <Text style={styles.quickActionText}>
                        Question of the Day
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.quickActionButton,
                        { backgroundColor: "#ded755ff" },
                      ]}
                      onPress={() =>
                        router.push(
                          "/(tabs)/components/games/gamesDashboard"
                        )
                      }
                    >
                      <Text style={styles.quickActionText}>Games</Text>
                    </TouchableOpacity>
                  </View>

                  <View
                    style={{
                      marginBottom: 20,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.quickActionButton,
                        { backgroundColor: "#db58afff" },
                      ]}
                      onPress={() => router.push("/(tabs)/joke")}
                    >
                      <Text style={styles.quickActionText}>
                        Joke of the Day
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text
                  style={{
                    fontSize: 18,
                    color: "#ea524aff",
                    fontWeight: "bold",
                  }}
                >
                  Chat History
                </Text>
              </View>
              <ScrollView style={{ marginTop: 60 }}>
                {Object.keys(chatHistory).length === 0 ? (
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#999",
                      marginTop: 20,
                    }}
                  >
                    No chat history available
                  </Text>
                ) : (
                  Object.entries(chatHistory)
                    .sort(
                      ([dateA], [dateB]) => new Date(dateB) - new Date(dateA)
                    ) // Sort dates descending (newest first)
                    .map(([date, messages]) => (
                      <View key={date} style={styles.dateSection}>
                        <TouchableOpacity
                          style={styles.dateHeader}
                          onPress={() => toggleDateExpansion(date)}
                        >
                          <Text style={styles.dateHeaderText}>
                            {formatDateDisplay(date)}
                          </Text>
                          <Feather
                            name={
                              expandedDates[date]
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={20}
                            color="#56bbf1"
                          />
                        </TouchableOpacity>

                        {expandedDates[date] && (
                          <View style={styles.messagesContainer}>
                            {messages.map((chat) => (
                              <View key={chat.id} style={styles.chatItem}>
                                <Text style={styles.userMessageText}>
                                  You: {chat.message}
                                </Text>
                                <Text style={styles.botMessageText}>
                                  Buddy: {chat.response}
                                </Text>
                                <Text style={styles.timestampText}>
                                  {new Date(chat.timestamp).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))
                )}
              </ScrollView>
            </View>
          )}
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#56bbf1",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  headerLeft: {
    flexDirection: "row",
  },
  headerRight: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 6,
    borderRadius: 20,
    width: 36,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "ComicRelief-Bold",
    color: "#239a5e",
    textAlign: "center",
  },
  chatContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginVertical: 8,
  },
  messagesList: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#56bbf1",
    borderBottomRightRadius: 4,
    marginBottom: 6,
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 6,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  messageText: {
    fontSize: 16,
    fontFamily: "ComicRelief-Regular",
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  timestamp: {
    fontSize: 11,
    color: "#666",
    fontFamily: "ComicRelief-Regular",
  },
  speakButton: {
    padding: 4,
    marginLeft: 8,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#666",
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  typingText: {
    fontSize: 14,
    fontFamily: "ComicRelief-Regular",
    color: "#666",
    marginLeft: 8,
    fontStyle: "italic",
  },
  inputSection: {
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#56bbf1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "ComicRelief-Regular",
    color: "#000",
    maxHeight: 80,
    paddingVertical: 2,
  },
  inputButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  voiceButton: {
    backgroundColor: "#56bbf1",
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  listeningButton: {
    backgroundColor: "#ff6b6b",
  },
  sendButton: {
    backgroundColor: "#56bbf1",
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  quickActions: {
    maxHeight: 40,
    marginBottom: Platform.OS === "ios" ? 30 : 25,
  },
  quickActionsContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: "rgba(86, 187, 241, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: "ComicRelief-Regular",
    color: "#ffffff",
    textAlign: "center",
  },
  chatHistory: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 60,
    bottom: 0,
    backgroundColor: "#ffffffff",
    zIndex: 9999,
    justifyContent: "flex-start",
    elevation: 10,
    padding: 20,
  },

  dateSection: {
    marginBottom: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#56bbf1",
    fontFamily: "ComicRelief-Bold",
  },
  messagesContainer: {
    padding: 8,
  },
  chatItem: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#56bbf1",
  },
  userMessageText: {
    color: "#333333ff",
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "ComicRelief-Regular",
  },
  botMessageText: {
    color: "#333",
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "ComicRelief-Regular",
  },
  timestampText: {
    color: "#999",
    fontSize: 11,
    fontFamily: "ComicRelief-Regular",
  },
});
