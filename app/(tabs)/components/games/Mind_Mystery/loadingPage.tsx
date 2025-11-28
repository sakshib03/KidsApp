import * as Font from "expo-font";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ImageBackground,
    StyleSheet,
    Text,
    View
} from "react-native";

export default function LoadingPage() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadFonts();
    startLoading();
  }, []);

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

  const startLoading = () => {
    let timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            router.push("/(tabs)/components/games/Mind_Mystery/mindMysteryGame");
          }, 100);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };


  return (
    <ImageBackground
      source={require("@/assets/images/games/mindMystery/bg1.png")}
      style={styles.background}
    >
      <View style={styles.mainContainer}>
        <Text style={styles.headerTitle}>Mind Mystery</Text>

        <View style={styles.loaderContainer}>
          <View style={styles.loaderBackground}>
            <View style={[styles.loaderFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.loadingText}>Loading...</Text>
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
    alignItems: "center",
    justifyContent: "center",
  },
  mainContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 600,
    color: "#081C5B",
    fontFamily: "ComicRelief-Bold",
  },
  headerSubTitle: {
    fontSize: 20,
    padding:10,
    textAlign:"center",
    color: "#125b08ff",
    fontFamily: "ComicRelief-Regular",
  },
  loaderContainer: {
    marginTop: 30,
    alignItems: "center",
    marginBottom: 80,
  },
  loaderBackground: {
    width: 280,
    height: 20,
    backgroundColor: "#a3b2f5ff",
    borderRadius: 10,
    overflow: "hidden",
  },
  loaderFill: {
    height: "100%",
    backgroundColor: "#081C5B",
  },
  loadingText: {
    marginTop: 8,
    fontWeight: 400,
    fontSize: 14,
    color: "#081C5B",
    fontFamily: "ComicRelief-Regular",
  },
});
