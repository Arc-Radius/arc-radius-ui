import { Pressable, Text, View } from 'react-native';

import ArcRadiusLogo from './ui/ArcRadiusLogo';

const links = ['Privacy', 'Terms', 'Contact', 'Crisis Resources'];

export function Footer() {
  return (
    <View className="flex-row flex-wrap items-center justify-between border-t border-stone-300 pt-6">
      <View className="flex-row items-center gap-2.5">
        <ArcRadiusLogo size={28} />
        <Text className="font-serif-bold text-xl leading-8 text-stone-800">Arc Radius</Text>
      </View>

      <Text className="font-sans text-xs leading-5 text-stone-500">
        UC Berkeley MIDS W210 Capstone
      </Text>

      <View className="flex-row items-start gap-4">
        {links.map((link) => (
          <Pressable key={link}>
            <Text className="font-sans text-xs leading-5 text-stone-500">{link}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
