import { Slot } from 'expo-router';
import { View } from 'react-native';

import { Footer } from '../Footer';
import { Header } from '../Header';
import AppTabs from './AppTabs';

export default function AppShell() {
  return (
    <View className="flex-1 bg-arc-cream">
      <View className="w-full bg-arc-cream px-6 pt-4">
        <View className="w-full max-w-[1100px] self-center">
          <Header />
          <View className="pb-4 pt-3">
            <AppTabs position="top" />
          </View>
        </View>
      </View>

      <View className="flex-1 min-h-0 bg-arc-cream">
        <View className="min-h-0 w-full flex-1 px-6 pb-8">
          <View className="min-h-0 w-full max-w-[1100px] flex-1 self-center">
            <Slot />
          </View>
        </View>
      </View>

      <View className="w-full bg-arc-cream px-6 pb-6">
        <View className="w-full max-w-[1100px] self-center">
          <Footer />
        </View>
      </View>
    </View>
  );
}
