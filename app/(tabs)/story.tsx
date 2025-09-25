import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  TextInput,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function Story() {
  return (
    <ImageBackground
      source={require("@/assets/images/login_image.png")}
      style={styles.background}
    >
      <View style={styles.mainContainer}>
        <Text style={styles.welcomeText}>
          Welcome to the ChatBot! Let's have some fun.
        </Text>

        <View style={styles.row}>
          <View style={styles.input}>
            <TextInput
              style={styles.inputText}
              placeholder="Type your question here..."
              placeholderTextColor="#000"
            />
            <Feather name="send" size={20} color="#56bbf1ff" />
          </View>

          <View style={styles.iconGroup}>
            <Feather
              name="volume-2"
              size={20}
              color="#fff"
              style={styles.iconButton}
            />

            <Feather
              name="mic-off"
              size={20}
              color="#fff"
              style={styles.iconButton}
            />
          </View>
        </View>
      </View>

      {/* Buttons Container */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(tabs)/chatbot")}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/dragon.png")}
          style={styles.logo}
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
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcomeText: {
    fontFamily: "ComicRelief-Regular",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    width: 260,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 20,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "ComicRelief-Regular",
    fontWeight: "500",
    color: "#000",
    marginRight: 8,
  },
  iconGroup: {
    flexDirection: "row",
    marginTop: 20,
  },
  iconButton: {
    marginHorizontal: 4,
    backgroundColor: "#56bbf1ff",
    padding: 10,
    borderRadius: 8,
  },
  bottomContainer: {
    position: "absolute",
    top: 50,
    left: 10,
  },
  button: {
    backgroundColor: "#56bbf1ff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
});
