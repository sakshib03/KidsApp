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
      name="dashboard"
      options={{title:'Dashboard'}}
      />
      <Stack.Screen
      name="chatbot"
      options={{title: 'ChatBot'}}
      />
       <Stack.Screen
      name="resetPassword"
      options={{title: 'ResetPassword'}}
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
    </Stack>
  );
}
