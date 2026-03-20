import { Slot } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppTabs from './AppTabs';

export default function AppShell() {
  return (
    <SafeAreaView className="flex-1 bg-zinc-50" edges={['left', 'right', 'bottom']}>
      <View className="flex-1">
        <Slot />
      </View>
      <AppTabs position="bottom" />
    </SafeAreaView>
  );
}
