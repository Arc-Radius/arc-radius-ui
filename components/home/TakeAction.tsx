import { useRef, useEffect } from 'react';
import { Animated, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { ChevronRight, FileText, Megaphone } from 'lucide-react-native';
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg';

// ── Status color system ──────────────────────────
// Live (exact) → blue | Planned/Coming Soon → grey/dimmed | everything else → orange
const TONE = {
  live:    { dot: '#3b82f6', badgeBg: 'rgba(59,130,246,0.1)',   badgeText: '#3b82f6', iconStroke: '#3b82f6', iconFill: '#eff6ff', dimmed: false },
  active:  { dot: '#f59e0b', badgeBg: 'rgba(245,158,11,0.12)',  badgeText: '#b45309', iconStroke: '#f59e0b', iconFill: '#fffbeb', dimmed: false },
  planned: { dot: '#a1a1aa', badgeBg: 'rgba(161,161,170,0.15)', badgeText: '#a1a1aa', iconStroke: '#a1a1aa', iconFill: '#f4f4f5', dimmed: true  },
} as const;

function getTone(status: string) {
  const s = status.toLowerCase();
  if (s === 'live') return TONE.live;
  if (s.includes('planned') || s.includes('coming soon')) return TONE.planned;
  return TONE.active; // in dev, in testing, in progress, etc.
}

// ── Action data ──────────────────────────────────
const ACTIONS = [
  {
    key: 'contact',
    title: 'Contact your reps',
    description:
      'Find your elected officials in your zipcode and send them a message about bills that matter to you.',
    status: 'Live',
    icon: 'contact',
  },
  {
    key: 'campaign',
    title: 'Join a campaign',
    description:
      'Browse LGBTQ+ advocacy organizations and find verified resources in your community.',
    status: 'Coming Soon',
    icon: 'campaign',
  },
] as const;

const ROADMAP = [
  {
    key: 'ask',
    title: 'Grounded Ask',
    description:
      'Use natural language to query bills, compare state policies over time, and uncover macro trends, not just single-bill summaries.',
    status: 'Live — In Testing',
    icon: 'contact',
  },
  {
    key: 'explainability',
    title: 'Data explainability',
    description:
      'Improving readability of summaries and transparency of classification and graph-based reasoning.',
    status: 'In Progress',
    icon: 'legal',
  },
  {
    key: 'explore',
    title: 'Interactive graph explorer',
    description:
      'Freely explore legislative trends, diffusion patterns, visual insights beyond guided flows — all driven by our knowledge graph.',
    status: 'Planned',
    icon: 'campaign',
  },
] as const;

// ── Icons ────────────────────────────────────────
function ActionIcon({ type, stroke = '#3b82f6', fill = '#eff6ff' }: { type: string; stroke?: string; fill?: string }) {
  const size = 18;
  switch (type) {
    case 'contact':
      return (
        <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
          <Path d="M2 14V16H4L13 7L11 5L2 14Z" fill={fill} stroke={stroke} strokeWidth={0.8} />
          <Line x1={14.5} y1={3.5} x2={16.5} y2={5.5} stroke={stroke} strokeWidth={0.8} strokeLinecap="round" />
        </Svg>
      );
    case 'legal':
      return (
        <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
          <Rect x={3} y={2} width={12} height={14} rx={2} fill={fill} stroke={stroke} strokeWidth={0.8} />
          <Line x1={6} y1={6} x2={12} y2={6} stroke={stroke} strokeWidth={0.8} strokeLinecap="round" />
          <Line x1={6} y1={9} x2={10} y2={9} stroke={stroke} strokeWidth={0.8} strokeLinecap="round" />
        </Svg>
      );
    case 'campaign':
      return (
        <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
          <Circle cx={6} cy={7} r={3} fill={fill} stroke={stroke} strokeWidth={0.8} />
          <Circle cx={12} cy={7} r={3} fill={fill} stroke={stroke} strokeWidth={0.8} />
          <Circle cx={9} cy={13} r={3} fill={fill} stroke={stroke} strokeWidth={0.8} />
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
  readonly icon: string;
};

// ── Mobile: vertical timeline card ───────────────
function TimelineCard({ action, isLast, index }: { action: CardAction; isLast: boolean; index: number }) {
  const tone = getTone(action.status);
  return (
    <View className={`flex-row ${isLast ? '' : 'mb-3'}`} style={tone.dimmed ? { opacity: 0.5 } : undefined}>
      {/* Number + line */}
      <View className="mr-3 items-center pt-1" style={{ width: 20 }}>
        <View
          className="items-center justify-center"
          style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: tone.dot }}>
          <Text className="font-sans-semibold text-[10px] text-white">{index + 1}</Text>
        </View>
        {!isLast && (
          <View
            className="mt-1 flex-1"
            style={{ width: 1.5, borderRadius: 1, backgroundColor: tone.dot, opacity: 0.4 }}
          />
        )}
      </View>

      {/* Card */}
      <View
        className="min-w-0 flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-3.5"
        accessibilityLabel={action.title}>
        <View className="mb-1.5 flex-row items-center justify-between gap-2">
          <View className="min-w-0 shrink flex-row items-center gap-2">
            <ActionIcon type={action.icon} stroke={tone.iconStroke} fill={tone.iconFill} />
            <Text numberOfLines={1} className="shrink font-sans-semibold text-sm text-zinc-800">{action.title}</Text>
          </View>
          <View
            style={{ backgroundColor: tone.badgeBg, borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text
              numberOfLines={1}
              className="font-sans-medium text-[9px]"
              style={{ color: tone.badgeText }}>
              {action.status}
            </Text>
          </View>
        </View>
        <Text className="font-sans text-xs leading-[18px] text-zinc-600">{action.description}</Text>
        {action.key === 'contact' && (
          <View className="mt-2 flex-row items-center gap-1.5">
            <FileText size={10} color="#a1a1aa" />
            <Text className="font-sans text-[10px] text-zinc-400">Bill Details</Text>
            <ChevronRight size={8} color="#d4d4d8" />
            <Megaphone size={10} color="#a1a1aa" />
            <Text className="font-sans text-[10px] text-zinc-400">Take Action</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Desktop: horizontal card ─────────────────────
function HorizontalCard({ action, index }: { action: CardAction; index: number }) {
  const tone = getTone(action.status);
  return (
    <View
      className="relative min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
      style={tone.dimmed ? { opacity: 0.5 } : undefined}
      accessibilityLabel={action.title}>
      {/* Number peeks above card */}
      <View
        className="absolute items-center justify-center"
        style={{ top: -10, left: 20, width: 20, height: 20, borderRadius: 10, backgroundColor: tone.dot, zIndex: 1 }}>
        <Text className="font-sans-semibold text-[10px] text-white">{index + 1}</Text>
      </View>

      <View className="mb-2 flex-row items-center justify-between gap-2">
        <View className="min-w-0 shrink flex-row items-center gap-2">
          <ActionIcon type={action.icon} stroke={tone.iconStroke} fill={tone.iconFill} />
          <Text numberOfLines={1} className="shrink font-sans-semibold text-sm text-zinc-800">{action.title}</Text>
        </View>
        <View
          style={{ backgroundColor: tone.badgeBg, borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text
            numberOfLines={1}
            className="font-sans-medium text-[9px]"
            style={{ color: tone.badgeText }}>
            {action.status}
          </Text>
        </View>
      </View>

      <Text className="font-sans text-xs leading-[18px] text-zinc-600">{action.description}</Text>
      {action.key === 'contact' && (
        <View className="mt-2 flex-row items-center gap-1.5">
          <FileText size={10} color="#a1a1aa" />
          <Text className="font-sans text-[10px] text-zinc-400">Bill Details</Text>
          <ChevronRight size={8} color="#d4d4d8" />
          <Megaphone size={10} color="#a1a1aa" />
          <Text className="font-sans text-[10px] text-zinc-400">Take Action</Text>
        </View>
      )}
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
