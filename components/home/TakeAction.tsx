import { useRef, useEffect } from 'react';
import { Animated, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg';

// ── Action data ──────────────────────────────────
const ACTIONS = [
  {
    key: 'contact',
    title: 'Contact your reps',
    description: 'Find your elected officials in your zipcode and send them a message about bills that matter to you.',
    status: 'In Development',
    dotColor: '#3b82f6',
    icon: 'contact',
    dimmed: false,
  },
  {
    key: 'campaign',
    title: 'Join a campaign',
    description: 'Browse LGBTQ+ advocacy organizations and find verified resources in your community.',
    status: 'Coming Soon',
    dotColor: '#a1a1aa',
    icon: 'campaign',
    dimmed: true,
  },
] as const;

const ROADMAP = [
  {
    key: 'ask',
    title: 'Ask anything',
    description: 'Query bills, compare states and years with natural language.',
    status: 'Live — In Testing',
    dotColor: '#3b82f6',
    icon: 'contact',
    dimmed: false,
  },
  {
    key: 'accessibility',
    title: 'Accessibility & explainability',
    description: 'Improving readability of summaries and transparency of classification and graph-based reasoning.',
    status: 'Planned',
    dotColor: '#a1a1aa',
    icon: 'legal',
    dimmed: true,
  },
  {
    key: 'explore',
    title: 'Policy insight capabilities',
    description: 'Dive into legislative trends, diffusion patterns, visualizations, and insights — all driven by our knowledge graph.',
    status: 'Planned',
    dotColor: '#a1a1aa',
    icon: 'campaign',
    dimmed: true,
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

// ── Shared card type ────────────────────────────
type CardAction = {
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly dotColor: string;
  readonly icon: string;
  readonly dimmed: boolean;
};

// ── Mobile: vertical timeline card ───────────────
function TimelineCard({ action, isLast, index }: { action: CardAction; isLast: boolean; index: number }) {
  return (
    <View className={`flex-row ${isLast ? '' : 'mb-3'}`} style={action.dimmed ? { opacity: 0.5 } : undefined}>
      {/* Number + line */}
      <View className="mr-3 w-[20px] items-center pt-1">
        <View
          className="h-[20px] w-[20px] items-center justify-center rounded-full"
          style={{ backgroundColor: action.dotColor }}>
          <Text className="font-sans-semibold text-[10px] text-white">{index + 1}</Text>
        </View>
        {!isLast && (
          <View
            className="mt-1 w-[1.5px] flex-1 rounded-full"
            style={{ backgroundColor: action.dotColor, opacity: 0.4 }}
          />
        )}
      </View>

      {/* Card */}
      <View
        className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5"
        accessibilityLabel={action.title}>
        <View className="mb-1.5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <ActionIcon type={action.icon} />
            <Text className="font-sans-semibold text-sm text-zinc-800">{action.title}</Text>
          </View>
          <View
            className="rounded-full px-2 py-0.5"
            style={{ backgroundColor: action.dimmed ? 'rgba(161,161,170,0.15)' : 'rgba(59,130,246,0.1)' }}>
            <Text
              className="font-sans-medium text-[9px]"
              style={{ color: action.dimmed ? '#a1a1aa' : '#3b82f6' }}>
              {action.status}
            </Text>
          </View>
        </View>
        <Text className="font-sans text-xs leading-[18px] text-zinc-600">{action.description}</Text>
      </View>
    </View>
  );
}

// ── Desktop: horizontal card ─────────────────────
function HorizontalCard({ action, index }: { action: CardAction; index: number }) {
  return (
    <View
      className="relative flex-1 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
      style={action.dimmed ? { opacity: 0.5 } : undefined}
      accessibilityLabel={action.title}>
      {/* Number peeks above card */}
      <View
        className="absolute -top-[10px] left-5 h-[20px] w-[20px] items-center justify-center rounded-full"
        style={{ backgroundColor: action.dotColor }}>
        <Text className="font-sans-semibold text-[10px] text-white">{index + 1}</Text>
      </View>

      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <ActionIcon type={action.icon} />
          <Text className="font-sans-semibold text-sm text-zinc-800">{action.title}</Text>
        </View>
        <View
          className="rounded-full px-2 py-0.5"
          style={{ backgroundColor: action.dimmed ? 'rgba(161,161,170,0.15)' : 'rgba(59,130,246,0.1)' }}>
          <Text
            className="font-sans-medium text-[9px]"
            style={{ color: action.dimmed ? '#a1a1aa' : '#3b82f6' }}>
            {action.status}
          </Text>
        </View>
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
        <Text className="mt-1 font-sans text-xs text-zinc-500">
          <Text className="font-sans-semibold">Coming to Arc Radius</Text>
          {' — new ways to take action'}
        </Text>
      </View>

      {/* Action cards */}
      {isCompact ? (
        <View className="mb-5">
          {ACTIONS.map((action, i) => (
            <TimelineCard
              key={action.key}
              action={action}
              isLast={i === ACTIONS.length - 1}
              index={i}
            />
          ))}
        </View>
      ) : (
        <View className="mb-5 flex-row gap-3">
          {ACTIONS.map((action, i) => (
            <HorizontalCard key={action.key} action={action} index={i} />
          ))}
        </View>
      )}

      {/* GraphRAG roadmap */}
      <View className="mb-5">
        <View className="mb-5">
          <Text className="font-sans-bold text-lg text-zinc-800">
            Powered by our Knowledge Graph
          </Text>
          <Text className="mt-1 font-sans text-xs text-zinc-500">
            <Text className="font-sans-semibold">Our catalyst GraphRAG engine</Text>
            {' — and what it powers next'}
          </Text>
        </View>
        {isCompact ? (
          <View>
            {ROADMAP.map((item, i) => (
              <TimelineCard
                key={item.key}
                action={item}
                isLast={i === ROADMAP.length - 1}
                index={i}
              />
            ))}
          </View>
        ) : (
          <View className="flex-row gap-3">
            {ROADMAP.map((item, i) => (
              <HorizontalCard key={item.key} action={item} index={i} />
            ))}
          </View>
        )}
      </View>

      {/* Crisis callout */}
      <CrisisCallout onPress={onCrisisResources} />
    </View>
  );
}
