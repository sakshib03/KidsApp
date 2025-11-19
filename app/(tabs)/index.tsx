import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import * as Font from "expo-font";

export default function HomeScreen() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  useEffect(() => {
    Font.loadAsync({
      "ComicRelief-Bold": require("../../assets/fonts/ComicRelief-Regular.ttf"),
      "ComicRelief-Regular": require("../../assets/fonts/ComicRelief-Regular.ttf"),
    }).then(() => setFontsLoaded(true));
  }, []);
  return (
    <ImageBackground
      source={require("@/assets/images/login/bg1.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Image
          source={require("@/assets/images/login/logo.png")}
          style={styles.logo}
        />
        <Text
          style={{
            color: "#0F6424",
            fontSize: 26,
            fontFamily: "ComicRelief-Regular",
            fontWeight: 800,
            marginTop: 20,
          }}
        >
          Kids Bot
        </Text>
        <Text
          style={{
            color: "#0F6424",
            fontSize: 28,
            fontFamily: "ComicRelief-Regular",
            fontWeight: 800,
            marginBottom: 30,
          }}
        >
          Welcome!
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(tabs)/auth/signup")}
        >
          <Text style={styles.buttonText}>CREATE AN ACCOUNT</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(tabs)/auth/login")}>
          <Text
            style={{
              fontSize: 20,
              marginBottom: 20,
              color: "#0F6424",
              fontWeight: 600,
              fontFamily: "ComicRelief-Bold",
            }}
          >
            lOGIN
          </Text>
        </TouchableOpacity>
      </View>
      <Image
      source={require("@/assets/images/login/lets-go.png")}
      style={{height:240, width:140, left:220, position:"relative", bottom:10}}
      />
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
    backgroundColor: "#f7f4aeff",
    marginTop: 100,
    marginHorizontal: 20,
    borderRadius: 15,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 30,
  },
  button: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
    backgroundColor: "#0F6424",
    padding: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 500,
    color: "#fff",
    fontFamily: "ComicRelief-Regular",
  },
});
