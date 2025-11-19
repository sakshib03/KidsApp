import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {

  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="index"
        options={{title: 'Home'}}
      />
      {/* <Stack.Screen
        name="login"
        options={{title: 'Login'}}
      />
      <Stack.Screen
      name="signup"
      options={{title: 'SignUp'}}
      />
      <Stack.Screen
      name="dashboard"
      options={{title:'Dashboard'}}
      />
      <Stack.Screen
      name="chatbot"
      options={{title: 'ChatBot'}}
      />
      <Stack.Screen
      name="changePassword"
      options={{title: 'ChangePassword'}}
      />
      <Stack.Screen
      name="story"
      options={{title: 'Story'}}
      />
      <Stack.Screen
      name="joke"
      options={{title:'Joke'}}
      />
      <Stack.Screen
      name="question"
      options={{title:'Question'}}
      />
      <Stack.Screen
      name="quiz"
      options={{title:'Quiz'}}
      />
      <Stack.Screen
      name="profile"
      options={{title:'Profile'}}
      />
      <Stack.Screen
      name="reminders"
      options={{title:'Reminders'}}
      />
      <Stack.Screen
      name="redeemRewards"
      options={{title:'RedeemRewards'}}
      />
      <Stack.Screen
      name="forgotPassword"
      options={{title: 'ForgotPassword'}}
      />
      <Stack.Screen
      name="forgotPassParent"
      options={{title: 'ForgotPassParent'}}
      />
      <Stack.Screen
      name="verifyForgotPassword"
      options={{title:'VerifyForgotPassword'}}
      />
      <Stack.Screen
      name="landingPage"
      options={{title:'LandingPage'}}
      />
      <Stack.Screen
      name="welcomePage"
      options={{title:'WelcomePage'}}
      />
      <Stack.Screen
      name="fruitGame"
      options={{title:'FruitGame'}}
      />
      <Stack.Screen
      name="gamesDashboard"
      options={{title:'GamesDashboard'}}
      />
      <Stack.Screen
      name="progress"
      options={{title:'Progress'}}
      />
      <Stack.Screen
      name="levelComplete"
      options={{title:'LevelComplete'}}
      />
      <Stack.Screen
      name="settings"
      options={{title:'Settings'}}
      />
      <Stack.Screen
      name="selectLevel"
      options={{title:'SelectLevel'}}
      /> */}
    </Stack>
  );
}
