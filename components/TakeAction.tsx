import { Pressable, Text, View, useWindowDimensions } from 'react-native';
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
function TimelineCard({
  action,
  isLast,
  onPress,
}: {
  action: (typeof ACTIONS)[number];
  isLast: boolean;
  onPress?: () => void;
}) {
  return (
    <View className={`flex-row ${isLast ? '' : 'mb-3'}`}>
      {/* Dot */}
      <View className="mr-3.5 w-[9px] items-center pt-[15px]">
        <View
          className="h-[9px] w-[9px] rounded-full"
          style={{ backgroundColor: action.dotColor }}
        />
        {!isLast && (
          <View
            className="mt-1 w-[1.5px] flex-1 rounded-full"
            style={{ backgroundColor: action.dotColor, opacity: 0.4 }}
          />
        )}
      </View>

      {/* Card */}
      <Pressable
        onPress={onPress}
        className="flex-1 flex-row items-start justify-between rounded-xl border border-stone-200 p-3.5 active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel={action.title}>
        <View className="flex-1">
          <View className="mb-1.5 flex-row items-center gap-2">
            <ActionIcon type={action.icon} />
            <Text className="font-sans-semibold text-sm text-stone-800">{action.title}</Text>
          </View>
          <Text className="font-sans text-xs leading-[18px] text-stone-400">
            {action.description}
          </Text>
        </View>
        <Text className="ml-2 mt-1 text-stone-300">›</Text>
      </Pressable>
    </View>
  );
}

// ── Desktop: horizontal card ─────────────────────
function HorizontalCard({
  action,
  onPress,
}: {
  action: (typeof ACTIONS)[number];
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="relative flex-1 rounded-xl border border-stone-200 p-4 active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={action.title}>
      {/* Dot peeks above card */}
      <View
        className="absolute -top-[5px] left-5 h-[9px] w-[9px] rounded-full"
        style={{ backgroundColor: action.dotColor }}
      />

      <View className="mb-2 flex-row items-center gap-2">
        <ActionIcon type={action.icon} />
        <Text className="font-sans-semibold text-sm text-stone-800">{action.title}</Text>
      </View>

      <Text className="mb-2.5 font-sans text-xs leading-[18px] text-stone-400">
        {action.description}
      </Text>

      <Text className="font-sans-semibold text-xs" style={{ color: '#1e40af' }}>
        {action.cta}
      </Text>
    </Pressable>
  );
}

// ── Crisis callout ───────────────────────────────
function CrisisCallout({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-xl bg-stone-100 p-3.5 active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel="Crisis resources — need immediate support?">
      <View>
        <Text className="font-sans text-xs text-stone-500">Need immediate support?</Text>
        <View className="mt-1 flex-row items-center gap-1.5">
          <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#f97316' }} />
          <Text className="font-sans-semibold text-[13px]" style={{ color: '#9a3412' }}>
            Crisis resources
          </Text>
        </View>
      </View>
      <Text style={{ color: '#9a3412' }}>›</Text>
    </Pressable>
  );
}

// ── Main component ───────────────────────────────
interface TakeActionProps {
  onContactReps?: () => void;
  onFindLegalAid?: () => void;
  onJoinCampaign?: () => void;
  onCrisisResources?: () => void;
}

export function TakeAction({
  onContactReps,
  onFindLegalAid,
  onJoinCampaign,
  onCrisisResources,
}: TakeActionProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  const handlers: Record<string, (() => void) | undefined> = {
    contact: onContactReps,
    legal: onFindLegalAid,
    campaign: onJoinCampaign,
  };

  return (
    <View>
      {/* Header */}
      <View className="mb-5">
        <Text className="font-serif-bold text-lg text-stone-800">Make your voice heard</Text>
        <Text className="mt-1 font-sans text-xs text-stone-400">Three ways to create change</Text>
      </View>

      {/* Action cards */}
      {isCompact ? (
        <View className="mb-5">
          {ACTIONS.map((action, i) => (
            <TimelineCard
              key={action.key}
              action={action}
              isLast={i === ACTIONS.length - 1}
              onPress={handlers[action.key]}
            />
          ))}
        </View>
      ) : (
        <View className="mb-5 flex-row gap-3">
          {ACTIONS.map((action) => (
            <HorizontalCard key={action.key} action={action} onPress={handlers[action.key]} />
          ))}
        </View>
      )}

      {/* Crisis callout */}
      <CrisisCallout onPress={onCrisisResources} />
    </View>
  );
}
