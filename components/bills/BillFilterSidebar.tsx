import Slider from '@react-native-community/slider';
import { useCallback, useMemo, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, Text, TextInput, UIManager, View } from 'react-native';

import type { BillFilters, SortOrder } from '@/static/billConstants';
import { ACCENT_BLUE, STANCE_CHECK_BG, STANCE_DOT, STANCE_LABEL } from '@/static/billConstants';
import type { LegislativeStatus } from '@/static/states';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface BillFilterSidebarProps {
  filters: BillFilters;
  activeCategories: Set<string>;
  activeYears: Set<number>;
  activeStatuses: Set<string>;
  availableCategories: string[];
  availableYears: number[];
  availableStatuses: string[];
  billCountByStance: Record<string, number>;
  billCountByCategory: Record<string, number>;
  billCountByYear: Record<number, number>;
  billCountByStatus: Record<string, number>;
  onToggleStance: (s: LegislativeStatus) => void;
  onToggleStatus: (s: string) => void;
  onToggleCategory: (c: string) => void;
  /** Enter in category search: narrow to this category only (stance-style explicit set). */
  onPickCategoryFromSearch: (c: string) => void;
  onSetYearRange: (start: number, end: number) => void;
  onSetSort: (s: SortOrder) => void;
  onReset: () => void;
}

const STANCES: LegislativeStatus[] = ['supportive', 'harmful', 'mixed'];

/** Year range using `@react-native-community/slider` (iOS, Android, web via RN Web). */
export function YearFilterSliders({
  availableYears,
  selectedYears,
  billCountByYear,
  onSetYearRange,
}: {
  availableYears: number[];
  selectedYears: Set<number>;
  billCountByYear: Record<number, number>;
  onSetYearRange: (start: number, end: number) => void;
}) {
  const sorted = useMemo(() => [...availableYears].sort((a, b) => a - b), [availableYears]);

  if (sorted.length === 0) return null;

  if (sorted.length === 1) {
    const y = sorted[0];
    return (
      <Text className="font-sans text-xs text-zinc-600">
        {y} · {billCountByYear[y] ?? 0} bills
      </Text>
    );
  }

  const maxI = sorted.length - 1;
  const minY =
    selectedYears.size === 0 ? sorted[0] : Math.min(...[...selectedYears]);
  const maxY =
    selectedYears.size === 0 ? sorted[maxI] : Math.max(...[...selectedYears]);
  let fromIdx = sorted.indexOf(minY);
  let toIdx = sorted.indexOf(maxY);
  if (fromIdx < 0) fromIdx = 0;
  if (toIdx < 0) toIdx = maxI;

  const webThumb =
    Platform.OS === 'web'
      ? ({ thumbSize: 11, trackHeight: 3 } as Record<string, unknown>)
      : {};

  return (
    <View style={{ gap: 8 }}>
      <View>
        <Text className="mb-1 font-sans">
          <Text className="uppercase tracking-wider text-[10px] text-zinc-500">From </Text>
          <Text className="ml-0.5 font-sans-medium text-[11px] text-zinc-700">{minY}</Text>
        </Text>
        <Slider
          {...webThumb}
          style={{ width: '100%', height: Platform.OS === 'web' ? 22 : 28 }}
          value={fromIdx}
          minimumValue={0}
          maximumValue={maxI}
          step={1}
          minimumTrackTintColor={ACCENT_BLUE}
          maximumTrackTintColor="#e4e4e7"
          thumbTintColor={ACCENT_BLUE}
          onValueChange={(i) => {
            const fi = Math.min(Math.round(i), toIdx);
            onSetYearRange(sorted[fi], sorted[toIdx]);
          }}
        />
      </View>
      <View>
        <Text className="mb-1 font-sans">
          <Text className="uppercase tracking-wider text-[10px] text-zinc-500">To </Text>
          <Text className="ml-0.5 font-sans-medium text-[11px] text-zinc-700">{maxY}</Text>
        </Text>
        <Slider
          {...webThumb}
          style={{ width: '100%', height: Platform.OS === 'web' ? 22 : 28 }}
          value={toIdx}
          minimumValue={0}
          maximumValue={maxI}
          step={1}
          minimumTrackTintColor={ACCENT_BLUE}
          maximumTrackTintColor="#e4e4e7"
          thumbTintColor={ACCENT_BLUE}
          onValueChange={(i) => {
            const ti = Math.max(Math.round(i), fromIdx);
            onSetYearRange(sorted[fromIdx], sorted[ti]);
          }}
        />
      </View>
    </View>
  );
}

export function BillFilterSidebar({
  filters,
  activeCategories: _ac,
  activeYears: _ay,
  activeStatuses: _as,
  availableCategories,
  availableYears,
  availableStatuses,
  billCountByStance,
  billCountByCategory,
  billCountByYear,
  billCountByStatus,
  onToggleStance,
  onToggleStatus,
  onToggleCategory,
  onPickCategoryFromSearch,
  onSetYearRange,
  onSetSort,
  onReset,
}: BillFilterSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [sections, setSections] = useState({
    year: true,
    stance: true,
    status: true,
    category: true,
    sort: true,
  });

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return availableCategories;
    const q = categorySearch.toLowerCase().trim();
    return availableCategories.filter((c) => c.replace(/_/g, ' ').toLowerCase().includes(q));
  }, [availableCategories, categorySearch]);

  const applyFirstCategoryMatch = useCallback(() => {
    if (!categorySearch.trim()) return;
    const first = filteredCategories[0];
    if (!first) return;
    onPickCategoryFromSearch(first);
    setCategorySearch('');
  }, [categorySearch, filteredCategories, onPickCategoryFromSearch]);

  const toggleCollapsed = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed((p) => !p);
  }, []);

  const toggleSection = useCallback((key: keyof typeof sections) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSections((p) => ({ ...p, [key]: !p[key] }));
  }, []);

  return (
    <View
      style={{
        width: collapsed ? 36 : 190,
        overflow: 'hidden',
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(212,212,216,0.6)',
      }}>
      {/* Collapse toggle */}
      <Pressable
        className="items-center justify-center py-2.5"
        style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(212,212,216,0.6)' }}
        onPress={toggleCollapsed}>
        <HamburgerIcon rotated={collapsed} />
      </Pressable>

      {!collapsed && (
        <View>
          {/* ── Year ── */}
          <FilterSection label="Year" open={sections.year} onToggle={() => toggleSection('year')}>
            <YearFilterSliders
              availableYears={availableYears}
              selectedYears={filters.years}
              billCountByYear={billCountByYear}
              onSetYearRange={onSetYearRange}
            />
          </FilterSection>

          {/* ── Stance ── */}
          <FilterSection
            label="Stance"
            open={sections.stance}
            onToggle={() => toggleSection('stance')}>
            {filters.stances.size < STANCES.length && (
              <Pressable
                onPress={() => { for (const s of STANCES) { if (!filters.stances.has(s)) onToggleStance(s); } }}
                style={{ paddingBottom: 4 }}>
                <Text className="font-sans text-[10px] text-blue-500">Select all</Text>
              </Pressable>
            )}
            {STANCES.map((s) => (
              <CheckboxRow
                key={s}
                label={STANCE_LABEL[s]}
                checked={filters.stances.has(s)}
                count={billCountByStance[s] ?? 0}
                checkColor={STANCE_CHECK_BG[s]}
                dot={STANCE_DOT[s]}
                onPress={() => onToggleStance(s)}
              />
            ))}
          </FilterSection>

          {/* ── Status ── */}
          <FilterSection
            label="Status"
            open={sections.status}
            onToggle={() => toggleSection('status')}>
            {filters.statuses.size > 0 && filters.statuses.size < availableStatuses.length && availableStatuses.length > 1 && (
              <Pressable
                onPress={() => { for (const s of availableStatuses) { if (!filters.statuses.has(s)) onToggleStatus(s); } }}
                style={{ paddingBottom: 4 }}>
                <Text className="font-sans text-[10px] text-blue-500">Select all</Text>
              </Pressable>
            )}
            {availableStatuses.map((s) => (
              <CheckboxRow
                key={s}
                label={s}
                checked={filters.statuses.size === 0 || filters.statuses.has(s)}
                count={billCountByStatus[s] ?? 0}
                checkColor={ACCENT_BLUE}
                onPress={() => onToggleStatus(s)}
              />
            ))}
          </FilterSection>

          {/* ── Category ── */}
          <FilterSection
            label="Category"
            open={sections.category}
            onToggle={() => toggleSection('category')}>
            <TextInput
              value={categorySearch}
              onChangeText={setCategorySearch}
              onSubmitEditing={applyFirstCategoryMatch}
              returnKeyType="search"
              placeholder="Search…"
              placeholderTextColor="#a1a1aa"
              className="font-sans text-xs text-zinc-800"
              style={{
                height: 28,
                borderWidth: 1,
                borderColor: '#e4e4e7',
                borderRadius: 6,
                paddingHorizontal: 8,
                marginBottom: 4,
              }}
            />
            {filters.categories.size > 0 && filters.categories.size < availableCategories.length && (
              <Pressable
                onPress={() => { for (const c of availableCategories) { if (!filters.categories.has(c)) onToggleCategory(c); } }}
                style={{ paddingBottom: 4 }}>
                <Text className="font-sans text-[10px] text-blue-500">Select all</Text>
              </Pressable>
            )}
            {filteredCategories.map((c) => (
              <CheckboxRow
                key={c}
                label={c.replace(/_/g, ' ')}
                checked={filters.categories.size === 0 || filters.categories.has(c)}
                count={billCountByCategory[c] ?? 0}
                checkColor={ACCENT_BLUE}
                onPress={() => onToggleCategory(c)}
              />
            ))}
            {filteredCategories.length === 0 && (
              <Text className="font-sans text-[11px] text-zinc-400" style={{ paddingVertical: 4 }}>
                No matches
              </Text>
            )}
          </FilterSection>

          {/* ── Sort ── */}
          <FilterSection label="Sort" open={sections.sort} onToggle={() => toggleSection('sort')}>
            <RadioRow
              label="Newest first"
              selected={filters.sort === 'newest'}
              onPress={() => onSetSort('newest')}
            />
            <RadioRow
              label="Oldest first"
              selected={filters.sort === 'oldest'}
              onPress={() => onSetSort('oldest')}
            />
          </FilterSection>

          {/* Reset */}
          <Pressable className="px-4 py-2.5" onPress={onReset}>
            <Text className="font-sans-semibold text-xs text-blue-500">Reset all filters</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ── Internal sub-components ──────────────────────

function FilterSection({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="border-b border-zinc-200">
      <Pressable className="flex-row items-center justify-between px-4 py-2.5" onPress={onToggle}>
        <Text className="font-sans-semibold text-[11px] uppercase tracking-widest text-zinc-500">
          {label}
        </Text>
        <SectionChevron open={open} />
      </Pressable>
      {open && <View className="px-4 pb-2.5">{children}</View>}
    </View>
  );
}

function CheckboxRow({
  label,
  checked,
  count,
  checkColor,
  dot,
  onPress,
}: {
  label: string;
  checked: boolean;
  count: number;
  checkColor: string;
  dot?: string;
  onPress: () => void;
}) {
  return (
    <Pressable className="flex-row items-center gap-2 py-[5px]" onPress={onPress}>
      <View
        className="h-3.5 w-3.5 items-center justify-center rounded"
        style={{
          borderWidth: 1.5,
          borderColor: checked ? checkColor : '#d4d4d8',
          backgroundColor: checked ? checkColor : 'transparent',
        }}>
        {checked && <CheckIcon />}
      </View>
      {dot && <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />}
      <Text className="flex-1 font-sans text-xs text-zinc-800">{label}</Text>
      <Text className="font-sans text-[11px] text-zinc-400">{count}</Text>
    </Pressable>
  );
}

function RadioRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable className="flex-row items-center gap-2 py-[5px]" onPress={onPress}>
      <View
        className="h-3.5 w-3.5 items-center justify-center rounded-full"
        style={{ borderWidth: 1.5, borderColor: selected ? ACCENT_BLUE : '#d4d4d8' }}>
        {selected && (
          <View className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: ACCENT_BLUE }} />
        )}
      </View>
      <Text className="font-sans text-xs text-zinc-800">{label}</Text>
    </Pressable>
  );
}

function CheckIcon() {
  return (
    <View
      style={{
        width: 6,
        height: 3,
        borderLeftWidth: 1.5,
        borderBottomWidth: 1.5,
        borderColor: '#fff',
        transform: [{ rotate: '-45deg' }],
        marginTop: -1,
      }}
    />
  );
}

function SectionChevron({ open }: { open: boolean }) {
  return (
    <View
      style={{
        width: 8,
        height: 8,
        borderRightWidth: 1.2,
        borderBottomWidth: 1.2,
        borderColor: '#a1a1aa',
        transform: [{ rotate: open ? '225deg' : '45deg' }],
      }}
    />
  );
}

function HamburgerIcon({ rotated }: { rotated: boolean }) {
  return (
    <View
      style={{
        width: 16,
        height: 12,
        justifyContent: 'space-between',
        transform: [{ rotate: rotated ? '90deg' : '0deg' }],
      }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ height: 1.3, backgroundColor: '#a1a1aa', borderRadius: 1 }} />
      ))}
    </View>
  );
}
