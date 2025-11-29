import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useTheme } from "../utils/ThemeContext";
import { API_BASE } from "../utils/config";

export default function Story() {
  const [story, setStory] = useState("");
  const [storyParts, setStoryParts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [childId, setChildId] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [currentCartoon, setCurrentCartoon]=useState(null);
  const {theme}=useTheme();

  const cartoons=[
    require("@/assets/images/dragon.png"),
    require("@/assets/images/story-cartoon.png"),
    require("@/assets/images/story-cartoon1.png"),
  ];

  useEffect(() => {
    Font.loadAsync({
      "ComicRelief-Bold": require("../../../assets/fonts/ComicRelief-Bold.ttf"),
      "ComicRelief-Regular": require("../../../assets/fonts/ComicRelief-Regular.ttf"),
    }).then(() => setFontsLoaded(true));

    const randomIndex=Math.floor(Math.random()*cartoons.length);
    setCurrentCartoon(cartoons[randomIndex]);

    fetchChildId();
  }, []);

  const fetchChildId = async () => {
    try {
      const childData = await AsyncStorage.getItem("userData");
      if (childData) {
        const parsedData = JSON.parse(childData);
        setChildId(parsedData.child_id);
        fetchStory(parsedData.child_id);
      }
    } catch (error) {
      console.error("Error fetching child ID:", error);
    }
  };

  const fetchStory = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/generate-story`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child_id: id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch story");
      }
      const data = await response.json();
      setStory(data.story);

      // Split story into chunks that fit the container
      const chunks = splitStoryIntoChunks(data.story);
      setStoryParts(chunks);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error fetching story:", error);
      setStory("Unable to load story. Please try again.");
      setStoryParts(["Unable to load story. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  const splitStoryIntoChunks = (fullStory) => {
    if (!fullStory) return [];
    
    const chunks = [];
    const maxChunkSize = 300; 
    
    let currentChunk = "";
    const sentences = fullStory.split(/(?<=[.?!])\s+/);
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence + " ";
      } else {
        currentChunk += sentence + " ";
      }
    }
    
    // Push the last chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    // If the story is short enough to fit in one chunk, return it as a single chunk
    return chunks.length > 0 ? chunks : [fullStory];
  };

  const handleNext = () => {
    if (currentIndex < storyParts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <ImageBackground
      // source={require("@/assets/images/login_image.png")}
      source={theme.background}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/components/chatbot")}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Your Story</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Feather name="loader" size={30} color="#3e3e3eff" />
              <Text style={styles.loadingText}>
                Generating your magical story...
              </Text>
            </View>
          ) : (
            <View style={styles.storyWrapper}>
              <View style={styles.storyContainer}>
                <ScrollView 
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={true}
                >
                  <Text style={styles.storyText}>
                    {storyParts.length > 0
                      ? storyParts[currentIndex]
                      : "Your story will appear here..."}
                  </Text>
                </ScrollView>
                
                {/* Navigation Controls */}
                {storyParts.length > 1 && (
                  <View style={styles.navigationContainer}>
                    <TouchableOpacity
                      onPress={handlePrev}
                      disabled={currentIndex === 0}
                      style={[
                        styles.navButton,
                        currentIndex === 0 && styles.disabledButton
                      ]}
                    >
                      <View style={styles.navButtonContent}>
                        <Feather name="chevron-left" size={24} color={currentIndex === 0 ? "#ccc" : "#333"} />
                        <Text style={[
                          styles.navButtonText,
                          currentIndex === 0 && styles.disabledText
                        ]}>Prev</Text>
                      </View>
                    </TouchableOpacity>

                    <Text style={styles.pageIndicator}>
                      {currentIndex + 1} / {storyParts.length}
                    </Text>

                    <TouchableOpacity
                      onPress={handleNext}
                      disabled={currentIndex === storyParts.length - 1}
                      style={[
                        styles.navButton,
                        currentIndex === storyParts.length - 1 && styles.disabledButton
                      ]}
                    >
                      <View style={styles.navButtonContent}>
                        <Text style={[
                          styles.navButtonText,
                          currentIndex === storyParts.length - 1 && styles.disabledText
                        ]}>Next</Text>
                        <Feather name="chevron-right" size={24} color={currentIndex === storyParts.length - 1 ? "#ccc" : "#333"} />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Dragon Logo */}
        <View style={styles.logoContainer}>
          {currentCartoon &&(
            <Image source={currentCartoon} style={styles.logo}/>
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
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#51bdf8ff",
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
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 60,
    color: "#51bdf8ff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: "ComicRelief-Regular",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  storyWrapper: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 5,
  },
  storyContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  storyText: {
    fontSize: 18,
    lineHeight: 28,
    color: "#333",
    textAlign: "left",
    fontFamily: "ComicRelief-Regular",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  navButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  navButtonText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "ComicRelief-Regular",
  },
  disabledButton: {
  
  },
  disabledText: {
    color: "#ccc",
  },
  pageIndicator: {
    fontSize: 14,
    color: "#666",
    fontFamily: "ComicRelief-Regular",
    fontWeight: "600",
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
    color: "#474646ff",
    fontWeight: "500",
    marginTop: 15,
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 4,
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    opacity: 0.9,
  },
});