import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
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
  scrollViewRef?: React.RefObject<ScrollView>;
}

// ── Status colors (optimized for dark zinc background) ─
// Brighter fills + light text for contrast on zinc-800
const STATUS_CELL: Record<
  LegislativeStatus,
  { bg: string; border: string; selectedBorder: string; text: string }
> = {
  supportive: {
    bg: 'rgba(59,130,246,0.28)',
    border: 'rgba(59,130,246,0.45)',
    selectedBorder: '#60a5fa',
    text: '#93c5fd',
  },
  mixed: {
    bg: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.18)',
    selectedBorder: '#a1a1aa',
    text: '#d4d4d8',
  },
  harmful: {
    bg: 'rgba(249,115,22,0.28)',
    border: 'rgba(249,115,22,0.45)',
    selectedBorder: '#fb923c',
    text: '#fdba74',
  },
};

const STATUS_BADGE: Record<LegislativeStatus, { bg: string; border: string; text: string }> = {
  supportive: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
  mixed: { bg: '#fafafa', border: '#a1a1aa', text: '#52525b' },
  harmful: { bg: '#fff7ed', border: '#f97316', text: '#9a3412' },
};

// ── State cell (stable 2px border — no layout shift) ─
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
        borderWidth: 1,
        borderColor: isSelected ? cell.selectedBorder : cell.border,
        borderRadius: 8,
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

// ── Icons for detail cards ───────────────────────
function PolicyIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
      <Path
        d="M3 5C3 3.9 3.9 3 5 3H13C14.1 3 15 3.9 15 5V13C15 14.1 14.1 15 13 15H5C3.9 15 3 14.1 3 13V5Z"
        fill="#eff6ff"
        stroke="#3b82f6"
        strokeWidth={1}
      />
      <Line x1={6} y1={8} x2={12} y2={8} stroke="#3b82f6" strokeWidth={0.8} strokeLinecap="round" />
      <Line
        x1={6}
        y1={11}
        x2={10}
        y2={11}
        stroke="#3b82f6"
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
        fill="#fff7ed"
        stroke="#f97316"
        strokeWidth={1}
      />
      <Line x1={7} y1={7} x2={11} y2={7} stroke="#f97316" strokeWidth={0.8} strokeLinecap="round" />
      <Line
        x1={7}
        y1={10}
        x2={9}
        y2={10}
        stroke="#f97316"
        strokeWidth={0.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ── State detail panel ───────────────────────────
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
    <View className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <View className="p-4">
        {/* Header */}
        <View className="mb-3.5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <Text className="font-serif-bold text-lg text-zinc-800">{info.name}</Text>
            <View
              className="rounded-full px-2.5 py-0.5"
              style={{
                backgroundColor: badge.bg,
                borderWidth: 0.5,
                borderColor: badge.border,
              }}>
              <Text className="font-sans-semibold text-[11px]" style={{ color: badge.text }}>
                {STATUS_STYLES[info.status].label}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onClose}
            className="h-[22px] w-[22px] items-center justify-center rounded-full bg-zinc-100 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Close state details">
            <Text className="text-[10px] text-zinc-400">✕</Text>
          </Pressable>
        </View>

        {/* Icon cards */}
        <View className="mb-3 flex-row gap-2">
          <View className="flex-1 items-center rounded-[10px] border border-zinc-200 py-3">
            <View
              className="mb-1.5 h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#eff6ff' }}>
              <PolicyIcon />
            </View>
            <Text className="font-sans-semibold text-xs text-zinc-700">Policies</Text>
            <Text className="mt-0.5 font-sans text-[10px] text-zinc-400">— protections</Text>
          </View>

          <View className="flex-1 items-center rounded-[10px] border border-zinc-200 py-3">
            <View
              className="mb-1.5 h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#fff7ed' }}>
              <BillIcon />
            </View>
            <Text className="font-sans-semibold text-xs text-zinc-700">Bills</Text>
            <Text className="mt-0.5 font-sans text-[10px] text-zinc-400">— active</Text>
          </View>
        </View>

        {/* Explore CTA */}
        <Pressable
          onPress={onNavigate}
          className="flex-row items-center justify-center gap-1.5 rounded-[10px] bg-zinc-800 py-3 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel={`Explore ${info.name}`}>
          <Text className="font-sans-semibold text-[13px] text-white">Explore {info.name}</Text>
          <Text className="text-zinc-500">→</Text>
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
}: {
  selected: string | null;
  onStateSelect: (abbr: string) => void;
}) {
  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel="United States legislative climate map">
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
      <Text className="mt-3 text-center font-sans text-[11px] text-zinc-400">
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

  // Auto-scroll to detail panel on mobile when a state is selected
  useEffect(() => {
    if (!isCompact || !selected || !selectedInfo || !scrollViewRef?.current) {
      return;
    }

    const timeout = setTimeout(() => {
      detailRef.current?.measureLayout(
        scrollViewRef.current?.getInnerViewRef?.() as any,
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
        /* ── Mobile: map card (dark) with detail inside ── */
        <View className="rounded-xl border border-zinc-700 bg-zinc-800 p-4">
          <HexMap selected={selected} onStateSelect={onStateSelect} />

          {selected && selectedInfo && (
            <View ref={detailRef} className="mt-4 border-t border-zinc-700 pt-4">
              <StateDetailPanel
                info={selectedInfo}
                onNavigate={onNavigateToState}
                onClose={handleClose}
              />
            </View>
          )}
        </View>
      ) : (
        /* ── Desktop: map (dark) + side panel ── */
        <View className="flex-row gap-4">
          <View
            className={[
              'rounded-xl border border-zinc-700 bg-zinc-800 p-8',
              selected && selectedInfo ? 'flex-1' : 'w-full',
            ].join(' ')}>
            <HexMap selected={selected} onStateSelect={onStateSelect} />
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
