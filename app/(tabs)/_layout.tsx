import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {

  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="index"
        options={{title: 'Home'}}
      />
      <Stack.Screen
        name="login"
        options={{title: 'Login'}}
      />
      <Stack.Screen
      name="signup"
      options={{title: 'SignUp'}}
      />
      <Stack.Screen
      name="chatbot"
      options={{title: 'ChatBot'}}
      />
      {/* <Stack.Screen
      name="resetPassword"
      options={{title: 'ResetPassword'}}
      />
      <Stack.Screen
      name="changePassword"
      options={{title: 'ChangePassword'}}
      /> */}
      <Stack.Screen
      name="story"
      options={{title: 'Story'}}
      />
    </Stack>
  );
}
