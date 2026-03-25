import { useEffect, useRef } from 'react';
import { Platform, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Rect as SvgRect, Path, Line } from 'react-native-svg';

import { StateDropdown } from './StateDropdown';
import { STATES, STATUS_STYLES, MAP_ROWS } from '../static/states';
import type { LegislativeStatus, StateInfo } from '../static/states';

// ── Props ────────────────────────────────────────
interface StateSearchProps {
  selected: string | null;
  selectedInfo: StateInfo | null;
  onStateSelect: (abbr: string) => void;
  onNavigateToState?: () => void;
  scrollViewRef?: React.RefObject<ScrollView | null>;
}

// ── Glass styles ─────────────────────────────────
// Dark glass base for map container and detail panel
const GLASS_MAP = {
  backgroundColor: 'rgba(24,24,27,0.98)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
} as const;

// Slightly more opaque for the detail panel sitting on top
const GLASS_DETAIL = {
  backgroundColor: 'rgba(24,24,27,0.98)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
} as const;

// ── Status colors ────────────────────────────────
// Matches HeroSection palette: #93c5fd, #a1a1aa, #fdba74
const STATUS_CELL: Record<
  LegislativeStatus,
  { bg: string; border: string; text: string; selectedBorder: string }
> = {
  supportive: {
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.25)',
    text: '#93c5fd',
    selectedBorder: '#93c5fd',
  },
  mixed: {
    bg: 'rgba(161,161,170,0.1)',
    border: 'rgba(161,161,170,0.25)',
    text: '#a1a1aa',
    selectedBorder: '#a1a1aa',
  },
  harmful: {
    bg: 'rgba(249,115,22,0.1)',
    border: 'rgba(249,115,22,0.25)',
    text: '#fdba74',
    selectedBorder: '#fdba74',
  },
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

// Glass tint badges for dark detail panel
const STATUS_BADGE: Record<LegislativeStatus, { bg: string; text: string }> = {
  supportive: { bg: 'rgba(147,197,253,0.15)', text: '#93c5fd' },
  mixed: { bg: 'rgba(161,161,170,0.15)', text: '#a1a1aa' },
  harmful: { bg: 'rgba(253,186,116,0.15)', text: '#fdba74' },
};

// ── State cell ───────────────────────────────────
function StateCell({
  abbr,
  selected,
  onSelect,
  compact,
}: {
  abbr: string;
  selected: string | null;
  onSelect: (abbr: string) => void;
  compact?: boolean;
}) {
  const info = STATES[abbr];
  if (!info) return <View className="w-full" style={{ aspectRatio: 1 }} />;

  const isSelected = selected === abbr;
  const cell = STATUS_CELL[info.status];
  const fontSize = compact ? 9 : 11;

  return (
    <Pressable
      onPress={() => onSelect(abbr)}
      className="w-full items-center justify-center"
      style={[
        {
          aspectRatio: 1,
          backgroundColor: cell.bg,
          borderWidth: isSelected ? 1.5 : 0,
          borderColor: isSelected ? cell.selectedBorder : 'transparent',
          borderRadius: 6,
        },
        raisedShadow,
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${info.name}, ${STATUS_STYLES[info.status].label}`}
      accessibilityState={{ selected: isSelected }}
      accessibilityHint="Double tap to view policy details">
      <Text className="text-center font-sans-semibold" style={{ fontSize, color: cell.text }}>
        {abbr}
      </Text>
    </Pressable>
  );
}

// ── Icons (glass style) ──────────────────────────
function PolicyIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
      <Path
        d="M3 5C3 3.9 3.9 3 5 3H13C14.1 3 15 3.9 15 5V13C15 14.1 14.1 15 13 15H5C3.9 15 3 14.1 3 13V5Z"
        fill="rgba(59,130,246,0.15)"
        stroke="#60a5fa"
        strokeWidth={1}
      />
      <Line x1={6} y1={8} x2={12} y2={8} stroke="#60a5fa" strokeWidth={0.8} strokeLinecap="round" />
      <Line
        x1={6}
        y1={11}
        x2={10}
        y2={11}
        stroke="#60a5fa"
        strokeWidth={0.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BillIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
      <SvgRect
        x={3}
        y={2}
        width={12}
        height={14}
        rx={2}
        fill="rgba(249,115,22,0.15)"
        stroke="#fb923c"
        strokeWidth={1}
      />
      <Line x1={7} y1={7} x2={11} y2={7} stroke="#fb923c" strokeWidth={0.8} strokeLinecap="round" />
      <Line
        x1={7}
        y1={10}
        x2={9}
        y2={10}
        stroke="#fb923c"
        strokeWidth={0.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ── State detail panel (dark glass) ──────────────
function StateDetailPanel({
  info,
  onNavigate,
  onClose,
}: {
  info: StateInfo;
  onNavigate?: () => void;
  onClose: () => void;
}) {
  const badge = STATUS_BADGE[info.status];

  return (
    <View className="overflow-hidden rounded-xl" style={GLASS_DETAIL}>
      <View className="p-4">
        {/* Header */}
        <View className="mb-3.5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <Text className="font-serif-bold text-lg" style={{ color: '#fafafa' }}>
              {info.name}
            </Text>
            <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: badge.bg }}>
              <Text className="font-sans-semibold text-[11px]" style={{ color: badge.text }}>
                {STATUS_STYLES[info.status].label}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onClose}
            className="h-[22px] w-[22px] items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            accessibilityRole="button"
            accessibilityLabel="Close state details">
            <Text className="text-[10px]" style={{ color: '#52525b' }}>
              ✕
            </Text>
          </Pressable>
        </View>

        {/* Glass icon cards */}
        <View className="mb-3 flex-row gap-2">
          <View
            className="flex-1 items-center rounded-[10px] py-3"
            style={{
              backgroundColor: 'rgba(59,130,246,0.1)',
              borderWidth: 0.5,
              borderColor: 'rgba(59,130,246,0.25)',
            }}>
            <View
              className="mb-1.5 h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'rgba(59,130,246,0.15)' }}>
              <PolicyIcon />
            </View>
            <Text className="font-sans-semibold text-base" style={{ color: '#93c5fd' }}>
              14
            </Text>
            <Text className="mt-0.5 font-sans text-[11px]" style={{ color: '#e4e4e7' }}>
              passed bills
            </Text>
          </View>

          <View
            className="flex-1 items-center rounded-[10px] py-3"
            style={{
              backgroundColor: 'rgba(249,115,22,0.1)',
              borderWidth: 0.5,
              borderColor: 'rgba(249,115,22,0.25)',
            }}>
            <View
              className="mb-1.5 h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'rgba(249,115,22,0.15)' }}>
              <BillIcon />
            </View>
            <Text className="font-sans-semibold text-base" style={{ color: '#fdba74' }}>
              29
            </Text>
            <Text className="mt-0.5 font-sans text-[11px]" style={{ color: '#e4e4e7' }}>
              active bills
            </Text>
          </View>
        </View>

        {/* White CTA */}
        <Pressable
          onPress={onNavigate}
          className="flex-row items-center justify-center gap-1.5 rounded-[10px] bg-white py-3 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel={`Explore ${info.name}`}>
          <Text className="font-sans-semibold text-[13px]" style={{ color: '#18181b' }}>
            Explore {info.name}
          </Text>
          <Text style={{ color: '#71717a' }}>→</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Hex map (column-based — stable grid, aligned cells) ──
const GRID_COLS = Math.max(...MAP_ROWS.map((r: (string | null)[]) => r.length));

function HexMap({
  selected,
  onStateSelect,
  isWebDesktop,
}: {
  selected: string | null;
  onStateSelect: (abbr: string) => void;
  isWebDesktop?: boolean;
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
                />
              ) : (
                <View key={rowIndex} className="w-full" style={{ aspectRatio: 1 }} />
              );
            })}
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
  onStateSelect,
  onNavigateToState,
  scrollViewRef,
}: StateSearchProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const detailRef = useRef<View>(null);

  const containerRef = useRef<View>(null);

  useEffect(() => {
    if (!isCompact || !selected || !selectedInfo || !scrollViewRef?.current) {
      return;
    }

    const targetRef = Platform.OS === 'web' ? detailRef : containerRef;
    const offset = Platform.OS === 'web' ? -16 : -12;

    const timeout = setTimeout(() => {
      targetRef.current?.measureLayout(
        (scrollViewRef.current as any)?.getInnerViewRef?.(),
        (_x: number, y: number) => {
          scrollViewRef.current?.scrollTo({
            y: y + offset,
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

  return (
    <View ref={containerRef}>
      {/* Search trigger */}
      <View className={isCompact ? 'mb-4' : 'mb-5 max-w-sm'}>
        <StateDropdown value={selected} onChange={onStateSelect} placeholder="Search state..." />
      </View>

      {isCompact ? (
        /* ── Mobile: glass map card with detail inside ── */
        <View className="overflow-hidden rounded-xl p-4" style={[GLASS_MAP, webBlur]}>
          <HexMap
            selected={selected}
            onStateSelect={onStateSelect}
            isWebDesktop={Platform.OS === 'web' && !isCompact}
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
        /* ── Desktop: glass map + glass side panel ── */
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
