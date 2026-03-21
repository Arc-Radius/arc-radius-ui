import { Slot } from 'expo-router';
import { View } from 'react-native';

import { BottomNav } from '../BottomNav';
import { Header } from '../Header';
import AppTabs from './AppTabs';

export default function AppShell() {
  return (
    <View className="min-h-screen flex-1 bg-app-bg">
      {/* Same max width as page content (e.g. HomeScreen max-w-screen-lg) */}
      <View className="w-full bg-app-bg">
        <View className="w-full max-w-screen-lg self-center">
          <Header rightContent={<AppTabs position="header" />} />
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
