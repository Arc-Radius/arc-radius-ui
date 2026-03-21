import { Slot } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '../BottomNav';

export default function AppShell() {
  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['left', 'right', 'top']}>
      <View className="flex-1">
        <Slot />
      </View>
      <View className="w-full px-4 pb-2">
        <View className="w-full max-w-screen-lg self-center">
          <BottomNav />
        </View>
      </View>
    </SafeAreaView>
  );
}
