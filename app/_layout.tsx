import { useCallback } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/app/providers/query-client';
import '@/global.css';

void SplashScreen.preventAutoHideAsync();

/**
 * Fonts + splash: we hide the splash screen only after Greycliff loads (or on font error).
 * Returning null until then keeps native splash visible; on web it can delay first paint
 * (static rendering / SEO). If web discoverability becomes a priority, consider
 * `font-display: swap` or a font subset + non-blocking splash strategy.
 */

// Greycliff CF from fonts/Greycliff/
const GreycliffFonts = {
  GreycliffCF_400Regular: require('@/fonts/Greycliff/GreycliffCF-Regular.otf'),
  GreycliffCF_500Medium: require('@/fonts/Greycliff/GreycliffCF-Medium.otf'),
  GreycliffCF_600DemiBold: require('@/fonts/Greycliff/GreycliffCF-DemiBold.otf'),
  GreycliffCF_700Bold: require('@/fonts/Greycliff/GreycliffCF-Bold.otf'),
};

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts(GreycliffFonts);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <View className="flex-1" onLayout={onLayoutRootView}>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="auto" />
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
