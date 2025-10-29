import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Background } from "@react-navigation/elements";

export default function HomeScreen() {
  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      style={styles.background}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image
          source={require("@/assets/images/logo1.png")}
          style={styles.logo}
        />
        <Text style={{color:"#F25F3B", fontSize:24, fontFamily: "ComicRelief-Regular", fontWeight:800, marginTop:20}}>Kids Bot</Text>
        <Text style={{color:"#F25F3B", fontSize:24, fontFamily: "ComicRelief-Regular", fontWeight:800, marginBottom:30}}>Welcome!</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(tabs)/signup")}
        >
          <Text style={styles.buttonText}>CREATE AN ACCOUNT</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> router.push("/(tabs)/login")}>
          <Text style={{ fontSize: 20, marginBottom:20, color:'#F25F3B', fontWeight:500}}>lOGIN</Text>
        </TouchableOpacity>
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
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius:30,
  },
  button: {
    alignItems:"center",
    marginBottom: 20,
    marginTop:20,
    backgroundColor:'#F25F3B',
    padding:12,
    paddingVertical:10,
    paddingHorizontal:35,
    borderRadius:20,
  },
  buttonText:{
    fontSize:16,
    fontWeight:500,
    color:'#fff'
  }
});
