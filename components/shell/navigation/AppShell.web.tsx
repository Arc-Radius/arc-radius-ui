import { Slot } from 'expo-router';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { BottomNav } from '@/components/shell/BottomNav';
import { Header } from '@/components/shell/Header';
import { MaxWidth, screenGutterClass } from '@/components/ui/screen-layout';

export default function AppShell() {
  return (
    <View className="min-h-screen flex-1 bg-app-bg">
      <View className="w-full bg-app-bg">
        <MaxWidth>
          <Header />
        </MaxWidth>
      </View>

      <View className={twMerge('min-h-0 w-full flex-1 bg-app-bg pb-10', screenGutterClass)}>
        <MaxWidth className="min-h-0 flex-1">
          <Slot />
        </MaxWidth>
      </View>

      <View className={twMerge('w-full bg-app-bg', screenGutterClass)}>
        <MaxWidth>
          <BottomNav />
        </MaxWidth>
      </View>
    </View>
  );
}
