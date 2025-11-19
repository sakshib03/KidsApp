import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Font from "expo-font";
import { router } from "expo-router";

export default function Settings() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadFonts();
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

  if (!fontsLoaded) {
    return (
      <ImageBackground
        source={require("@/assets/images/games/bg1.png")}
        style={styles.background}
      >
        <Text style={styles.loadingText}>Loading...</Text>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/games/bg2.png")}
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.mainContainer}>
        <View style={styles.contentWrapper}>
          <Image
            source={require("@/assets/images/games/cloud.png")}
            style={styles.completedBanner}
          />
          <Image
            source={require("@/assets/images/games/settings1.png")}
            style={[styles.completedBanner,{width:150, top:-50}]}
          />

          <View style={styles.container}>
            <View style={{ flexDirection: "row", gap: 25, marginTop: 30 }}>
              <TouchableOpacity>
                <Image
                  source={require("@/assets/images/games/audio.png")}
                  style={{ width: 50, height: 50 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push(
                    "/(tabs)/components/games/Brainy_Fruits/welcomePage"
                  )
                }
              >
                <Image
                  source={require("@/assets/images/games/home.png")}
                  style={{ width: 50, height: 50 }}
                />
              </TouchableOpacity>

              <TouchableOpacity>
                <Image
                  source={require("@/assets/images/games/question.png")}
                  style={{ width: 50, height: 50 }}
                />
              </TouchableOpacity>
            </View>

            {/* <TouchableOpacity onPress={()=>router.push("/(tabs)/components/games/Brainy_Fruits/gameLevel")} style={{marginTop:10}}>
                <Text style={styles.progress}>Select Level</Text>
              </TouchableOpacity> */}

            <TouchableOpacity
              style={{
                flexDirection: "row",
                gap: 15,
                backgroundColor: "#46BEF5",
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 6,
                marginTop:10
              }}
              onPress={()=>router.push("/(tabs)/components/games/Brainy_Fruits/progress")}
            >

              <Text style={styles.levelTitle}>Your Progress</Text>
            </TouchableOpacity>

            {/* Stars Section */}
            <View style={styles.infoContainer}>
              <TouchableOpacity>
                <Text style={styles.progress}>{'\u25CF'} How to play</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.progress}>{'\u25CF'} Features</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.progress}>{'\u25CF'} Accessibility</Text>
              </TouchableOpacity>

              
            </View>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                router.push(
                  "/(tabs)/components/games/gamesDashboard"
                )
              }
            >
              <Image
                source={require("@/assets/images/games/back-arrow.png")}
                style={styles.backIcon}
              />

              <Text style={styles.buttonText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Image
          source={require("@/assets/images/games/apple2.png")}
          style={styles.character}
        />
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
    width: "90%",
    height: "85%",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    position: "relative",
  },
  contentWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    position: "relative",
  },
  completedBanner: {
    width: 340,
    height: 100,
    resizeMode: "contain",
    position: "absolute",
    zIndex: 1000,
    bottom: 345,
  },
  container: {
    borderWidth: 16,
    borderColor: "#20860E",
    backgroundColor: "#FFF4F4",
    height: 380,
    width: 290,
    borderRadius: 10,
    padding: 6,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  levelTitle: {
    fontSize: 20,
    fontFamily: "ComicRelief-Bold",
    color: "#ffffffff",
    textAlign: "center",
    marginTop: 2,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  infoContainer: {
    marginTop:15,
    marginLeft: 60,
    width: "100%",
    alignContent:"center"
  },
  progress: {
    fontSize: 18,
    color: "#3B5924",
    fontFamily: "ComicRelief-Regular",
  },
  backButton: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#406027ff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    marginTop:20,
  },
  buttonText: {
    marginTop: 2,
    fontSize: 18,
    fontFamily: "ComicRelief-Bold",
    color: "#fff",
    textAlign: "center",
  },
  character: {
    width: 220,
    height: 200,
    position: "absolute",
    bottom: -30,
    right: 10,
    resizeMode: "contain",
  },
  loadingText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "ComicRelief-Regular",
  },
  backIcon: {
    width: 30,
    height: 30,
  },
});
