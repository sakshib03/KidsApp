import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuthCheck(){
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Small delay to avoid race condition
      await new Promise((res) => setTimeout(res, 150));

      const loginTime = await AsyncStorage.getItem("loginTime");
      const accessToken = await AsyncStorage.getItem("accessToken");
      const userType = await AsyncStorage.getItem("userType");

      const isTokenValid = checkTokenValidity(loginTime);

      if (accessToken && isTokenValid && userType) {
        // Auto-redirect based on user type
        if (userType === "child") {
          router.replace("/(tabs)/chatbot");
        } else if (userType === "parent") {
          router.replace("/(tabs)/dashboard");
        }
      } else {
        // Token expired or invalid, clear storage and stay on login
        await clearAuthStorage();
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  };

  const checkTokenValidity = (loginTime) => {
    if (!loginTime) return false;
    
    const FIFTEEN_DAYS_IN_MS = 15 * 24 * 60 * 60 * 1000;
    const currentTime = new Date().getTime();
    const loginTimestamp = parseInt(loginTime);
    
    return currentTime - loginTimestamp < FIFTEEN_DAYS_IN_MS;
  };

  const clearAuthStorage = async () => {
    try {
      await AsyncStorage.multiRemove([
        "accessToken",
        "loginTime", 
        "userType",
        "childId",
        "parentId",
        "userData",
        "parentData"
      ]);
    } catch (error) {
      console.error("Error clearing auth storage:", error);
    }
  };

  return null;
};
