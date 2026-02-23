import { Pressable, Text, View } from 'react-native';

const links = ['Privacy', 'Terms', 'Contact', 'Crisis Resources'];

export function Footer() {
  return (
    <View className="flex-row flex-wrap items-center justify-between border-t border-stone-300 pt-6">
      <View className="flex-row items-center gap-2.5">
        <View className="h-7 w-7 items-center justify-center rounded-full bg-arc-charcoal">
        </View>
        <Text className="text-xl font-serif-bold leading-8 text-stone-800">Arc Radius</Text>
      </View>

      <Text className="text-xs font-sans leading-5 text-stone-500">
        UC Berkeley MIDS W210 Capstone
      </Text>

      <View className="flex-row items-start gap-4">
        {links.map((link) => (
          <Pressable key={link}>
            <Text className="text-xs font-sans leading-5 text-stone-500">{link}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
