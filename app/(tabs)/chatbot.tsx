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
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import * as Font from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ChatBot() {
  const [micOn, setMicOn] = useState(false);
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    Font.loadAsync({
      "ComicRelief-Bold": require("../../assets/fonts/ComicRelief-Bold.ttf"),
      "ComicRelief-Regular": require("../../assets/fonts/ComicRelief-Regular.ttf"),
    }).then(() => setFontsLoaded(true));
    loadUserData();
  }, []);

  const loadUserData=async()=>{
    try{
      const userDataSting = await AsyncStorage.getItem("userData");

      if(userDataSting){
        setUserData(JSON.parse(userDataSting));
      }
    }catch(error){
      console.error("Error loading user data:", error);
    }
  };

  useEffect(() => {
    initializeSpeechRecognition();

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const initializeSpeechRecognition = async () => {
    try {
      if (Platform.OS === "web") {
        console.log("Web platform - using browser Speech Recognition");
        return;
      }
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
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
    return true;
  };

  const startSpeechToText = async () => {
    try {
      const hasPermission = await requestMicrophonePermission();

      if (!hasPermission) {
        Alert.alert(
          "Permission Denied",
          "Microphone permission is required to use voice input."
        );
        return;
      }

      if (Platform.OS === "web") {
        if (
          "webkitSpeechRecognition" in window ||
          "SpeechRecognition" in window
        ) {
          const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();

          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = "en-US";

          recognition.onstart = () => {
            console.log("Speech recognition started");
            setIsListening(true);
            setMicOn(true);
          };

          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("Speech result:", transcript);
            setText((prevText) => prevText + " " + transcript);
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
          Alert.alert(
            "Not Supported",
            "Speech recognition is not supported in this browser"
          );
        }
      } else {
        Alert.alert(
          "Info",
          "For mobile devices, consider using a dedicated speech-to-text service or library"
        );

        setIsListening(true);
        setMicOn(true);

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
    if (Platform.OS === "web" && recognition) {
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
      setText("");
    }
  };

  const speakText = () => {
    if (text.trim()) {
      Speech.speak(text, {
        language: "en",
        pitch: 1.0,
        rate: 0.8,
      });
    } else {
      Alert.alert("No Text", "Please enter some text to speak");
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/login_image.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Main Content Area */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 4,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#454545ff",
                padding: 6,
                borderRadius: 50,
              }}
              onPress={()=>router.push("/(tabs)/profile")}
            >
              <Feather name="user" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
            style={{
                backgroundColor: "#454545ff",
                padding: 6,
                borderRadius: 50,
              }}
              onPress={()=>router.push("/(tabs)/reminders")}
              >
              <Feather name="bell" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity>
            <Feather name="log-out" size={26} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.mainContent}>
          <Text style={styles.welcomeText}>
            Welcome to the ChatBot! Let's have some fun.
          </Text>

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <View style={styles.textInputWrapper}>
                <TextInput
                  style={styles.inputText}
                  placeholder="Type your question here..."
                  placeholderTextColor="#666"
                  value={text}
                  onChangeText={setText}
                  multiline
                  numberOfLines={3}
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSend}
                >
                  <Feather name="send" size={22} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.voiceControls}>
                <TouchableOpacity
                  style={styles.voiceButton}
                  onPress={speakText}
                >
                  <Feather name="volume-2" size={22} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.voiceButton, micOn && styles.listeningButton]}
                  onPress={toggleMic}
                >
                  <Feather
                    name={micOn ? "mic" : "mic-off"}
                    size={22}
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
        </View>

        {/* Bottom Navigation Buttons */}
        <ScrollView
          style={styles.bottomContainer}
          contentContainerStyle={styles.bottomContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button}
            onPress={()=>router.push("/(tabs)/quizq")}
            >
              <Text style={styles.buttonText}>Go to Quiz</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/(tabs)/question")}
            >
              <Text style={styles.buttonText}>Question of the Day</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/(tabs)/joke")}
            >
              <Text style={styles.buttonText}>Joke of the Day</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/(tabs)/story")}
            >
              <Text style={styles.buttonText}>Generate Story</Text>
            </TouchableOpacity>

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
    padding: 4,
    marginTop:16
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  welcomeText: {
    fontFamily: "ComicRelief-Bold",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 30,
    color: "#e33b3bff",
    lineHeight: 28,
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
    padding: 10,
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
    minHeight: 60,
  },
  sendButton: {
    backgroundColor: "#56bbf1",
    padding: 8,
    borderRadius: 8,
    marginLeft: 4,
  },
  voiceControls: {
    flexDirection: "row",
    gap: 6,
  },
  voiceButton: {
    backgroundColor: "#56bbf1",
    padding: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  listeningButton: {
    backgroundColor: "#ff6b6b",
    transform: [{ scale: 1.1 }],
  },
  listeningIndicator: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "rgba(86, 187, 241, 0.15)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#56bbf1",
  },
  listeningText: {
    color: "#56bbf1",
    fontFamily: "ComicRelief-Bold",
    fontSize: 14,
    textAlign: "center",
  },
  bottomContainer: {
    maxHeight: 190,
  },
  bottomContent: {
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    gap: 8,
  },
  button: {
    backgroundColor: "#56bbf1",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    minWidth: 110,
    maxWidth: 160,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    lineHeight: 16,
  },
});
