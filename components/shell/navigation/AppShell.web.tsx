import { Slot } from 'expo-router';
import { View } from 'react-native';

import { BottomNav } from '@/components/shell/BottomNav';
import { Header } from '@/components/shell/Header';

export default function AppShell() {
  return (
    <View className="min-h-screen flex-1 bg-app-bg">
      <View className="w-full bg-app-bg">
        <View className="w-full max-w-screen-lg self-center">
          <Header />
        </View>
      </View>

      <View className="min-h-0 w-full flex-1 bg-app-bg px-4 pb-10 sm:px-6 md:px-8">
        <View className="min-h-0 w-full max-w-screen-lg flex-1 self-center">
          <Slot />
        </View>
      </View>

      {/* Same width + horizontal padding as body (max-w-screen-lg) */}
      <View className="w-full bg-app-bg sm:px-6 md:px-8">
        <View className="w-full max-w-screen-lg self-center">
          <BottomNav />
        </View>
      </View>
    </View>
  );
}
