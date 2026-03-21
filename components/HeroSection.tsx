import { Pressable, Text, View, useWindowDimensions } from 'react-native';

interface HeroSectionProps {
  onFindState?: () => void;
}

export function HeroSection({ onFindState }: HeroSectionProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  return (
    <View className={isCompact ? 'px-4 pb-6 pt-8' : 'px-2 pb-8 pt-12'}>
      {/* Kicker */}
      <Text className="mb-5 font-sans-semibold text-[11px] uppercase tracking-[2.5px] text-zinc-400">
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
          'font-sans text-zinc-400',
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
          <Text className="ml-1.5 text-sm text-zinc-50">↓</Text>
        </Pressable>

        {/* Climate stats — Hero preview palette: #93c5fd, #a1a1aa, #fdba74 */}
        <View className="flex-row items-center self-start overflow-hidden rounded-xl border border-zinc-200/80 bg-white/90">
          <StatPill fill="#93c5fd" count={19} label="supportive" textColor="#1e40af" />
          <View className="h-5 w-px bg-zinc-300" />
          <StatPill fill="#a1a1aa" count={14} label="mixed" textColor="#52525b" />
          <View className="h-5 w-px bg-zinc-300" />
          <StatPill fill="#fdba74" count={17} label="high risk" textColor="#9a3412" />
        </View>
      </View>
    </View>
  );
}

/** Single stat pill — Hero dots: #93c5fd, #a1a1aa, #fdba74 */
function StatPill({
  fill,
  count,
  label,
  textColor,
}: {
  fill: string;
  count: number;
  label: string;
  textColor: string;
}) {
  return (
    <View className="flex-row items-center gap-1.5 px-3 py-2.5">
      <View className="h-[7px] w-[7px] rounded-sm" style={{ backgroundColor: fill }} />
      <Text className="font-sans-semibold text-[13px]" style={{ color: textColor }}>
        {count}
      </Text>
      <Text className="font-sans text-xs text-zinc-400">{label}</Text>
    </View>
  );
}
