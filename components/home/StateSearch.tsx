import { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Line } from 'react-native-svg';

import { StateDropdown } from '@/components/shared/StateDropdown';
import { STATES, STATUS_STYLES, MAP_ROWS } from '@/static/states';
import type { LegislativeStatus, StateInfoWithCounts } from '@/static/states';

// ── Props ────────────────────────────────────────
interface StateSearchProps {
  selected: string | null;
  selectedInfo: StateInfoWithCounts | null;
  statesByAbbr: Record<string, { status: LegislativeStatus }> | null;
  statesLoading: boolean;
  statesError: boolean;
  onRetryStates: () => void;
  stateDropdownOptions?: { abbr: string; name: string }[];
  onStateSelect: (abbr: string) => void;
  onNavigateToState?: () => void;
  scrollViewRef?: React.RefObject<ScrollView | null>;
  containerY?: React.RefObject<number>;
}

// ── Glass styles ─────────────────────────────────
const GLASS_MAP = {
  backgroundColor: '#18181b',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',
} as const;

const GLASS_DETAIL = {
  backgroundColor: '#18181b',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',
} as const;

// ── Status colors (gradient glass) ───────────────
const STATUS_CELL: Record<
  LegislativeStatus,
  {
    gradientTop: string;
    gradientBottom: string;
    border: string;
    text: string;
    selectedBorder: string;
  }
> = {
  supportive: {
    gradientTop: 'rgba(29,78,216,0.35)',
    gradientBottom: 'rgba(29,78,216,0.1)',
    border: 'rgba(29,78,216,0.3)',
    text: '#93c5fd',
    selectedBorder: '#93c5fd',
  },
  mixed: {
    gradientTop: 'rgba(63,63,70,0.55)',
    gradientBottom: 'rgba(63,63,70,0.1)',
    border: 'rgba(63,63,70,0.5)',
    text: '#d4d4d8',
    selectedBorder: '#d4d4d8',
  },
  harmful: {
    gradientTop: 'rgba(194,65,12,0.35)',
    gradientBottom: 'rgba(194,65,12,0.1)',
    border: 'rgba(194,65,12,0.3)',
    text: '#fdba74',
    selectedBorder: '#fdba74',
  },
};

const CELL_LOADING = {
  gradientTop: 'rgba(82,82,91,0.2)',
  gradientBottom: 'rgba(82,82,91,0.05)',
  border: 'rgba(82,82,91,0.2)',
  text: '#71717a',
  selectedBorder: '#a1a1aa',
};

// Darker solid colors for legend dots
const LEGEND_COLORS: Record<LegislativeStatus, string> = {
  supportive: '#2563eb',
  mixed: '#71717a',
  harmful: '#c2410c',
};

// Raised card shadow for map cells
const raisedShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  android: { elevation: 4 },
  default: {},
});

// ── State cell ───────────────────────────────────
function StateCell({
  abbr,
  selected,
  onSelect,
  compact,
  status,
  loading,
  disabled,
}: {
  abbr: string;
  selected: string | null;
  onSelect: (abbr: string) => void;
  compact?: boolean;
  status: LegislativeStatus;
  loading: boolean;
  disabled: boolean;
}) {
  const info = STATES[abbr];
  if (!info) return <View className="w-full" style={{ aspectRatio: 1 }} />;

  const isSelected = selected === abbr;
  const cell = loading ? CELL_LOADING : STATUS_CELL[status];
  const fontSize = compact ? 9 : 15;

  return (
    <Pressable
      disabled={disabled}
      onPress={() => onSelect(abbr)}
      className="w-full overflow-hidden"
      style={[
        {
          aspectRatio: 1,
          borderWidth: isSelected ? 1.5 : 1,
          borderColor: isSelected ? cell.selectedBorder : cell.border,
          borderRadius: 6,
        },
        raisedShadow,
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${info.name}, ${STATUS_STYLES[status].label}`}
      accessibilityState={{ selected: isSelected }}
      accessibilityHint="Double tap to view policy details">
      <LinearGradient
        colors={[cell.gradientTop, cell.gradientBottom]}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text className="text-center font-sans-semibold" style={{ fontSize, color: cell.text }}>
          {abbr}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

// ── Icons ────────────────────────────────────────
function CheckIcon({ size = 14 }: { size?: number }) {
  const stroke = size >= 18 ? 1.35 : 1.2;
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle
        cx={9}
        cy={9}
        r={6}
        stroke="#4ade80"
        strokeWidth={stroke}
        fill="rgba(34,197,94,0.1)"
      />
      <Path
        d="M6.5 9.5L8 11L11.5 7"
        stroke="#4ade80"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ClockIcon({ size = 14 }: { size?: number }) {
  const stroke = size >= 18 ? 1.35 : 1.2;
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle
        cx={9}
        cy={9}
        r={6}
        stroke="#facc15"
        strokeWidth={stroke}
        fill="rgba(250,204,21,0.1)"
      />
      <Path d="M9 6.5V9.5L11 10.5" stroke="#facc15" strokeWidth={stroke} strokeLinecap="round" />
    </Svg>
  );
}

/** Subtle → nudge on the Explore CTA (matches hero arrow rhythm). */
function AnimatedExploreArrow({ fontSize, color }: { fontSize: number; color: string }) {
  const nudge = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(nudge, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(nudge, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [nudge]);

  const translateX = nudge.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 5],
  });

  return (
    <Animated.View style={{ marginLeft: 4, transform: [{ translateX }] }}>
      <Text style={{ fontSize, color }}>→</Text>
    </Animated.View>
  );
}

// ── State detail panel ───────────────────────────
function StateDetailPanel({
  info,
  onNavigate,
  onClose,
}: {
  info: StateInfoWithCounts;
  onNavigate?: () => void;
  onClose: () => void;
}) {
  const cell = STATUS_CELL[info.status];
  const webLarge = Platform.OS === 'web';
  const nameSize = webLarge ? 21 : undefined;
  const statusBadgeSize = webLarge ? 12 : 11;
  const statLabelSize = webLarge ? 15 : 13;
  const statValueSize = webLarge ? 17 : 15;
  const ctaSize = webLarge ? 15 : 13;
  const ctaArrowSize = webLarge ? 17 : 14;
  const iconSize = webLarge ? 20 : 14;

  return (
    <View className="overflow-hidden rounded-xl" style={GLASS_DETAIL}>
      <View className="p-4">
        {/* Header */}
        <View className="mb-3.5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <Text
              className="font-serif-bold text-lg"
              style={[{ color: '#fafafa' }, webLarge && { fontSize: nameSize }]}>
              {info.name}
            </Text>
            {/* Gradient status badge */}
            <LinearGradient
              colors={[cell.gradientTop, cell.gradientBottom]}
              style={{
                borderRadius: 99,
                paddingHorizontal: webLarge ? 12 : 10,
                paddingVertical: webLarge ? 4 : 2,
                borderWidth: 0.5,
                borderColor: cell.border,
              }}>
              <Text
                className="font-sans-semibold"
                style={{ fontSize: statusBadgeSize, color: cell.text }}>
                {STATUS_STYLES[info.status].label}
              </Text>
            </LinearGradient>
          </View>
          <Pressable
            onPress={onClose}
            className="h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            accessibilityRole="button"
            accessibilityLabel="Close state details">
            <Text className="font-sans text-xs" style={{ color: '#a1a1aa' }}>
              ✕
            </Text>
          </Pressable>
        </View>

        {/* Option C: horizontal stat pills */}
        <View className="mb-3 gap-1.5">
          {/* Passed bills */}
          <View
            className="flex-row items-center gap-2.5 rounded-[10px] px-3 py-2.5"
            style={{
              backgroundColor: 'rgba(161,161,170,0.1)',
              borderWidth: 1,
              borderColor: 'rgba(161,161,170,0.2)',
            }}>
            <CheckIcon size={iconSize} />
            <Text
              className="flex-1 font-sans"
              style={{ fontSize: statLabelSize, color: '#a1a1aa' }}>
              Passed bills
            </Text>
            <Text
              className="font-sans-semibold"
              style={{ fontSize: statValueSize, color: '#e4e4e7' }}>
              {info.counts.passedBills}
            </Text>
          </View>

          {/* Proposed bills (active) */}
          <View
            className="flex-row items-center gap-2.5 rounded-[10px] px-3 py-2.5"
            style={{
              backgroundColor: 'rgba(161,161,170,0.1)',
              borderWidth: 1,
              borderColor: 'rgba(161,161,170,0.2)',
            }}>
            <ClockIcon size={iconSize} />
            <Text
              className="flex-1 font-sans"
              style={{ fontSize: statLabelSize, color: '#a1a1aa' }}>
              Proposed bills
            </Text>
            <Text
              className="font-sans-semibold"
              style={{ fontSize: statValueSize, color: '#e4e4e7' }}>
              {info.counts.activeBills}
            </Text>
          </View>
        </View>

        {/* White CTA */}
        <Pressable
          onPress={onNavigate}
          className="flex-row items-center justify-center gap-1.5 rounded-[10px] bg-white py-3 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel={`Explore ${info.name}`}>
          <Text className="font-sans-semibold" style={{ fontSize: ctaSize, color: '#18181b' }}>
            Explore {info.name}
          </Text>
          <AnimatedExploreArrow fontSize={ctaArrowSize} color="#18181b" />
        </Pressable>
      </View>
    </View>
  );
}

// ── Hex map ──────────────────────────────────────
const GRID_COLS = Math.max(...MAP_ROWS.map((r: (string | null)[]) => r.length));

function resolveCellStatus(
  abbr: string,
  statesByAbbr: Record<string, { status: LegislativeStatus }> | null
): LegislativeStatus {
  const row = statesByAbbr?.[abbr];
  if (row) return row.status;
  return STATES[abbr]?.status ?? 'mixed';
}

function HexMap({
  selected,
  onStateSelect,
  isWebDesktop,
  statesByAbbr,
  statesLoading,
  mapDisabled,
}: {
  selected: string | null;
  onStateSelect: (abbr: string) => void;
  isWebDesktop?: boolean;
  statesByAbbr: Record<string, { status: LegislativeStatus }> | null;
  statesLoading: boolean;
  mapDisabled: boolean;
}) {
  const titleSize = isWebDesktop ? 16 : 12;
  const hintSize = isWebDesktop ? 14 : 11;
  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel="United States legislative climate map">
      <Text className="mb-3 font-sans-semibold" style={{ fontSize: titleSize, color: '#a1a1aa' }}>
        U.S. Legislative Climate Map
      </Text>
      <View className="flex-row gap-1">
        {Array.from({ length: GRID_COLS }, (_, colIndex) => (
          <View key={colIndex} className="min-w-0 flex-1 flex-col gap-1">
            {MAP_ROWS.map((row, rowIndex) => {
              const abbr = row[colIndex] ?? null;
              return abbr ? (
                <StateCell
                  key={rowIndex}
                  abbr={abbr}
                  selected={selected}
                  onSelect={onStateSelect}
                  compact={!isWebDesktop}
                  status={resolveCellStatus(abbr, statesByAbbr)}
                  loading={statesLoading}
                  disabled={mapDisabled}
                />
              ) : (
                <View key={rowIndex} className="w-full" style={{ aspectRatio: 1 }} />
              );
            })}
          </View>
        ))}
      </View>
      {/* Legend */}
      <View className="mt-3 flex-row items-center justify-center gap-4">
        {(['supportive', 'mixed', 'harmful'] as LegislativeStatus[]).map((status) => (
          <View key={status} className="flex-row items-center gap-1.5">
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: LEGEND_COLORS[status],
              }}
            />
            <Text className="font-sans" style={{ fontSize: hintSize, color: '#a1a1aa' }}>
              {STATUS_STYLES[status].label}
            </Text>
          </View>
        ))}
      </View>
      <Text className="mt-3 text-center font-sans" style={{ fontSize: hintSize, color: '#a1a1aa' }}>
        Tap a state to view details
      </Text>
    </View>
  );
}

// ── Main component ───────────────────────────────
export function StateSearch({
  selected,
  selectedInfo,
  statesByAbbr,
  statesLoading,
  statesError,
  onRetryStates,
  stateDropdownOptions,
  onStateSelect,
  onNavigateToState,
  scrollViewRef,
  containerY,
}: StateSearchProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const detailRef = useRef<View>(null);
  const containerRef = useRef<View>(null);

  useEffect(() => {
    if (!selected || !selectedInfo || !scrollViewRef?.current) {
      return;
    }

    if (containerY?.current != null) {
      const timeout = setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: containerY.current - 16,
          animated: true,
        });
      }, 100);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      containerRef.current?.measureLayout(
        (scrollViewRef.current as any)?.getInnerViewRef?.(),
        (_x: number, y: number) => {
          scrollViewRef.current?.scrollTo({
            y: y - 12,
            animated: true,
          });
        },
        () => {}
      );
    }, 100);

    return () => clearTimeout(timeout);
  }, [selected, selectedInfo, isCompact, scrollViewRef]);

  const handleClose = () => onStateSelect('');

  const webBlur = Platform.OS === 'web' ? ({ backdropFilter: 'blur(16px)' } as object) : null;
  const mapDisabled = statesLoading;

  return (
    <View ref={containerRef}>
      {statesError && (
        <View className="mb-3 rounded-xl border border-red-200/80 bg-red-50/95 px-3 py-2.5">
          <Text className="font-sans text-[13px] text-red-900">
            Couldn&apos;t load state data. Map shows last-known or default colors.
          </Text>
          <Pressable
            onPress={onRetryStates}
            className="mt-2 self-start rounded-lg bg-red-100 px-3 py-1.5 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Retry loading states">
            <Text className="font-sans-semibold text-xs text-red-900">Retry</Text>
          </Pressable>
        </View>
      )}

      {/* Search trigger */}
      <View className={isCompact ? 'mb-4' : 'mb-5 max-w-sm'}>
        <StateDropdown
          value={selected}
          onChange={onStateSelect}
          placeholder="Search states..."
          stateOptions={stateDropdownOptions}
        />
      </View>

      {isCompact ? (
        /* ── Mobile: map card with detail inside ── */
        <View className="overflow-hidden rounded-xl p-4" style={[GLASS_MAP, webBlur]}>
          <HexMap
            selected={selected}
            onStateSelect={onStateSelect}
            isWebDesktop={Platform.OS === 'web' && !isCompact}
            statesByAbbr={statesByAbbr}
            statesLoading={statesLoading}
            mapDisabled={mapDisabled}
          />

          {selected && selectedInfo && (
            <View
              ref={detailRef}
              className="mt-4 border-t pt-4"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <StateDetailPanel
                info={selectedInfo}
                onNavigate={onNavigateToState}
                onClose={handleClose}
              />
            </View>
          )}
        </View>
      ) : (
        /* ── Desktop: map + side panel ── */
        <View className="flex-row gap-4">
          <View
            className={[
              'overflow-hidden rounded-xl p-12',
              selected && selectedInfo ? 'flex-1' : 'w-full',
            ].join(' ')}
            style={[GLASS_MAP, webBlur]}>
            <HexMap
              selected={selected}
              onStateSelect={onStateSelect}
              isWebDesktop={Platform.OS === 'web' && !isCompact}
              statesByAbbr={statesByAbbr}
              statesLoading={statesLoading}
              mapDisabled={mapDisabled}
            />
          </View>

          {selected && selectedInfo && (
            <View className="w-[320px] flex-shrink-0">
              <StateDetailPanel
                info={selectedInfo}
                onNavigate={onNavigateToState}
                onClose={handleClose}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}
