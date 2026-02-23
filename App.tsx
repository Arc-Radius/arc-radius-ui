import { useCallback } from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  LibreBaskerville_400Regular,
  LibreBaskerville_700Bold,
} from '@expo-google-fonts/libre-baskerville';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from '@expo-google-fonts/ibm-plex-sans';

import { ScreenContent } from 'components/ScreenContent';

import './global.css';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    LibreBaskerville_400Regular,
    LibreBaskerville_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View className="flex-1" onLayout={onLayoutRootView}>
        <ScreenContent title="Home" path="App.tsx" />
        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}
