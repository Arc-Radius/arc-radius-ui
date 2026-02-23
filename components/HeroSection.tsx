import { Text, View } from 'react-native';

export function HeroSection() {
  return (
    <View className="gap-4">
      <Text className="text-xs font-sans-semibold uppercase leading-5 tracking-wide text-stone-500">
        Legal navigation for LGBTQ+ youth
      </Text>
      <Text className="text-5xl font-serif-bold leading-[55.20px] text-stone-800">
        {'Know your rights.\nNavigate the landscape.'}
      </Text>
      <View className="max-w-[480px] pt-1">
        <Text className="text-base font-sans leading-7 text-stone-700">
          Arc Radius helps you understand the legal climate in your state — from policy overviews to
          proposed bills — so you can stay informed, stay safe, and take action.
        </Text>
      </View>
    </View>
  );
}
