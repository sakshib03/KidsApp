import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Font from "expo-font";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../utils/ThemeContext";

export default function RedeemRewards() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { theme, changeTheme, themes,goodies}=useTheme();

  useEffect(() => {
    Font.loadAsync({
      "ComicRelief-Bold": require("../../../assets/fonts/ComicRelief-Bold.ttf"),
      "ComicRelief-Regular": require("../../../assets/fonts/ComicRelief-Regular.ttf"),
    }).then(() => setFontsLoaded(true));
  }, []);

  // Function to handle theme selection
  const handleThemeSelect = (themeName) => {
    changeTheme(themeName);
    // You can also save the selected theme to AsyncStorage here
  };

  return (
    <ImageBackground
      source={theme.background} // Use theme background
      style={styles.background}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.accentColor }]} // Use theme accent color
          onPress={() => router.push("/(tabs)/components/profile")}
        >
          <Feather name="arrow-left" size={24} color={"#fff"} />
          <Text style={[styles.backButtonText, { color: "#fff" }]}>
            Back to Home
          </Text>
        </TouchableOpacity>

        <ScrollView>
          <View style={styles.mainContainer}>
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#F25F3B",
                  fontFamily: theme.fontFamily, // Use theme font
                }}
              >
                Redeem Rewards
              </Text>
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 16,
                  textAlign: "center",
                  fontWeight: 400,
                  color: "#404040ff",
                  fontFamily: theme.fontFamily, // Use theme font
                }}
              >
                Use your scores to redeem cool rewards!
              </Text>
            </View>

            <View style={{ gap: 20 }}>
              <View style={styles.subContainer}>
                <View style={styles.totalCoins}>
                  <MaterialIcons
                    name="monetization-on"
                    size={24}
                    color="gold"
                  />
                  <Text style={[styles.totalValue, {fontFamily: theme.fontFamily}]}>0</Text>
                </View>

                <View>
                  <Text
                    style={{
                      color: "#F25F3B",
                      fontFamily: theme.fontFamily,
                      fontSize: 16,
                      fontWeight: "bold",
                      marginBottom: 15,
                    }}
                  >
                    GOODIES STORE
                  </Text>

                  <View
                    style={{
                      alignContent: "center",
                      alignItems: "center",
                      gap: 25,
                    }}
                  >
                    <View style={{ gap: 10 }}>
                      <Image
                        source={require("../../../assets/images/rewards/dancing_toy.png")}
                        style={{ width: 115, height: 140, borderRadius: 10 }}
                      />
                      <TouchableOpacity
                        style={{
                          alignContent: "center",
                          alignItems: "center",
                          backgroundColor: "#fea7a7ff",
                          paddingVertical: 8,
                          borderRadius: 8,
                          flexDirection: "row",
                          gap: 4,
                          paddingLeft: 20,
                        }}
                      >
                        <MaterialIcons
                          name="monetization-on"
                          size={24}
                          color="gold"
                        />
                        <Text style={{fontFamily: theme.fontFamily,}}>100</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ gap: 10 }}>
                      <Image
                        source={require("../../../assets/images/rewards/profile_frame1.png")}
                        style={{ width: 115, height: 140, borderRadius: 10 }}
                      />
                      <TouchableOpacity
                        style={{
                          alignContent: "center",
                          alignItems: "center",
                          backgroundColor: "#fea7a7ff",
                          paddingVertical: 8,
                          borderRadius: 8,
                          flexDirection: "row",
                          gap: 4,
                          paddingLeft: 20,
                        }}
                      >
                        <MaterialIcons
                          name="monetization-on"
                          size={24}
                          color="gold"
                        />
                        <Text style={{fontFamily: theme.fontFamily,}}>100</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.subContainer}>
                <View style={styles.totalCoins}>
                  <MaterialIcons
                    name="monetization-on"
                    size={24}
                    color="gold"
                  />
                  <Text style={[styles.totalValue, {fontFamily: theme.fontFamily}]}>0</Text>
                </View>

                <View>
                  <Text
                    style={{
                      color: "#F25F3B",
                      fontFamily: theme.fontFamily,
                      fontSize: 16,
                      fontWeight: "bold",
                      marginBottom: 15,
                    }}
                  >
                    THEME STORE
                  </Text>

                  <View style={styles.themesContainer}>
                    {Object.entries(themes).map(([key, themeData]) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.themeCard,
                          {
                            backgroundColor: "#fff",
                            borderColor: theme.borderColor,
                            borderWidth: 2,
                          },
                        ]}
                      >
                        {/* <View style={[
                      styles.themePreview,
                      { backgroundColor: themeData.accentColor }
                    
                    ]}
                    /> */}
                        <Image
                          source={themeData.background}
                          style={{ width: 116, height: 155,borderTopLeftRadius:10, borderTopRightRadius:10}}
                        />
                        <Text
                          style={[
                            styles.themeName,
                            {
                              fontFamily: theme.fontFamily,
                            },
                          ]}
                        >
                          {themeData.name.charAt(0).toUpperCase() +
                            themeData.name.slice(1)}
                        </Text>
                        <TouchableOpacity
                          style={{
                            padding: 6,
                            backgroundColor: "#217432ff",
                            borderRadius: 8,
                            paddingHorizontal: 20,
                            marginBottom: 10,
                            flexDirection: "row",
                            gap: 4,
                          }}
                          onPress={() => handleThemeSelect(key)}
                        >
                          <MaterialIcons
                            name="monetization-on"
                            size={22}
                            color="gold"
                          />
                          <Text
                            style={[
                              styles.themeStatus,
                              {
                                color: "#fff",
                                fontSize: 12,
                                fontFamily: theme.fontFamily,
                                top: 3,
                              },
                            ]}
                          >
                            {themeData.unlock_price}
                          </Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
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
    padding: 16,
    marginTop: 30,
  },
  backButton: {
    width: 160,
    left: 0,
    display: "flex",
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
    marginLeft: 5,
  },
  mainContainer: {
    width: "100%",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  subContainer: {
    padding: 16,
    borderRadius: 12,
  },
  themesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
  },
  themeCard: {
    width: 120,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themePreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 6,
    marginTop: 4,
    color: "#F25F3B",
  },
  themeStatus: {
    fontSize: 12,
    textAlign: "center",
  },
  totalCoins: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#a2e3ffff",
    left: 180,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 30,
  },
  totalValue: {
    alignItems: "center",
    top: 2,
  },
  input: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: 500,
  },
});
