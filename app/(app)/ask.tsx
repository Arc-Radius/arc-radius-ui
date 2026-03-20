import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';

export default function AskRoute() {
  return (
    <SafeAreaView className="flex-1 bg-arc-cream" edges={['top']}>
      <View className="flex-1 px-6 py-8">
      <View className="w-full max-w-[880px] self-center gap-4">
        <Text className="font-serif-bold text-2xl text-stone-900">Ask about your rights</Text>
        <Text className="font-sans text-base leading-7 text-stone-600">
          Ready for AI assistant experience.
        </Text>
        <View className="max-w-64 pt-2">
          <Button
            label="Launch assistant"
            onPress={() => Alert.alert('Coming soon', 'Rights Q&A experience is not wired yet.')}
          />
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
}
