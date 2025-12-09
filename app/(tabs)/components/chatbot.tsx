import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as Font from "expo-font";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../utils/ThemeContext";
import { API_BASE } from "../utils/config";

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
  const [audioLoadingId, setAudioLoadingId] = useState(null);
  const { theme } = useTheme();

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
    try {
      if (Platform.OS === "android") {
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
      } else if (Platform.OS === "ios") {
        const { status } = await Audio.requestPermissionsAsync();
        return status === "granted";
      }
      return true;
    } catch (err) {
      console.warn("Permission error:", err);
      return false;
    }
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

      console.log("Starting speech-to-text recording...");

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow microphone access for speech-to-text."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      console.log("Creating recording instance for speech-to-text...");

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setMicOn(true); // This indicates we're in speech-to-text mode

      console.log("Speech-to-text recording started successfully");
    } catch (error) {
      console.error("Failed to start speech-to-text recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
      setIsRecording(false);
      setMicOn(false);
    }
  };

  const toggleMic = async () => {
    if (isRecording && micOn) {
      await stopRecordingAndProcessTo();
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

      if (response.status === 403) {
        const errorData = await response.json();
        if (errorData.detail && errorData.detail.includes("blocked")) {
          Alert.alert(
            "Account Blocked",
            errorData.detail ||
              "Your account has been blocked. Please contact your parent.",
            [
              {
                text: "OK",
                onPress: async () => {
                  await AsyncStorage.multiRemove([
                    "accessToken",
                    "loginTime",
                    "userType",
                    "childId",
                    "parentId",
                    "userData",
                    "parentData",
                  ]);
                  router.dismissAll();
                  router.replace("/(tabs)/auth/login");
                },
              },
            ]
          );
          return null;
        }
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

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
      setAudioLoadingId(messageItem.id);
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
    } finally {
      setAudioLoadingId(null);
    }
  };

  const speakText = async (messageItem) => {
    if (!messageItem.text.trim() || audioLoadingId) return;

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

  const handleSpeechToText = async () => {
    try {
      console.log("Starting speech-to-speech...");

      if (isRecording && recording) {
        console.log("Stopping recording...");
        await stopRecordingAndProcessTo();
        return;
      }

      console.log("Starting new recording...");

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow microphone access for speech-to-text."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      console.log("Creating recording instance...");

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);

      console.log("Recording started successfully");
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecordingAndProcessTo = async () => {
    try {
      console.log("Stopping speech-to-text recording and processing...");
      if (!recording) {
        console.log("No recording instance found");
        return;
      }

      setIsRecording(false);
      setIsSpeechToSpeechLoading(true);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        console.error("No audio file created");
        Alert.alert("Error", "No audio recorded. Please try again.");
        setIsSpeechToSpeechLoading(false);
        return;
      }

      console.log("Audio recorded at:", uri);

      const base64Audio = await audioToBase64To(uri);

      if (!base64Audio) {
        console.error("Failed to convert audio to base64");
        Alert.alert("Error", "Failed to process audio. Please try again.");
        setIsSpeechToSpeechLoading(false);
        return;
      }

      console.log("Audio converted to base64, length:", base64Audio.length);

      // Send to speech-to-text API
      await sendSpeechToText(base64Audio);
    } catch (error) {
      console.error("Error processing recording:", error);
      Alert.alert("Error", "Failed to process recording");
    } finally {
      setRecording(null);
      setMicOn(false); // Reset micOn state
      setIsSpeechToSpeechLoading(false);
    }
  };

  const audioToBase64To = async (uri) => {
    try {
      console.log("Converting audio to base64...");

      // Fetch the audio file
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }

      const blob = await response.blob();
      console.log("Audio blob size:", blob.size, "type:", blob.type);

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            // Get base64 string (remove data URL prefix)
            const base64 = reader.result.split(",")[1];
            console.log("Base64 conversion successful");
            resolve(base64);
          } catch (error) {
            console.error("Error parsing base64:", error);
            reject(error);
          }
        };
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting audio to base64:", error);
      return null;
    }
  };

  const sendSpeechToText = async (audioBase64) => {
    if (!userData?.child_id) {
      Alert.alert("Error", "User data not loaded");
      return;
    }

    try {
      console.log("Sending audio to speech-to-text API...");
      console.log("Child ID:", userData.child_id);
      console.log("Audio base64 length:", audioBase64.length);

      const response = await fetch(`${API_BASE}/speech-to-text`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child_id: userData.child_id,
          audio_base64: audioBase64,
        }),
      });

      console.log("Speech-to-text API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Speech-to-text Response:", data);

      // Set the transcribed text in the input field
      if (data.transcribed_text) {
        setText(data.transcribed_text);
      }
    } catch (error) {
      console.error("Speech-to-text API Error:", error);
      Alert.alert(
        "Error",
        "Failed to process speech-to-text request. Please try again."
      );
    }
  };

  const handleSpeechToSpeech = async () => {
    try {
      console.log("Starting speech-to-speech...");

      if (isRecording && recording) {
        console.log("Stopping recording...");
        await stopRecordingAndProcess();
        return;
      }

      console.log("Starting new recording...");

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
        staysActiveInBackground: false,
      });

      console.log("Creating recording instance...");

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);

      console.log("Recording started successfully");
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecordingAndProcess = async () => {
    try {
      console.log("Stopping recording and processing...");
      if (!recording) {
        console.log("No recording instance found");
        return;
      }
      setIsRecording(false);
      setIsSpeechToSpeechLoading(true);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        console.error("No audio file created");
        Alert.alert("Error", "No audio recorded. Please try again.");
        setIsSpeechToSpeechLoading(false);
        return;
      }

      console.log("Audio recorded at:", uri);

      const base64Audio = await audioToBase64(uri);

      if (!base64Audio) {
        console.error("Failed to convert audio to base64");
        Alert.alert("Error", "Failed to process audio. Please try again.");
        setIsSpeechToSpeechLoading(false);
        return;
      }
      console.log("Audio converted to base64, length:", base64Audio.length);
      // Send to speech-to-speech API
      await sendSpeechToSpeech(base64Audio);
    } catch (error) {
      console.error("Error processing recording:", error);
      Alert.alert("Error", "Failed to process recording");
    } finally {
      setRecording(null);
      setIsSpeechToSpeechLoading(false);
      setMicOn(false);
    }
  };

  const audioToBase64 = async (uri) => {
    try {
      console.log("Converting audio to base64...");

      // Fetch the audio file
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }

      const blob = await response.blob();
      console.log("Audio blob size:", blob.size, "type:", blob.type);

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            // Get base64 string (remove data URL prefix)
            const base64 = reader.result.split(",")[1];
            console.log("Base64 conversion successful");
            resolve(base64);
          } catch (error) {
            console.error("Error parsing base64:", error);
            reject(error);
          }
        };
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
          reject(error);
        };
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
      console.log("Sending audio to speech-to-speech API...");
      console.log("Child ID:", userData.child_id);
      console.log("Audio base64 length:", audioBase64.length);

      const response = await fetch(`${API_BASE}/speech-to-speech`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child_id: userData.child_id,
          audio_base64: audioBase64,
        }),
      });

      console.log("API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Speech-to-speech Response:", data);

      // Create user message with transcribed text
      const userMessage = {
        id: Date.now().toString(),
        text: data.transcribed_text || "[Voice message]",
        isUser: true,
        timestamp: new Date(),
      };

      // Create bot response message
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I couldn't process that. Please try again.",
        isUser: false,
        timestamp: new Date(),
        audio_base64: data.audio_base64, // Store audio base64 for playback
      };

      // Add both messages to chat
      setMessages((prev) => [...prev, userMessage, botMessage]);

      // Play the returned audio if available
      if (data.audio_base64) {
        await playBase64Audio(data.audio_base64);
      }
    } catch (error) {
      console.error("Speech-to-speech API Error:", error);
      Alert.alert(
        "Error",
        "Failed to process speech-to-speech request. Please try again."
      );
    }
  };

  const playBase64Audio = async (base64Audio) => {
    try {
      console.log("Playing base64 audio...");

      // Stop any currently playing sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      // Create data URL from base64
      const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

      // Load and play the audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioDataUrl },
        { shouldPlay: true }
      );

      setSound(newSound);

      // Handle playback completion
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          newSound.unloadAsync();
          setSound(null);
        }
      });

      console.log("Audio playback started");
    } catch (error) {
      console.error("Error playing base64 audio:", error);
      // Fallback to text-to-speech
      Speech.speak("Here's my response", {
        language: "en",
        pitch: 1.0,
        rate: 0.9,
      });
    }
  };

  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
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
            router.dismissAll();
            router.replace("/(tabs)/auth/login");
          } catch (error) {
            console.error("Error during logout:", error);
          }
        },
      },
    ]);
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
            disabled={audioLoadingId === item.id}
          >
            {audioLoadingId === item.id ? (
              <ActivityIndicator size="small" color="#56bbf1" />
            ) : (
              <Ionicons name="volume-medium-outline" size={16} color="#666" />
            )}
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
    <ImageBackground
      // source={require("@/assets/images/login_image.png")}
      style={styles.background}
      source={theme.background}
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
              onPress={() => router.push("/(tabs)/components/profile")}
            >
              <Feather name="user" size={20} color="#239a5e" />
            </TouchableOpacity>
          </View>

          <Text style={styles.headerTitle}>Learning Buddy</Text>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push("/(tabs)/components/reminders")}
            >
              <Ionicons name="notifications-outline" size={22} color="#239a5e" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
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
                      isRecording && micOn && styles.listeningButton,
                    ]}
                    onPress={toggleMic}
                    disabled={isSpeechToSpeechLoading}
                  >
                    {isRecording && micOn ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Feather
                        name={micOn ? "mic" : "mic-off"}
                        size={18}
                        color="#fff"
                      />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.voiceButton,
                      isRecording && !micOn && styles.listeningButton,
                    ]}
                    onPress={handleSpeechToSpeech}
                    disabled={isSpeechToSpeechLoading || (isRecording && micOn)}
                  >
                    {isRecording && !micOn ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Feather
                        name={isRecording && !micOn ? "square" : "activity"}
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
              onPress={() => router.push("/(tabs)/components/story")}
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
                    gap: 40,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.quickActionButton,
                      { backgroundColor: "#c53737ff" },
                    ]}
                    onPress={() => router.push("/(tabs)/components/quiz")}
                  >
                    <Text style={styles.quickActionText}>Go to Quiz</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.quickActionButton,
                      { backgroundColor: "#37c537ff" },
                    ]}
                    onPress={() => router.push("/(tabs)/components/story")}
                  >
                    <Text style={styles.quickActionText}>Story of the Day</Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    marginBottom: 20,
                    flexDirection: "row",
                    gap: 40,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.quickActionButton,
                      { backgroundColor: "#4cabe6ff" },
                    ]}
                    onPress={() => router.push("/(tabs)/components/question")}
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
                      router.push("/(tabs)/components/games/gamesDashboard")
                    }
                  >
                    <Text style={styles.quickActionText}>Games</Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    marginBottom: 20,
                    flexDirection: "row",
                    gap: 40,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.quickActionButton,
                      { backgroundColor: "#db58afff" },
                    ]}
                    onPress={() => router.push("/(tabs)/components/joke")}
                  >
                    <Text style={styles.quickActionText}>Joke of the Day</Text>
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
                  .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA)) // Sort dates descending (newest first)
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
                            expandedDates[date] ? "chevron-up" : "chevron-down"
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
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
    width: 34,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "ComicRelief-Bold",
    color: "#F25F3B",
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
    marginBottom: 8,
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 8,
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
    fontSize: 14,
    fontFamily: "ComicRelief-Bold",
    color: "#ffffff",
    textAlign: "center",
  },
  chatHistory: {
    position: "absolute",
    top: 35,
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
    color: "#333",
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
    color: "#5e5e5eff",
    fontSize: 11,
    fontFamily: "ComicRelief-Regular",
  },
});
