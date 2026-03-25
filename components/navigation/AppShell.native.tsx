import { Slot } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '../BottomNav';
import { Header } from '../Header';

export default function AppShell() {
  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['left', 'right', 'top']}>
      <Header />
      <View className="flex-1">
        <Slot />
      </View>
      <View className="w-full">
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}
