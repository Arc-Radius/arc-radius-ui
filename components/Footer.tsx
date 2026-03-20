import { Pressable, Text, View } from 'react-native';

import ArcRadiusLogo from './ui/ArcRadiusLogo';

const links = ['Privacy', 'Terms', 'Contact', 'Crisis Resources'];

export function Footer() {
  return (
    <View className="flex-col gap-3 border-t border-zinc-300 pt-6 md:flex-row md:flex-wrap md:items-center md:justify-between">
      <View className="flex-row items-center gap-2.5">
        <ArcRadiusLogo size={28} />
        <Text className="font-serif-bold text-xl leading-8 text-zinc-800">Arc Radius</Text>
      </View>

      <Text className="font-sans text-xs leading-5 text-zinc-500">
        UC Berkeley MIDS W210 Capzinc
      </Text>

      <View className="flex-row flex-wrap items-start gap-4">
        {links.map((link) => (
          <Pressable key={link}>
            <Text className="font-sans text-xs leading-5 text-zinc-500">{link}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
