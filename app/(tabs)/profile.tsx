import { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./config";
import * as Font from "expo-font";

export default function Profile() {
  return (
    <ImageBackground
      source={require("@/assets/images/theme1.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(tabs)/chatbot")}
        >
          <Feather name="arrow-left" size={24} color={"#fff"} />
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
        <View style={styles.mainContainer}>
          <View style={{ alignItems: "center" }}>
            <Image
              source={require("@/assets/images/user.jpg")}
              style={styles.logo}
            />
            <Text
              style={{
                marginTop: 10,
                fontSize: 14,
                fontWeight: 500,
                color: "#fff",
              }}
            >
              Age:
            </Text>
            <TextInput />
          </View>

          <View style={styles.subContainer}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 14,
                justifyContent: "center",
              }}
            >
              <View>
                <View style={styles.inputField}>
                  <Text style={styles.input}>Total Score</Text>
                  <TextInput style={styles.inputText} />
                </View>

                <view style={styles.inputField}>
                  <Text style={styles.input}>Chat Score</Text>
                  <TextInput style={styles.inputText} />
                </view>

                <View style={styles.inputField}>
                  <Text style={styles.input}>Story Score</Text>
                  <TextInput style={styles.inputText} />
                </View>

                <View style={styles.inputField}>
                  <Text style={styles.input}>Quiz Score</Text>
                  <TextInput style={styles.inputText} />
                </View>
              </View>

              <View>
                <View style={styles.inputField}>
                  <Text style={styles.input}>Dream Career</Text>
                  <TextInput style={styles.inputText} />
                </View>

                <View style={styles.inputField}>
                  <Text style={styles.input}>DOB</Text>
                  <TextInput style={styles.inputText} />
                </View>

                <View style={styles.inputField}>
                  <Text style={styles.input}>Question Score</Text>
                  <TextInput style={styles.inputText} />
                </View>

                <View style={styles.inputField}>
                  <Text style={styles.input}>Joke Score</Text>
                  <TextInput style={styles.inputText} />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <View
            style={{ flexDirection: "row", justifyContent: "center", gap: 20 }}
          >
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#33b445ff" }]}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#ff4b4bff" }]}
            >
              <Text style={styles.buttonText}>Redeem Rewards</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#1bc7c5ff" }]}
              onPress={() => router.push("/(tabs)/changePassword")}
            >
              <Text style={styles.buttonText}>change Password</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: "center",
  },
  backButton: {
    width: 160,
    left: 0,
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#f66c46ff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 20,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
    marginLeft: 5,
    fontFamily: "ComicRelief-Regular",
  },
  mainContainer: {
    width: "100%",
    padding: 16,
    borderRadius: 4,
    backgroundColor: "#67b8faff",
  },
  subContainer: {
    backgroundColor: "#9cd2ffff",
    padding: 16,
    justifyContent: "center",
    borderRadius: 14,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  inputField: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: 500,
  },
  inputText: {
    width: 125,
    marginTop: 12,
    backgroundColor: "#fff",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    paddingVertical: 2,
    paddingHorizontal: 25,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#56bbf1",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginTop: 20,
    alignItems: "center",
    flex: 1,
    minWidth: 160,
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
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    lineHeight: 16,
  },
});
