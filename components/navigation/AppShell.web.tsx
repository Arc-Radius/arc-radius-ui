import { Slot } from 'expo-router';
import { View } from 'react-native';

import { Footer } from '../Footer';
import { Header } from '../Header';
import AppTabs from './AppTabs';

export default function AppShell() {
  return (
    <View className="flex-1 min-h-screen bg-zinc-50">
      <View className="w-full bg-zinc-50 px-4 pt-4 sm:px-6 lg:px-8">
        <View className="w-full max-w-screen-xl self-center">
          <Header rightContent={<AppTabs position="header" />} />
        </View>
      </View>

      <View className="min-h-0 w-full flex-1 bg-zinc-50 px-4 pb-10 sm:px-6 lg:px-8">
        <View className="min-h-0 w-full max-w-screen-xl flex-1 self-center">
            <Slot />
        </View>
      </View>

      <View className="w-full bg-zinc-50 px-4 pb-6 sm:px-6 lg:px-8">
        <View className="w-full max-w-screen-xl self-center">
          <Footer />
        </View>
      </View>
    </View>
  );
}
