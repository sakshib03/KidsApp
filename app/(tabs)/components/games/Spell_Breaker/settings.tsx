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
    <View style={styles.background}>
      <View style={styles.mainContainer}>
        <View style={styles.contentWrapper}>
          <Image
            source={require("@/assets/images/games/spellGame/snail.png")}
            style={[
              styles.completedBanner,
              { width: 150, top: -50, marginRight: 240 },
            ]}
          />
          <Image
            source={require("@/assets/images/games/spellGame/cloud.png")}
            style={styles.completedBanner}
          />
          <Image
            source={require("@/assets/images/games/spellGame/settings1.png")}
            style={[styles.completedBanner, { width: 150, top: -20 }]}
          />

          <View style={styles.container}>
            <View style={{ flexDirection: "row", gap: 14, marginTop: 30 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#FFF",
                  padding: 12,
                  borderRadius: 50,
                }}
              >
                <Image
                  source={require("@/assets/images/games/spellGame/volume.png")}
                  style={{ width: 40, height: 40 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push(
                    "/(tabs)/components/games/Spell_Breaker/welcomePage"
                  )
                }
                style={{
                  backgroundColor: "#FFF",
                  padding: 14,
                  borderRadius: 50,
                }}
              >
                <Image
                  source={require("@/assets/images/games/spellGame/home.png")}
                  style={{ width: 30, height: 30 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: "#FFF",
                  padding: 10,
                  borderRadius: 50,
                }}
              >
                <Image
                  source={require("@/assets/images/games/spellGame/question (2).png")}
                  style={{ width: 40, height: 40 }}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() =>
                router.push("/(tabs)/components/games/Spell_Breaker/gameLevel")
              }
              style={{ marginTop: 10 }}
            >
              <Text style={styles.progress}>Select Level</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                gap: 15,
                backgroundColor: "#fa3dd5ff",
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 6,
                marginTop: 10,
              }}
              onPress={() =>
                router.push("/(tabs)/components/games/Spell_Breaker/progress")
              }
            >
              <Text style={styles.levelTitle}>Your Progress</Text>
            </TouchableOpacity>

            {/* Stars Section */}
            <View style={styles.infoContainer}>
              <TouchableOpacity>
                <Text style={styles.progress}>{"\u25CF"} How to play</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.progress}>{"\u25CF"} Features</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.progress}>{"\u25CF"} Accessibility</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                router.push(
                  "/(tabs)/components/games/Spell_Breaker/welcomePage"
                )
              }
            >
              <Image
                source={require("@/assets/images/games/spellGame/left-arrow.png")}
                style={styles.backIcon}
              />

              <Text style={styles.buttonText}>BACK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <Image
          source={require("@/assets/images/games/spellGame/flower.png")}
          style={styles.flowerBottom}
          blurRadius={2}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems:"center",
    backgroundColor: "#fadcfeff",
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
    width: 320,
    height: 90,
    resizeMode: "contain",
    position: "absolute",
    zIndex: 1000,
    bottom: 355,
  },
  container: {
    marginTop:30,
    borderWidth: 18,
    borderColor: "#861C90",
    backgroundColor: "#FFC7C9",
    height: 400,
    width: 300,
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
    fontSize: 18,
    fontFamily: "ComicRelief-Bold",
    color: "#ffffffff",
    textAlign: "center",
    marginTop: 2,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  infoContainer: {
    marginTop: 15,
    marginLeft: 60,
    width: "100%",
    alignContent: "center",
  },
  progress: {
    fontSize: 18,
    color: "#451760",
    fontFamily: "ComicRelief-Regular",
  },
  backButton: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 15,
    marginBottom: 10,
    marginTop: 20,
  },
  buttonText: {
    marginTop: 2,
    fontSize: 18,
    fontFamily: "ComicRelief-Bold",
    color: "#451760",
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
  bottomContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    position: "absolute",
    bottom: 0,
  },
  flowerBottom: {
    width: "100%",
    height: 200,
  },
});
