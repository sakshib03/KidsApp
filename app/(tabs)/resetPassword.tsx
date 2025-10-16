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

export default function ResetPassword() {
  return (
    <ImageBackground
      source={require("@/assets/images/theme3.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 14,
              justifyContent: "center"
            }}
          >
            <View>
              <Text
                style={{
                  display: "flex",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom:20
                }}
              >
                Password Reset
              </Text>
              <View style={styles.prompt}>
                <Text style={{color:"#fff"}}>Enter your e-mail address below, and we will send you an e-mail allowing you to reset it.</Text>
              </View>

              <view style={styles.inputField}>
                <Text style={styles.input}>Email Address</Text>
                <TextInput style={styles.inputText} />
              </view>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#45c556ff" }]}
              >
                <Text style={styles.buttonText}>Request OTP</Text>
              </TouchableOpacity>
            </View>
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
  mainContainer: {
    width: "100%",
    maxHeight: "60%",
    padding: 30,
    backgroundColor: "#7560ecff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius:20,
  },
  prompt:{
    maxWidth:260,
    borderWidth:2,
    borderColor:"#fff",
    backgroundColor:"#684ff2ff",
    padding:4,
    marginBottom:20,
    borderRadius:2,
    paddingHorizontal:10,
    paddingVertical:10
  },
  inputField: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: 500,
    color: "#fff",
  },
  inputText: {
    width: 260,
    height: 40,
    marginTop: 12,
    backgroundColor: "#fff",
    borderColor: "#fff",
    borderWidth: 1,
    padding: 20,
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 25,
  },
  button: {
    backgroundColor: "#56bbf1",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 30,
    alignItems: "center",
    flex: 1,
    minWidth: 260,
    maxWidth: 220,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
    lineHeight: 16,
  },
});
