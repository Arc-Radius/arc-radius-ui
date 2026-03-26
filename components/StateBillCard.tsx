import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from 'react-native';

import { FileText } from 'lucide-react-native';

import type { Bill } from '../static/billConstants';
import { STANCE_DOT, STANCE_HEADER_GLASS } from '../static/billConstants';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Date helpers (embedded) ──────────────────────

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return 'today';
  if (days === 1) return '1d';
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  return `${Math.floor(days / 30)}mo`;
}

// ── Component ────────────────────────────────────

interface StateBillCardProps {
  bill: Bill;
  onPress?: (billId: string) => void;
}

export function StateBillCard({ bill, onPress }: StateBillCardProps) {
  const [expanded, setExpanded] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;

  const goToDetail = useCallback(() => {
    onPress?.(bill.id);
  }, [bill.id, onPress]);

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = !expanded;
    setExpanded(next);
    Animated.timing(rotation, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [expanded, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const pressStyle = ({ pressed }: { pressed: boolean }) => ({
    opacity: pressed ? 0.92 : 1,
  });

  const headerGlass = STANCE_HEADER_GLASS[bill.stance];

  return (
    <View
      className="overflow-hidden rounded-xl border bg-white"
      style={{ borderColor: headerGlass.border }}>
      <View
        className="px-3.5 pt-3.5"
        style={{
          backgroundColor: headerGlass.bg,
          borderBottomWidth: 0.5,
          borderBottomColor: headerGlass.border,
        }}>
        {/* Row 1 — tap opens detail */}
        <Pressable
          onPress={goToDetail}
          style={pressStyle}
          accessibilityRole="button"
          accessibilityLabel={`Open bill: ${bill.title}`}>
          <View className="mb-2 flex-row items-center gap-2">
            <Text className="font-mono text-[11px] text-zinc-400">{bill.bill_number}</Text>
            <Text className="text-[10px] text-zinc-400">{bill.year}</Text>
            <View className="flex-1" />
            <View
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: STANCE_DOT[bill.stance] }}
            />
          </View>
        </Pressable>

        {/* Row 2: icon + title (open detail) | chevron (preview only) */}
        <View className="flex-row items-center gap-2.5 pb-3">
          <Pressable
            onPress={goToDetail}
            className="min-w-0 flex-1 flex-row items-center gap-2.5 active:opacity-90"
            accessibilityRole="button"
            accessibilityLabel={`Open bill: ${bill.title}`}>
            <FileText size={20} color="#71717a" strokeWidth={2} accessibilityElementsHidden />
            <Text className="min-w-0 flex-1 font-sans-semibold text-[15px] leading-5 text-zinc-900">
              {bill.title}
            </Text>
          </Pressable>
          <Pressable
            onPress={toggleExpand}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={
              expanded ? 'Hide inline preview' : 'Show inline preview on this card'
            }>
            <View className="flex-row items-center gap-1">
              <Text className="font-sans text-[10px] text-zinc-400">Preview</Text>
              <Animated.View style={{ transform: [{ rotate }] }}>
                <ChevronDown />
              </Animated.View>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Footer — tap opens detail */}
      <Pressable
        onPress={goToDetail}
        style={pressStyle}
        accessibilityRole="button"
        accessibilityLabel={`Open bill: ${bill.title}`}>
        <View className="px-3.5 py-2.5">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="font-sans text-[11px] text-zinc-500">{bill.status}</Text>
            <Dot />
            <Text className="font-sans text-[11px] text-zinc-500">
              {formatDate(bill.last_action_date)}
            </Text>
            <Dot />
            <Text className="font-sans text-[11px] text-zinc-500">
              {timeAgo(bill.last_action_date)}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Optional expanded preview — tap anywhere opens detail */}
      {expanded && (
        <Pressable
          onPress={goToDetail}
          style={pressStyle}
          accessibilityRole="button"
          accessibilityLabel={`Open bill: ${bill.title}`}>
          <View className="border-t border-zinc-100 px-3.5 py-3">
            <Text className="font-sans text-[13px] leading-5 text-zinc-800">
              {bill.description}
            </Text>
            <Text className="mt-2 font-sans text-xs text-zinc-500">
              {bill.primary_sponsor} · {bill.last_action}
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-1">
              {(bill.issue_categories ?? []).map((topic) => (
                <View key={topic} className="rounded-full bg-zinc-100 px-2 py-0.5">
                  <Text className="font-sans text-[11px] text-zinc-500">{topic}</Text>
                </View>
              ))}
            </View>
          </View>
        </Pressable>
      )}
    </View>
  );
}

function Dot() {
  return <View className="h-[3px] w-[3px] rounded-full bg-zinc-300" />;
}

function ChevronDown() {
  return (
    <View style={{ width: 14, height: 14 }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRightWidth: 1.3,
          borderBottomWidth: 1.3,
          borderColor: '#a1a1aa',
          transform: [{ rotate: '45deg' }],
          marginTop: 1,
          marginLeft: 3,
        }}
      />
    </View>
  );
}
