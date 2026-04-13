import React, { useEffect } from 'react';
import { Platform, Text } from 'react-native';
import AppLoading from 'expo-app-loading';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './navigation/RootNavigator';
import InAppNotificationCenter from './components/InAppNotificationCenter';

export default function App() {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    try {
      NavigationBar.setStyle('dark');
    } catch {}
  }, []);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  (Text as any).defaultProps = (Text as any).defaultProps || {};
  (Text as any).defaultProps.style = { fontFamily: 'Inter_400Regular' };

  return (
    <SafeAreaProvider>
      <RootNavigator />
      <InAppNotificationCenter />
    </SafeAreaProvider>
  );
}
