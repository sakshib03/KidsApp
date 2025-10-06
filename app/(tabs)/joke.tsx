import { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./config";
import * as Font from "expo-font";

export default function Joke() {
  const [joke, setJoke] = useState("");
  const [childId, setChildId] = useState(null);
  const [loading, setLoading] = useState(false);
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
        fetchJoke(parsedData.child_id);
      }
    } catch (error) {
      console.error("Error fetching child ID:", error);
    }
  };

  const fetchJoke = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/generate-joke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child_id: id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch joke");
      }

      const data = await response.json();
      setJoke(data.joke);
    } catch (error) {
      console.error("Error fetching joke:", error);
      setJoke("Unable to load joke. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //   const refreshJoke = () => {
  //     if (childId) {
  //       fetchJoke(childId);
  //     } else {
  //       fetchChildId();
  //     }
  //   };

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
          <Text style={styles.title}>Your Joke</Text>
        </View>

        <View style={styles.mainContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Feather name="loader" size={30} color="#3e3e3eff" />
              <Text style={styles.loadingText}>Generating your Joke...</Text>
            </View>
          ) : (
            <View style={styles.jokeWrapper}>
              <ScrollView
                style={styles.jokeContainer}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.scrollContent}
              >
                <Text style={styles.jokeText}>
                  {joke || "Your joke will appear here..."}
                </Text>
              </ScrollView>
            </View>
          )}
        </View>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/gifs/laughing-laugh.gif")}
            style={styles.logo}
          />
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
    marginTop: 30,
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4ca40ff",
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
    color: "#f4ca40ff",
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
    padding: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  jokeWrapper: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 5,
    marginBottom: 25,
  },
  jokeContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
  },
  scrollContent: {
    flexGrow: 1,
  },
  jokeText: {
    fontSize: 18,
    lineHeight: 28,
    color: "#3f3f3fff",
    textAlign: "left",
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
  refreshButton: {
    backgroundColor: "#56bbf1",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#56bbf1",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  refreshButtonDisabled: {
    backgroundColor: "#a0d4f5",
  },
  refreshIconLoading: {
    transform: [{ rotate: "180deg" }],
  },
  refreshButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "ComicRelief-Regular",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 250,
    height: 200,
    resizeMode: "contain",
    opacity: 0.9,
  },
});
