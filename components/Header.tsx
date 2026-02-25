import { Pressable, Text, View } from 'react-native';

import { Button } from './ui/Button';
import ArcRadiusLogo from './ui/ArcRadiusLogo';

export function Header() {
  return (
    <View className="flex-row items-center justify-between border-b border-stone-300 py-5">
      <View className="flex-row items-center gap-2.5">
        <ArcRadiusLogo size={36} />
        <Text className="font-serif-bold text-xl leading-8 text-stone-800">Arc Radius</Text>
      </View>

      <View className="flex-row items-center gap-1.5">
        <Pressable className="rounded-lg px-3.5 py-2.5">
          <Text className="font-sans-medium text-sm text-stone-500">Resources</Text>
        </Pressable>
        <Pressable className="rounded-lg px-3.5 py-2.5">
          <Text className="font-sans-medium text-sm text-stone-500">About</Text>
        </Pressable>
        <Button label="Crisis Help" />
      </View>
    </View>
  );
}
