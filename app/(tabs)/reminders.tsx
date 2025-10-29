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

export default function Reminders() {
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
          <View style={{ alignItems: "center", marginBottom: 30 }}>
            <Text
              style={{
                marginTop: 10,
                fontSize: 20,
                fontWeight: 500,
                color: "#fff",
              }}
            >
              Manage Your Reminders
            </Text>
          </View>

          <View style={styles.subContainer}>
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <View style={styles.inputField}>
                <Text style={styles.input}>Title</Text>
                <TextInput style={styles.inputText} />
              </View>

              <View style={styles.inputField}>
                <Text style={styles.input}>Date</Text>
                <TextInput style={styles.inputText} />
              </View>

              <View style={styles.inputField}>
                <Text style={styles.input}>Time</Text>
                <TextInput style={styles.inputText} />
              </View>

              <View style={styles.inputField}>
                <Text style={styles.input}>Description</Text>
                <TextInput style={[styles.inputText, { height: 60 }]} />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#196c57ff" , gap:20}]}
            >
              <Text style={styles.buttonText}><Feather name="plus" size={18}/>Create Reminder</Text>
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
    marginTop:30
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
    borderRadius: 16,
    backgroundColor: "#3da3f8ff",
  },
  subContainer: {
    backgroundColor: "#9cd2ffff",
    padding: 16,
    justifyContent: "center",
    alignItems:"center"
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
    fontSize: 16,
    fontWeight: 500,
  },
  inputText: {
    width: 220,
    marginTop: 12,
    backgroundColor: "#fff",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    paddingVertical: 2,
    paddingHorizontal: 25,
  },
  button: {
    backgroundColor: "#56bbf1",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginTop: 20,
    alignItems: "center",
    flex: 1,
    minWidth: 170,
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
