import { AccessibilityInfo, Pressable, Text, TextInput, View } from 'react-native';

import { Button } from './ui/Button';
import { STATES, STATUS_STYLES, MAP_ROWS } from '../static/states';
import type { LegislativeStatus, StateInfo } from '../static/states';
import { Key } from 'react';

// ── Props from HomeScreen ────────────────────────
interface StateSearchProps {
  zip: string;
  zipError: string | null;
  onZipChange: (text: string) => void;
  onSearch: () => void;
  isSearchEnabled: boolean;
  showMap: boolean;
  onToggleMap: () => void;
  selected: string | null;
  selectedInfo: StateInfo | null;
  onStateSelect: (abbr: string) => void;
}

// ── Status visuals ───────────────────────────────
const STATUS_SYMBOL: Record<LegislativeStatus, string> = {
  supportive: '●',
  mixed: '▲',
  harmful: '■',
};

// ── Sub-components ───────────────────────────────
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
  if (!info) return <View className="aspect-square flex-1" />;

  const isSelected = selected === abbr;
  const style = STATUS_STYLES[info.status];

  return (
    <Pressable
      onPress={() => onSelect(abbr)}
      className={`aspect-square flex-1 items-center justify-center rounded ${
        isSelected ? 'opacity-100' : 'opacity-90'
      }`}
      style={[
        { backgroundColor: style.cellBg },
        isSelected && { borderWidth: 2, borderColor: '#2C2820' },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${info.name}, ${style.label}`}
      accessibilityState={{ selected: isSelected }}
      accessibilityHint="Double tap to view policy details">
      <Text className="text-center font-sans-semibold text-white" style={{ fontSize: 9 }}>
        {abbr}
      </Text>
    </Pressable>
  );
}

function MapLegend() {
  return (
    <View
      className="mb-5 flex-row flex-wrap items-center gap-3"
      accessible
      accessibilityRole="summary"
      accessibilityLabel="Map legend: Supportive shown in blue, Mixed in amber, High Risk in vermillion">
      <Text className="font-sans-semibold text-xs uppercase tracking-widest text-stone-500">
        Legislative climate
      </Text>
      <View className="ml-auto flex-row gap-2.5">
        {(['supportive', 'mixed', 'harmful'] as LegislativeStatus[]).map((status) => {
          const s = STATUS_STYLES[status];
          return (
            <View
              key={status}
              className="flex-row items-center gap-1.5 rounded px-2.5 py-1"
              style={{ backgroundColor: s.bg }}>
              <Text style={{ color: s.color, fontSize: 8, marginRight: 1 }}>
                {STATUS_SYMBOL[status]}
              </Text>
              <Text
                className="font-sans-semibold text-xs uppercase tracking-wide"
                style={{ color: s.color }}>
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: LegislativeStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <View
      className="flex-row items-center gap-1.5 rounded px-2.5 py-0.5"
      style={{ backgroundColor: s.bg }}
      accessible
      accessibilityLabel={`Legislative climate: ${s.label}`}
      accessibilityRole="text">
      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
      <Text
        className="font-sans-semibold text-xs uppercase tracking-wide"
        style={{ color: s.color }}>
        {s.label}
      </Text>
    </View>
  );
}

// ── Main component ───────────────────────────────
export function StateSearch({
  zip,
  zipError,
  onZipChange,
  onSearch,
  isSearchEnabled,
  showMap,
  onToggleMap,
  selected,
  selectedInfo,
  onStateSelect,
}: StateSearchProps) {
  return (
    <View className="gap-2.5 pt-2">
      <Text className="font-sans-semibold text-xs uppercase leading-5 tracking-wide text-stone-500">
        Find your state
      </Text>

      <View className="max-w-96 flex-row items-start gap-2">
        <TextInput
          value={zip}
          onChangeText={onZipChange}
          onSubmitEditing={onSearch}
          className={`flex-1 rounded-lg border bg-white px-3.5 py-2.5 font-sans text-sm text-stone-800 ${
            zipError ? 'border-red-400' : 'border-stone-300'
          }`}
          placeholder="Enter ZIP code"
          placeholderTextColor="#78716c"
          keyboardType="number-pad"
          maxLength={5}
          returnKeyType="search"
          accessible
          accessibilityLabel="ZIP code"
          accessibilityHint="Enter your 5-digit ZIP code to find your state"
        />
        <Button label="Search" className="py-3" onPress={onSearch} disabled={!isSearchEnabled} />
      </View>

      {zipError && <Text className="mt-1 font-sans text-xs text-red-500">{zipError}</Text>}

      <View className="max-w-96 flex-row items-center gap-3 py-1">
        <View className="h-px flex-1 bg-stone-300" />
        <Text className="font-sans text-xs leading-5 text-stone-500">or</Text>
        <View className="h-px flex-1 bg-stone-300" />
      </View>

      <Button
        label={showMap ? 'Hide map' : 'Browse interactive map'}
        variant="outline"
        className="max-w-96"
        onPress={onToggleMap}
      />

      {/* ── Interactive Map ──────────────────────── */}
      {showMap && (
        <View className="mt-4 rounded-xl border border-stone-300 bg-white p-6">
          <MapLegend />

          <View
            accessible
            accessibilityRole="summary"
            accessibilityLabel="United States legislative climate map">
            <View className="gap-1">
              {MAP_ROWS.map((row: any[], ri: Key | null | undefined) => (
                <View key={ri} className="flex-row gap-1">
                  {row.map((abbr, ci) =>
                    abbr ? (
                      <StateCell
                        key={ci}
                        abbr={abbr}
                        selected={selected}
                        onSelect={onStateSelect}
                      />
                    ) : (
                      <View key={ci} className="aspect-square flex-1" />
                    )
                  )}
                </View>
              ))}
            </View>
            <Text className="mt-3 text-center text-xs text-stone-500">
              Tap any state to view detailed policy information
            </Text>
          </View>

          {selected && selectedInfo && (
            <View className="mt-4 flex-row items-center justify-between border-t border-stone-300 pt-4">
              <Text className="font-sans-semibold text-stone-800">{selectedInfo.name}</Text>
              <StatusBadge status={selectedInfo.status} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}
