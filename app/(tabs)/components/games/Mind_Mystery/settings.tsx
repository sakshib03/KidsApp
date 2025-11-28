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
import { Feather , Ionicons} from "@expo/vector-icons";
import { soundManager } from "@/app/(tabs)/utils/soundManager";

export default function Settings() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(true);

  useEffect(() => {
    loadFonts();
  }, []);

  const toggleSound = async () => {
    try {
      await soundManager.toggle();
      setIsSoundPlaying(soundManager.getIsPlaying());
    } catch (error) {
      console.error("Error toggling sound:", error);
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
      source={require("@/assets/images/games/mindMystery/bg3.png")}
      style={styles.background}
    >
      <View style={styles.mainContainer}>
        <View style={styles.contentWrapper}>
          <Image
            source={require("@/assets/images/games/cloud.png")}
            style={styles.completedBanner}
          />
          <Image
            source={require("@/assets/images/games/mindMystery/settings1.png")}
            style={[styles.completedBanner,{width:150, top:-50}]}
          />

          <View style={styles.container}>
            <View style={{ flexDirection: "row", gap: 20, marginTop: 20 }}>
              <TouchableOpacity
              style={{backgroundColor:"#223E52" , padding:4, borderRadius:5}}
              onPress={toggleSound}
              >
               <Ionicons
                name={
                  isSoundPlaying
                    ? "volume-medium-outline"
                    : "volume-mute-outline"
                }
                size={30}
                color="#fff"
              />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push(
                    "/(tabs)/components/games/Mind_Mystery/welcomePage"
                  )
                }
              >
                <Image
                  source={require("@/assets/images/games/mindMystery/home.png")}
                  style={{ width: 40, height: 40, backgroundColor: "#223E52", padding:8,borderRadius:5}}
                />
              </TouchableOpacity>

              <TouchableOpacity>
                <Image
                  source={require("@/assets/images/games/mindMystery/questions.png")}
                  style={{ width: 40, height: 40, backgroundColor: "#223E52", padding:8, borderRadius:5}}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={()=>router.push("/(tabs)/components/games/Mind_Mystery/gameLevel")} style={{marginTop:10}}>
                <Text style={styles.progress}>Select Level</Text>
              </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                gap: 15,
                backgroundColor: "#223E52",
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 6,
                marginTop:10
              }}
              onPress={()=>router.push("/(tabs)/components/games/Mind_Mystery/progress")}
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
                  "/(tabs)/components/games/Mind_Mystery/welcomePage"
                )
              }
            >
              <Feather name="arrow-left" size={26} color={"#fff"} />

              <Text style={styles.buttonText}>BACK</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Image
          source={require("@/assets/images/games/mindMystery/tree.png")}
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
    paddingVertical: 10,
    paddingHorizontal: 10,
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
    bottom: 370,
  },
  container: {
    borderWidth: 16,
    borderColor: "#223E52",
    backgroundColor: "#E0F2FF",
    height: 400,
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
    color: "#223E52",
    fontFamily: "ComicRelief-Regular",
  },
  backButton: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#223E52",
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
    height: 250,
    position: "absolute",
    bottom: -60,
    right: 150,
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
