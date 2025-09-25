import { useEffect, useState } from "react";
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
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Speech from 'expo-speech';

export default function ChatBot() {
  const [micOn, setMicOn] = useState(false);
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize speech recognition
    initializeSpeechRecognition();
    
    return () => {
      // Cleanup
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const initializeSpeechRecognition = async () => {
    try {
      // For web compatibility, we'll use a simple approach
      if (Platform.OS === 'web') {
        console.log('Web platform - using browser Speech Recognition');
        return;
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
    }
  };

  const requestMicrophonePermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message: "App needs access to your microphone to use voice input.",
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
    return true; // iOS permissions are handled by Expo
  };

  const startSpeechToText = async () => {
    try {
      // Request microphone permission first
      const hasPermission = await requestMicrophonePermission();
      
      if (!hasPermission) {
        Alert.alert(
          "Permission Denied", 
          "Microphone permission is required to use voice input."
        );
        return;
      }

      if (Platform.OS === 'web') {
        // Web implementation
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';

          recognition.onstart = () => {
            console.log("Speech recognition started");
            setIsListening(true);
            setMicOn(true);
          };

          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("Speech result:", transcript);
            setText(prevText => prevText + ' ' + transcript);
          };

          recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            Alert.alert("Speech Error", event.error);
          };

          recognition.onend = () => {
            console.log("Speech recognition ended");
            setIsListening(false);
            setMicOn(false);
          };

          recognition.start();
          setRecognition(recognition);
        } else {
          Alert.alert("Not Supported", "Speech recognition is not supported in this browser");
        }
      } else {
        Alert.alert("Info", "For mobile devices, consider using a dedicated speech-to-text service or library");
        
        // Simulate speech recognition for demo purposes
        setIsListening(true);
        setMicOn(true);
        
        // This is where you would integrate with a proper speech recognition service
        // For now, we'll simulate it with a timeout
        setTimeout(() => {
          const demoText = "This is a demo speech to text result";
          setText(demoText);
          setIsListening(false);
          setMicOn(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Speech Error:", error);
      Alert.alert(
        "Speech Error", 
        error.message || "Something went wrong with voice input."
      );
      setIsListening(false);
      setMicOn(false);
    }
  };

  const stopSpeechToText = () => {
    if (Platform.OS === 'web' && recognition) {
      recognition.stop();
    }
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

  const handleSend = () => {
    if (text.trim()) {
      console.log("Sending message:", text);
      // Add your send logic here
      setText(""); // Clear input after sending
    }
  };

  // Text-to-Speech function (for the volume button)
  const speakText = () => {
    if (text.trim()) {
      Speech.speak(text, {
        language: 'en',
        pitch: 1.0,
        rate: 0.8,
      });
    } else {
      Alert.alert("No Text", "Please enter some text to speak");
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/background2.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.welcomeText}>
          Welcome to the ChatBot! Let's have some fun.
        </Text>

        <View style={styles.inputContainer}>
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.inputText}
              placeholder="Type your question here..."
              placeholderTextColor="#000"
              value={text}
              onChangeText={setText}
              multiline
            />
            <TouchableOpacity onPress={handleSend}>
              <Feather name="send" size={20} color="#56bbf1ff" />
            </TouchableOpacity>
          </View>

          <View style={styles.voiceControls}>
            <TouchableOpacity style={styles.voiceButton} onPress={speakText}>
              <Feather name="volume-2" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.voiceButton,
                micOn && styles.listeningButton
              ]}
              onPress={toggleMic}
            >
              <Feather 
                name={micOn ? "mic" : "mic-off"} 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {isListening && (
          <View style={styles.listeningIndicator}>
            <Text style={styles.listeningText}>Listening... Speak now</Text>
          </View>
        )}
      </View>

      {/* Buttons Container */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Go to Quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Question of the Day</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Joke of the Day</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push("/(tabs)/story")}
        >
          <Text style={styles.buttonText}>Generate Story</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Reminders</Text>
        </TouchableOpacity>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcomeText: {
    fontFamily: "ComicRelief-Regular",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    width: "100%",
    justifyContent: "center",
  },
  textInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffffff",
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    maxWidth: 280,
  },
  inputText: {
    fontSize: 16,
    fontFamily: "ComicRelief-Regular",
    fontWeight: "500",
    color: "#000",
    flex: 1,
    padding: 0,
    margin: 0,
  },
  voiceControls: {
    flexDirection: "row",
    gap: 8,
  },
  voiceButton: {
    backgroundColor: "#56bbf1ff",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  listeningButton: {
    backgroundColor: "#ff6b6b",
  },
  listeningIndicator: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "rgba(86, 187, 241, 0.2)",
    borderRadius: 5,
  },
  listeningText: {
    color: "#56bbf1ff",
    fontFamily: "ComicRelief-Regular",
    fontSize: 14,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  button: {
    margin: 8,
    backgroundColor: "#56bbf1ff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: "20%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
});