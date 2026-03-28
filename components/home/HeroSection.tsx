import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View, useWindowDimensions } from 'react-native';

function AnimatedArrowDown() {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      { resetBeforeIteration: false }
    );
    anim.start();
    return () => anim.stop();
  }, [bounce]);

  const translateY = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  return (
    <Animated.View style={{ marginLeft: 6, transform: [{ translateY }] }}>
      <Text className="text-sm text-zinc-50">↓</Text>
    </Animated.View>
  );
}

export interface HeroStatusCounts {
  supportive: number;
  mixed: number;
  harmful: number;
}

interface HeroSectionProps {
  onFindState?: () => void;
  /** Aggregated from GET /states; omit or null while loading / error. */
  statusCounts?: HeroStatusCounts | null;
  heroStatsLoading?: boolean;
}

export function HeroSection({ onFindState, statusCounts, heroStatsLoading }: HeroSectionProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  return (
    <View className={isCompact ? 'px-4 pb-6 pt-8' : 'px-2 pb-8 pt-12'}>
      {/* Kicker */}
      <Text className="mb-5 font-sans-semibold text-[11px] uppercase tracking-[2.5px] text-zinc-500">
        LGBTQ+ POLICY NAVIGATOR
      </Text>

      {/* Headline */}
      <Text
        className={[
          'font-sans-bold text-zinc-800',
          isCompact ? 'text-[32px] leading-[38px]' : 'text-[42px] leading-[47px]',
        ].join(' ')}>
        {'Know your rights.\nSee where you stand.'}
      </Text>

      {/* Subtitle */}
      <Text
        className={[
          'font-sans text-zinc-500',
          isCompact
            ? 'mt-4 max-w-[300px] text-[13px] leading-[21px]'
            : 'mt-3 max-w-[420px] text-sm leading-[23px]',
        ].join(' ')}>
        Understand the legal climate in your state — and what you can do about it.
      </Text>

      {/* CTA + Stats row */}
      <View className={isCompact ? 'mt-6 gap-4' : 'mt-8 flex-row items-center gap-4'}>
        {/* CTA button */}
        <Pressable
          onPress={onFindState}
          className="flex-row items-center self-start rounded-full bg-zinc-800 px-7 py-3.5 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Find your state">
          <Text className="font-sans-semibold text-sm text-zinc-50">Find your state</Text>
          <AnimatedArrowDown />
        </Pressable>

        {/* Climate stats — Hero preview palette: #93c5fd, #a1a1aa, #fdba74 (harmful shown as "high risk") */}
        <View className="flex-row items-center self-start overflow-hidden rounded-xl border border-zinc-200/80 bg-white/90">
          <StatPill
            fill="#93c5fd"
            count={pillCount(statusCounts?.supportive, heroStatsLoading)}
            label="supportive"
            textColor="#1e40af"
          />
          <View className="h-5 w-px bg-zinc-300" />
          <StatPill
            fill="#a1a1aa"
            count={pillCount(statusCounts?.mixed, heroStatsLoading)}
            label="mixed"
            textColor="#52525b"
          />
          <View className="h-5 w-px bg-zinc-300" />
          <StatPill
            fill="#fdba74"
            count={pillCount(statusCounts?.harmful, heroStatsLoading)}
            label="high risk"
            textColor="#9a3412"
          />
        </View>
      </View>
    </View>
  );
}

function pillCount(value: number | undefined, loading: boolean | undefined): string {
  if (loading || value === undefined) return '—';
  return String(value);
}

/** Single stat pill — Hero dots: #93c5fd, #a1a1aa, #fdba74 */
function StatPill({
  fill,
  count,
  label,
  textColor,
}: {
  fill: string;
  count: string;
  label: string;
  textColor: string;
}) {
  return (
    <View className="flex-row items-center gap-1.5 px-3 py-2.5">
      <View className="h-[7px] w-[7px] rounded-sm" style={{ backgroundColor: fill }} />
      <Text className="font-sans-semibold text-[13px]" style={{ color: textColor }}>
        {count}
      </Text>
      <Text className="font-sans text-xs text-zinc-500">{label}</Text>
    </View>
  );
}
