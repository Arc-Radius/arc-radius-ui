import { useEffect, useRef } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
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
}: {
  abbr: string;
  selected: string | null;
  onSelect: (abbr: string) => void;
}) {
  const info = STATES[abbr];
  if (!info) return <View className="w-full" style={{ aspectRatio: 1 }} />;

  const isSelected = selected === abbr;
  const cell = STATUS_CELL[info.status];

  return (
    <Pressable
      onPress={() => onSelect(abbr)}
      className="w-full items-center justify-center"
      style={{
        aspectRatio: 1,
        backgroundColor: cell.bg,
        borderWidth: isSelected ? 1 : 0,
        borderColor: isSelected ? cell.selectedBorder : 'transparent',
        borderRadius: 6,
      }}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${info.name}, ${STATUS_STYLES[info.status].label}`}
      accessibilityState={{ selected: isSelected }}
      accessibilityHint="Double tap to view policy details">
      <Text className="text-center font-sans-semibold" style={{ fontSize: 9, color: cell.text }}>
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
    <View className="overflow-hidden rounded-xl" style={{ backgroundColor: '#18181b' }}>
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
            style={{ backgroundColor: '#27272a' }}
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
            <Text className="mt-0.5 font-sans text-[10px]" style={{ color: '#52525b' }}>
              legislations
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
            <Text className="mt-0.5 font-sans text-[10px]" style={{ color: '#52525b' }}>
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
  const titleSize = isWebDesktop ? 17 : 13;
  const hintSize = isWebDesktop ? 14 : 11;
  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel="United States legislative climate map">
      <Text
        className="mb-3 font-sans-semibold"
        style={{ fontSize: titleSize, color: '#3f3f46' }}>
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
                />
              ) : (
                <View key={rowIndex} className="w-full" style={{ aspectRatio: 1 }} />
              );
            })}
          </View>
        ))}
      </View>
      <Text
        className="mt-3 text-center font-sans"
        style={{ fontSize: hintSize, color: '#52525b' }}>
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

  useEffect(() => {
    if (!isCompact || !selected || !selectedInfo || !scrollViewRef?.current) {
      return;
    }

    const timeout = setTimeout(() => {
      detailRef.current?.measureLayout(
        (scrollViewRef.current as any)?.getInnerViewRef?.(),
        (_x: number, y: number) => {
          scrollViewRef.current?.scrollTo({
            y: y - 16,
            animated: true,
          });
        },
        () => {}
      );
    }, 100);

    return () => clearTimeout(timeout);
  }, [selected, selectedInfo, isCompact, scrollViewRef]);

  const handleClose = () => onStateSelect('');

  return (
    <View>
      {/* Search trigger */}
      <View className={isCompact ? 'mb-4' : 'mb-5 max-w-sm'}>
        <StateDropdown value={selected} onChange={onStateSelect} placeholder="Search state..." />
      </View>

      {isCompact ? (
        /* ── Mobile: dark map card with detail inside ── */
        <View className="rounded-xl p-4" style={{ backgroundColor: '#18181b' }}>
          <HexMap
            selected={selected}
            onStateSelect={onStateSelect}
            isWebDesktop={Platform.OS === 'web' && !isCompact}
          />

          {selected && selectedInfo && (
            <View ref={detailRef} className="mt-4 border-t pt-4" style={{ borderColor: '#27272a' }}>
              <StateDetailPanel
                info={selectedInfo}
                onNavigate={onNavigateToState}
                onClose={handleClose}
              />
            </View>
          )}
        </View>
      ) : (
        /* ── Desktop: dark map + dark side panel ── */
        <View className="flex-row gap-4">
          <View
            className={['rounded-xl p-12', selected && selectedInfo ? 'flex-1' : 'w-full'].join(' ')}
            style={{ backgroundColor: '#18181b' }}>
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
