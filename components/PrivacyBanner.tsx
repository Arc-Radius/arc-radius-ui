import { Text, View } from 'react-native';

import { Card } from './ui/Card';

export function PrivacyBanner() {
  return (
    <Card className="flex-row gap-4 bg-zinc-200 px-6 py-5">
      <View className="flex-1 gap-1.5">
        <Text className="text-sm font-sans-bold leading-6 text-zinc-800">
          Your privacy is protected
        </Text>
        <Text className="text-sm font-sans leading-6 text-zinc-500">
          Arc Radius does not store, share, or sell your location or personal data. All searches are
          anonymous. We believe safety starts with privacy — especially for LGBTQ+ youth in
          vulnerable environments.{' '}
          <Text className="text-sm font-sans leading-6 text-zinc-700 underline" onPress={() => {}}>
            Read our full privacy policy
          </Text>
        </Text>
      </View>
    </Card>
  );
}
