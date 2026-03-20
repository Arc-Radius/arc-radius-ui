import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from './ui/Button';
import ArcRadiusLogo from './ui/ArcRadiusLogo';

interface HeaderProps {
  rightContent?: ReactNode;
}

export function Header({ rightContent }: HeaderProps) {
  return (
    <View className="flex-col gap-3 border-b border-zinc-300 py-4 md:flex-row md:items-center md:justify-between md:py-5">
      <View className="flex-row items-center gap-2.5">
        <ArcRadiusLogo size={36} />
        <Text className="font-serif-bold text-xl leading-8 text-zinc-800">Arc Radius</Text>
      </View>

      {rightContent ? (
        <View className="flex-row flex-wrap items-center gap-1.5 md:flex-nowrap">{rightContent}</View>
      ) : (
        <View className="flex-row flex-wrap items-center gap-1.5 md:flex-nowrap">
          <Pressable className="rounded-lg px-3.5 py-2.5">
            <Text className="font-sans-medium text-sm text-zinc-500">Resources</Text>
          </Pressable>
          <Pressable className="rounded-lg px-3.5 py-2.5">
            <Text className="font-sans-medium text-sm text-zinc-500">About</Text>
          </Pressable>
          <Button label="Crisis Help" />
        </View>
      )}
    </View>
  );
}
