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
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./config";
import * as Font from "expo-font";

export default function Dashboard() {
  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/chatbot")}
          >
            <Feather name="arrow-left" size={24} color={"#fff"} />
            <Text style={styles.backButtonText}>Logout</Text>
          </TouchableOpacity>

          <View style={styles.mainContainer}>
            <Text style={styles.userName}>Name: </Text>
            <Text style={styles.userName}>Last Login:</Text>

            <View style={styles.subContainer}>
              <View style={styles.columnsContainer}>
                <View style={styles.column}>
                  <View style={styles.inputField}>
                    <Text style={styles.input}>Total Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.input}>Story Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.input}>Quiz Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      editable={false}
                    />
                  </View>
                  <View style={styles.inputField}>
                    <Text style={styles.input}>Chat Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      editable={false}
                    />
                  </View>
                </View>

                <View style={styles.column}>
                  <View style={styles.inputField}>
                    <Text style={styles.input}>Dream Career</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.input}>Question Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.input}>Joke Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      editable={false}
                    />
                  </View>
                  <View style={styles.inputField}>
                    <Text style={styles.input}>Game Score</Text>
                    <TextInput
                      style={[styles.inputText, styles.nonEditableInput]}
                      editable={false}
                    />
                  </View>
                </View>
              </View>
            </View>

            <view style={styles.subContainer}>
              <Text style={styles.input}>Wrong Words Used:</Text>
              <TextInput style={styles.inputText} />
            </view>
          </View>

        <View style={{display:"flex", flexDirection:"row", gap:20}}>
          <TouchableOpacity style={styles.changePassButton}>
            <Text style={styles.backButtonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.changePassButton}>
            <Text style={styles.backButtonText}>Unblock Account</Text>
          </TouchableOpacity>

        </View>
          

          <View style={styles.subContainer}>
            <Text style={styles.input}>Chat History :</Text>
            <TextInput style={styles.inputText} />
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  backButton: {
    maxWidth: 120,
    left: 0,
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#f66c46ff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 20,
  },
  changePassButton: {
    maxWidth: 160,
    display: "flex",
    alignItems:"center",
    justifyContent:"center",
    backgroundColor: "#468df6ff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 20,
    top:20,
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
    padding: 12,
    borderRadius: 4,
    backgroundColor: "#67b8faff",
  },
  subContainer: {
    backgroundColor: "#9cd2ffff",
    padding: 16,
    justifyContent: "center",
    borderRadius: 14,
    marginTop: 16,
  },
  columnsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 14,
    justifyContent: "center",
  },
  column: {
    flex: 1,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarLoadingText: {
    marginTop: 5,
    fontSize: 12,
    color: "#fff",
    fontFamily: "ComicRelief-Regular",
  },
  userName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
  },
  username: {
    marginTop: 4,
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    fontFamily: "ComicRelief-Regular",
  },
  inputField: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 8,
  },
  input: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    color: "#222222ff",
    fontFamily: "ComicRelief-Regular",
  },
  inputText: {
    width: "100%",
    marginTop: 6,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    fontFamily: "ComicRelief-Regular",
  },
  nonEditableInput: {
    backgroundColor: "#f5f5f5",
    color: "#363636ff",
  },
});
