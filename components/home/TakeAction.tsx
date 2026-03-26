import { useRef, useEffect } from 'react';
import { Animated, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg';

// ── Action data ──────────────────────────────────
const ACTIONS = [
  {
    key: 'contact',
    title: 'Contact your reps',
    description: 'Send a message to your elected officials about bills that matter to you.',
    cta: 'Get started →',
    dotColor: '#3b82f6',
    icon: 'contact',
  },
  {
    key: 'legal',
    title: 'Find legal aid',
    description: 'Connect with LGBTQ+-affirming legal services and know your options.',
    cta: 'Find help →',
    dotColor: '#60a5fa',
    icon: 'legal',
  },
  {
    key: 'campaign',
    title: 'Join a campaign',
    description: 'Organize with your community and amplify your impact together.',
    cta: 'Get involved →',
    dotColor: '#93c5fd',
    icon: 'campaign',
  },
] as const;

// ── Icons ────────────────────────────────────────
function ActionIcon({ type }: { type: string }) {
  const size = 18;
  switch (type) {
    case 'contact':
      return (
        <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
          <Path d="M2 14V16H4L13 7L11 5L2 14Z" fill="#eff6ff" stroke="#3b82f6" strokeWidth={0.8} />
          <Line
            x1={14.5}
            y1={3.5}
            x2={16.5}
            y2={5.5}
            stroke="#3b82f6"
            strokeWidth={0.8}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'legal':
      return (
        <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
          <Rect
            x={3}
            y={2}
            width={12}
            height={14}
            rx={2}
            fill="#eff6ff"
            stroke="#3b82f6"
            strokeWidth={0.8}
          />
          <Line
            x1={6}
            y1={6}
            x2={12}
            y2={6}
            stroke="#3b82f6"
            strokeWidth={0.8}
            strokeLinecap="round"
          />
          <Line
            x1={6}
            y1={9}
            x2={10}
            y2={9}
            stroke="#3b82f6"
            strokeWidth={0.8}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'campaign':
      return (
        <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
          <Circle cx={6} cy={7} r={3} fill="#eff6ff" stroke="#3b82f6" strokeWidth={0.8} />
          <Circle cx={12} cy={7} r={3} fill="#eff6ff" stroke="#3b82f6" strokeWidth={0.8} />
          <Circle cx={9} cy={13} r={3} fill="#eff6ff" stroke="#3b82f6" strokeWidth={0.8} />
        </Svg>
      );
    default:
      return null;
  }
}

// ── Mobile: vertical timeline card ───────────────
function TimelineCard({ action, isLast }: { action: (typeof ACTIONS)[number]; isLast: boolean }) {
  return (
    <View className={`flex-row ${isLast ? '' : 'mb-3'}`}>
      {/* Dot + line */}
      <View className="mr-3.5 w-[9px] items-center pt-1.5">
        <View
          className="h-[9px] w-[9px] rounded-full"
          style={{ backgroundColor: action.dotColor }}
        />
        <View
          className="mt-1 w-[1.5px] flex-1 rounded-full"
          style={{ backgroundColor: action.dotColor, opacity: 0.4 }}
        />
      </View>

      {/* Card */}
      <View
        className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5"
        accessibilityLabel={action.title}>
        <View className="mb-1.5 flex-row items-center gap-2">
          <ActionIcon type={action.icon} />
          <Text className="font-sans-semibold text-sm text-zinc-800">{action.title}</Text>
        </View>
        <Text className="font-sans text-xs leading-[18px] text-zinc-600">{action.description}</Text>
      </View>
    </View>
  );
}

// ── Desktop: horizontal card ─────────────────────
function HorizontalCard({ action }: { action: (typeof ACTIONS)[number] }) {
  return (
    <View
      className="relative flex-1 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
      accessibilityLabel={action.title}>
      {/* Dot peeks above card */}
      <View
        className="absolute -top-[5px] left-5 h-[9px] w-[9px] rounded-full"
        style={{ backgroundColor: action.dotColor }}
      />

      <View className="mb-2 flex-row items-center gap-2">
        <ActionIcon type={action.icon} />
        <Text className="font-sans-semibold text-sm text-zinc-800">{action.title}</Text>
      </View>

      <Text className="font-sans text-xs leading-[18px] text-zinc-600">{action.description}</Text>
    </View>
  );
}

// ── Crisis callout ───────────────────────────────
function CrisisCallout({ onPress }: { onPress?: () => void }) {
  const nudge = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(nudge, { toValue: 4, duration: 600, useNativeDriver: true }),
        Animated.timing(nudge, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [nudge]);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-xl border border-orange-200/50 bg-orange-50 p-3.5 active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel="Crisis resources — need immediate support?">
      <View>
        <Text className="font-sans text-xs text-zinc-500">Need immediate support?</Text>
        <View className="mt-1 flex-row items-center gap-1.5">
          <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#fdba74' }} />
          <Text className="font-sans-semibold text-[13px]" style={{ color: '#9a3412' }}>
            Crisis resources
          </Text>
        </View>
      </View>
      <Animated.View style={{ transform: [{ translateX: nudge }] }}>
        <ChevronRight size={16} color="#9a3412" />
      </Animated.View>
    </Pressable>
  );
}

// ── Main component ───────────────────────────────
interface TakeActionProps {
  onCrisisResources?: () => void;
}

export function TakeAction({ onCrisisResources }: TakeActionProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  return (
    <View>
      {/* Header */}
      <View className="mb-5">
        <Text className="font-sans-bold text-lg text-zinc-800">Make your voice heard</Text>
        <Text className="mt-1 font-sans text-xs text-zinc-500">Three ways to create change</Text>
      </View>

      {/* Action cards */}
      {isCompact ? (
        <View className="mb-5">
          {ACTIONS.map((action, i) => (
            <TimelineCard key={action.key} action={action} isLast={i === ACTIONS.length - 1} />
          ))}
        </View>
      ) : (
        <View className="mb-5 flex-row gap-3">
          {ACTIONS.map((action) => (
            <HorizontalCard key={action.key} action={action} />
          ))}
        </View>
      )}

      {/* Crisis callout */}
      <CrisisCallout onPress={onCrisisResources} />
    </View>
  );
}
