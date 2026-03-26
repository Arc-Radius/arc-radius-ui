import { Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

export function PrivacyBanner() {
  return (
    <View className="flex-row gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <ShieldCheck size={20} color="#71717a" style={{ marginTop: 2 }} />
      <View className="flex-1 gap-1.5">
        <Text className="font-sans-bold text-sm leading-6 text-zinc-800">
          Your privacy is protected
        </Text>
        <Text className="font-sans text-xs leading-5 text-zinc-500">
          Arc Radius does not store, share, or sell your location or personal data. All searches are
          anonymous. We believe safety starts with privacy — especially for LGBTQ+ youth in
          vulnerable environments.{' '}
          <Text className="font-sans text-xs leading-5 text-zinc-700 underline" onPress={() => {}}>
            Read our full privacy policy
          </Text>
        </Text>
      </View>
    </View>
  );
}
