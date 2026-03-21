import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CrisisRoute() {
  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <View className="flex-1 px-6 py-8">
      <View className="w-full max-w-[880px] self-center gap-5">
        <Text className="font-sans-bold text-2xl text-zinc-900">Crisis resources</Text>
        <Text className="font-sans text-base leading-7 text-zinc-600">
          If someone is in immediate danger, call local emergency services first. This page is the
          global crisis tab destination and can now be expanded with state-specific resources.
        </Text>
        <Pressable
          className="max-w-[360px] rounded-lg border border-zinc-200/90 bg-white px-4 py-3 shadow-sm active:opacity-80"
          accessibilityRole="button"
          onPress={() => Alert.alert('Call support', 'Wire hotline actions for your target region.')}
        >
          <Text className="font-sans-semibold text-sm text-zinc-900">Contact support hotline</Text>
          <Text className="pt-0.5 font-sans text-xs text-zinc-500">Tap to configure hotline action</Text>
        </Pressable>
      </View>
      </View>
    </SafeAreaView>
  );
}
