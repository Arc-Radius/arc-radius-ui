import type { ReactNode } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

import ArcRadiusLogo from './ui/ArcRadiusLogo';

interface HeaderProps {
  /** When set (e.g. web AppTabs), replaces default desktop nav buttons */
  rightContent?: ReactNode;
  onCrisisHelp?: () => void;
  onBills?: () => void;
  onResources?: () => void;
}

export function Header({ rightContent, onCrisisHelp, onBills, onResources }: HeaderProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  return (
    <View
      className="flex-row items-center justify-between border border-zinc-700/60 px-4 py-3 shadow-sm sm:px-6 md:px-8"
      style={{ backgroundColor: '#18181b' }}>
      {/* Logo */}
      <View className="flex-row items-center gap-2">
        <ArcRadiusLogo size={40} />
        <Text className="font-sans-bold text-[18px]" style={{ color: '#60a5fa' }}>
          Arc Radius
        </Text>
      </View>

      {/* Right side */}
      {isCompact ? (
        /* Mobile: crisis pill — glass style like BottomNav */
        <Pressable
          onPress={onCrisisHelp}
          className="rounded-lg px-3 py-1.5"
          style={{
            backgroundColor: 'rgba(249,115,22,0.1)',
            borderWidth: 0.5,
            borderColor: 'rgba(249,115,22,0.25)',
          }}
          accessibilityRole="button"
          accessibilityLabel="Crisis help">
          <Text className="font-sans-semibold text-[11px]" style={{ color: '#fdba74' }}>
            Crisis help
          </Text>
        </Pressable>
      ) : rightContent ? (
        <View className="min-w-0 flex-1 flex-row items-center justify-end">{rightContent}</View>
      ) : (
        /* Desktop: full nav links + crisis */
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={onBills}
            className="rounded-lg px-3.5 py-2 active:opacity-70"
            accessibilityRole="button">
            <Text className="font-sans text-sm" style={{ color: '#a1a1aa' }}>
              Bills
            </Text>
          </Pressable>
          <Pressable
            onPress={onResources}
            className="rounded-lg px-3.5 py-2 active:opacity-70"
            accessibilityRole="button">
            <Text className="font-sans text-sm" style={{ color: '#a1a1aa' }}>
              Resources
            </Text>
          </Pressable>
          <Pressable
            onPress={onCrisisHelp}
            className="ml-1 rounded-lg px-3.5 py-2"
            style={{
              backgroundColor: 'rgba(249,115,22,0.1)',
              borderWidth: 0.5,
              borderColor: 'rgba(249,115,22,0.25)',
            }}
            accessibilityRole="button"
            accessibilityLabel="Crisis help">
            <Text className="font-sans-semibold text-[12px]" style={{ color: '#fdba74' }}>
              Crisis help
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
