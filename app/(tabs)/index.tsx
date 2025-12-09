import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  ActivityIndicator
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

  // Show loading indicator while fonts load
  if (!fontsLoaded) {
    return (
      <ImageBackground
        source={require("@/assets/images/login/bg1.png")}
        style={styles.background}
      >
        <View style={[styles.container, {justifyContent: 'center'}]}>
          <ActivityIndicator size="large" color="#0F6424" />
        </View>
      </ImageBackground>
    );
  }

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
        <Text style={styles.title}>
          Kids Bot
        </Text>
        <Text style={styles.welcomeText}>
          Welcome!
        </Text>
        
        {/* CREATE ACCOUNT BUTTON - FIXED */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(tabs)/auth/signup")}
        >
          <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>
            CREATE AN ACCOUNT
          </Text>
        </TouchableOpacity>
        
        {/* LOGIN BUTTON - FIXED */}
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push("/(tabs)/auth/login")}
        >
          <Text style={styles.loginText} numberOfLines={1}>
            LOGIN
          </Text>
        </TouchableOpacity>
      </View>
      <Image
        source={require("@/assets/images/login/lets-go.png")}
        style={styles.bottomImage}
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
    paddingHorizontal: 20, 
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 30,
  },
  title: {
    color: "#0F6424",
    fontSize: 26,
    fontFamily: "ComicRelief-Regular",
    fontWeight:700,
    marginTop: 20,
  },
  welcomeText: {
    color: "#0F6424",
    fontSize: 28,
    fontFamily: "ComicRelief-Regular",
    fontWeight:700,
    marginBottom: 30,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 20,
    backgroundColor: "#0F6424",
    paddingVertical: 15, 
    paddingHorizontal: 40, 
    borderRadius: 25,
    minWidth: 250, 
    width: '90%', 
    maxWidth: 300, 
  },
  buttonText: {
    fontSize: 16, 
    color: "#fff",
    fontFamily: "ComicRelief-Regular",
    textAlign: "center",
    width: '100%',
  },
  loginButton: {
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  loginText: {
    fontSize: 20,
    color: "#0F6424",
    fontFamily: "ComicRelief-Bold",
    textAlign: "center",
  },
  bottomImage: {
    height: 240,
    width: 140,
    left: 220,
    position: "relative",
    bottom: 10,
  },
});