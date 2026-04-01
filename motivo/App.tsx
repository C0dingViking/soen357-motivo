import React, { useState } from 'react';
import { View, Text } from 'react-native';
import AppLoading from 'expo-app-loading';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';

export default function App() {
  const [screen, setScreen] = useState<'login' | 'signup'>('login');

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  (Text as any).defaultProps = (Text as any).defaultProps || {};
  (Text as any).defaultProps.style = { fontFamily: 'Inter_400Regular' };

  return (
    <View style={{ flex: 1 }}>
      {screen === 'login' && <LoginScreen goToSignUp={() => setScreen('signup')} />}
      {screen === 'signup' && <SignUpScreen goToLogin={() => setScreen('login')} />}
    </View>
  );
}
