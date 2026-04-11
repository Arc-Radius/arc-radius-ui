import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';

import { BillFilterSidebar, YearFilterSliders } from './BillFilterSidebar';
import { StateBillCard } from './StateBillCard';
import { StateDashboard } from './StateDashboard';
import { StateDropdown } from '@/components/shared/StateDropdown';
import { StanceLegend } from './StanceLegend';
import { ScreenContent } from '@/components/ui/screen-layout';
import type { Bill, BillFilters, BillTab, SortOrder } from '@/static/billConstants';
import { ACCENT_BLUE, STANCE_CHECK_BG, STANCE_DOT, STANCE_LABEL } from '@/static/billConstants';
import { getBillsForState } from '@/static/bills';
import type { BillDetail } from '@/static/bills';
import type { LegislativeStatus } from '@/static/states';

// ── Constants ────────────────────────────────────

const STANCES: LegislativeStatus[] = ['supportive', 'harmful', 'mixed'];

// ── Connected filter bar section (Airbnb-style) ──
function FilterBarSection({
  label,
  value,
  active,
  items,
  onToggle,
  onReset,
}: {
  label: string;
  value: string;
  active: boolean;
  items: { key: string; label: string; count: number; checked: boolean; dot?: string }[];
  onToggle: (key: string) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ position: 'relative', zIndex: open ? 50 : 1 }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="px-3 py-1 active:bg-zinc-50"
        style={{ backgroundColor: active ? 'rgba(59,130,246,0.04)' : 'transparent' }}>
        <View className="flex-row items-center gap-1">
          <Text className="font-sans-medium text-[9.5px] uppercase tracking-wider text-zinc-600">{label}</Text>
          <Text style={{ fontSize: 12, color: '#a1a1aa' }}>{open ? '▴' : '▾'}</Text>
        </View>
        <Text
          className="font-sans text-[11px]"
          style={{ color: active ? ACCENT_BLUE : '#a1a1aa' }}
          numberOfLines={1}>
          {value}
        </Text>
      </Pressable>
      {open && (
        <>
          <Pressable
            onPress={() => setOpen(false)}
            style={{ position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0, zIndex: 40, cursor: 'default' } as any}
          />
          <View
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              minWidth: 160,
              backgroundColor: '#fff',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#e4e4e7',
              paddingVertical: 6,
              zIndex: 50,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
            }}>
            {active && (
              <Pressable onPress={() => { onReset(); setOpen(false); }} style={{ paddingHorizontal: 12, paddingVertical: 5 }}>
                <Text className="font-sans text-[10px] text-blue-500">Select all</Text>
              </Pressable>
            )}
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            {items.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => onToggle(item.key)}
                className="flex-row items-center gap-2 active:bg-zinc-50"
                style={{ paddingHorizontal: 12, paddingVertical: 5 }}>
                <View style={{
                  width: 14, height: 14, borderRadius: 3,
                  borderWidth: 1.5,
                  borderColor: item.checked ? (item.dot ?? ACCENT_BLUE) : '#d4d4d8',
                  backgroundColor: item.checked ? (item.dot ?? ACCENT_BLUE) : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.checked && <Text style={{ fontSize: 8, color: '#fff', marginTop: -1 }}>✓</Text>}
                </View>
                {item.dot && !item.checked && (
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.dot }} />
                )}
                <Text className="flex-1 font-sans text-[11px] text-zinc-700">{item.label}</Text>
                <Text className="font-sans text-[10px] text-zinc-400">{item.count}</Text>
              </Pressable>
            ))}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
}

// ── Year filter bar section with slider dropdown ──
function FilterBarYearSection({
  filters,
  availableYears,
  billCountByYear,
  onSetYearRange,
}: {
  filters: BillFilters;
  availableYears: number[];
  billCountByYear: Record<number, number>;
  onSetYearRange: (start: number, end: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const sorted = [...availableYears].sort((a, b) => a - b);
  const allSelected = filters.years.size === 0 || filters.years.size === availableYears.length;
  const minY = allSelected ? sorted[0] : Math.min(...[...filters.years]);
  const maxY = allSelected ? sorted[sorted.length - 1] : Math.max(...[...filters.years]);
  const value = allSelected ? 'All' : (minY === maxY ? String(minY) : `${minY}–${maxY}`);
  const active = !allSelected;

  return (
    <View style={{ position: 'relative', zIndex: open ? 50 : 1 }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="px-3 py-1 active:bg-zinc-50"
        style={{ backgroundColor: active ? 'rgba(59,130,246,0.04)' : 'transparent' }}>
        <View className="flex-row items-center gap-1">
          <Text className="font-sans-medium tracking-wider text-[10px] text-zinc-600">YEAR</Text>
          <Text style={{ fontSize: 12, color: '#a1a1aa' }}>{open ? '▴' : '▾'}</Text>
        </View>
        <Text className="font-sans text-[11px]" style={{ color: active ? ACCENT_BLUE : '#a1a1aa' }}>
          {value}
        </Text>
      </Pressable>
      {open && (
        <>
          <Pressable
            onPress={() => setOpen(false)}
            style={{ position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0, zIndex: 40, cursor: 'default' } as any}
          />
          <View
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              width: 220,
              backgroundColor: '#fff',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#e4e4e7',
              padding: 12,
              zIndex: 50,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
            }}>
            <View style={{ cursor: 'pointer' } as any}>
              <YearFilterSliders
                availableYears={availableYears}
                selectedYears={filters.years}
                billCountByYear={billCountByYear}
                onSetYearRange={onSetYearRange}
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

// ── Category filter bar section with search ──
function FilterBarCategorySection({
  filters,
  availableCategories,
  billCountByCategory,
  onToggleCategory,
  onPickCategoryFromSearch,
}: {
  filters: BillFilters;
  availableCategories: string[];
  billCountByCategory: Record<string, number>;
  onToggleCategory: (c: string) => void;
  onPickCategoryFromSearch: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const allSelected = filters.categories.size === 0 || filters.categories.size === availableCategories.length;
  const active = !allSelected;
  const value = allSelected ? 'All' : `${filters.categories.size} of ${availableCategories.length}`;

  const applyFirstMatch = useCallback(() => {
    if (!search.trim()) return;
    const q = search.toLowerCase().trim();
    const first = availableCategories.find((c) => c.replace(/_/g, ' ').toLowerCase().includes(q));
    if (first) {
      onPickCategoryFromSearch(first);
      setSearch('');
      setOpen(false);
    }
  }, [search, availableCategories, onPickCategoryFromSearch]);

  const filtered = useMemo(() => {
    if (!search.trim()) return availableCategories;
    const q = search.toLowerCase().trim();
    return availableCategories.filter((c) => c.replace(/_/g, ' ').toLowerCase().includes(q));
  }, [availableCategories, search]);

  return (
    <View style={{ position: 'relative', zIndex: open ? 50 : 1 }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="px-3 py-1 active:bg-zinc-50"
        style={{ backgroundColor: active ? 'rgba(59,130,246,0.04)' : 'transparent' }}>
        <View className="flex-row items-center gap-1">
          <Text className="font-sans-medium text-[9.5px] uppercase tracking-wider text-zinc-600">Category</Text>
          <Text style={{ fontSize: 12, color: '#a1a1aa' }}>{open ? '▴' : '▾'}</Text>
        </View>
        <Text className="font-sans text-[11px]" style={{ color: active ? ACCENT_BLUE : '#a1a1aa' }}>
          {value}
        </Text>
      </Pressable>
      {open && (
        <>
          <Pressable
            onPress={() => { setOpen(false); setSearch(''); }}
            style={{ position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0, zIndex: 40, cursor: 'default' } as any}
          />
          <View
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              width: 200,
              backgroundColor: '#fff',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#e4e4e7',
              paddingVertical: 6,
              zIndex: 50,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
            }}>
            {/* Search */}
            <View style={{ paddingHorizontal: 10, paddingBottom: 4 }}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={applyFirstMatch}
                returnKeyType="search"
                placeholder="Search..."
                placeholderTextColor="#a1a1aa"
                className="font-sans text-[11px] text-zinc-800"
                style={{
                  height: 26,
                  borderWidth: 1,
                  borderColor: '#e4e4e7',
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  ...({ outlineStyle: 'none' } as any),
                }}
              />
            </View>
            {/* Select all */}
            {active && (
              <Pressable
                onPress={() => { for (const c of availableCategories) { if (!filters.categories.has(c)) onToggleCategory(c); } setOpen(false); setSearch(''); }}
                style={{ paddingHorizontal: 12, paddingVertical: 5 }}>
                <Text className="font-sans text-[10px] text-blue-500">Select all</Text>
              </Pressable>
            )}
            {/* Items */}
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
              {filtered.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => onToggleCategory(c)}
                  className="flex-row items-center gap-2 active:bg-zinc-50"
                  style={{ paddingHorizontal: 12, paddingVertical: 5 }}>
                  <View style={{
                    width: 14, height: 14, borderRadius: 3,
                    borderWidth: 1.5,
                    borderColor: (filters.categories.size === 0 || filters.categories.has(c)) ? ACCENT_BLUE : '#d4d4d8',
                    backgroundColor: (filters.categories.size === 0 || filters.categories.has(c)) ? ACCENT_BLUE : 'transparent',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {(filters.categories.size === 0 || filters.categories.has(c)) && (
                      <Text style={{ fontSize: 8, color: '#fff', marginTop: -1 }}>✓</Text>
                    )}
                  </View>
                  <Text className="flex-1 font-sans text-[11px] text-zinc-700">{c.replace(/_/g, ' ')}</Text>
                  <Text className="font-sans text-[10px] text-zinc-400">{billCountByCategory[c] ?? 0}</Text>
                </Pressable>
              ))}
              {filtered.length === 0 && (
                <Text className="font-sans text-[11px] text-zinc-400" style={{ paddingHorizontal: 12, paddingVertical: 5 }}>
                  No matches
                </Text>
              )}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
}

const TAB_CONFIG: { key: BillTab; title: string; subtitle: string }[] = [
  { key: 'active', title: 'Proposed', subtitle: 'Bills' },
  { key: 'passed', title: 'Passed', subtitle: 'Bills' },
];

/** Track padding; desktop web uses a roomier inset for the larger tab. */
const PILL_INSET = 3;
const PILL_INSET_WEB_WIDE = 4;

// ── Helpers ──────────────────────────────────────

function mapBillDetailToBill(d: BillDetail, index: number): Bill {
  return {
    id: d.id,
    bill_number: `HB${String(index + 1).padStart(3, '0')}`,
    title: d.title,
    description: d.summary,
    stance: d.status,
    billTab: d.billTab,
    status: 'In Committee',
    status_desc: 'In Committee',
    last_action: '—',
    last_action_date: '2000-01-01',
    year: 2000,
    primary_sponsor: '—',
    issue_categories: d.tags as Bill['issue_categories'],
  };
}

// ── Filter hook (embedded) ───────────────────────

function useBillFilters(activeBills: Bill[], passedBills: Bill[]) {
  const [tab, setTab] = useState<BillTab>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<BillFilters>(() => ({
    stances: new Set<LegislativeStatus>(['supportive', 'harmful', 'mixed']),
    statuses: new Set(
      [...new Set(activeBills.map((b) => b.status_desc).filter(Boolean))].sort() as string[]
    ),
    categories: new Set(
      [...new Set(activeBills.flatMap((b) => b.issue_categories ?? []))].sort()
    ),
    years: new Set<number>(),
    sort: 'newest',
  }));

  const sourceBills = tab === 'active' ? activeBills : passedBills;

  const availableCategories = useMemo(
    () => [...new Set(sourceBills.flatMap((b) => b.issue_categories ?? []))].sort(),
    [sourceBills]
  );
  const availableYears = useMemo(
    () =>
      [...new Set(sourceBills.map((b) => b.year ?? new Date().getFullYear()))].sort(
        (a, b) => b - a
      ),
    [sourceBills]
  );
  const availableStatuses = useMemo(
    () => [...new Set(sourceBills.map((b) => b.status_desc).filter(Boolean))].sort(),
    [sourceBills]
  );

  /** Like `stances`: explicit selected set; prune stale keys, fall back to all if none left. */
  const activeCategories = useMemo(() => {
    const valid = new Set([...filters.categories].filter((c) => availableCategories.includes(c)));
    return valid.size === 0 ? new Set(availableCategories) : valid;
  }, [filters.categories, availableCategories]);

  const activeYears = useMemo(() => {
    if (filters.years.size === 0) return new Set(availableYears);
    const valid = new Set([...filters.years].filter((y) => availableYears.includes(y)));
    return valid.size === 0 ? new Set(availableYears) : valid;
  }, [filters.years, availableYears]);

  const activeStatuses = useMemo(() => {
    const valid = new Set([...filters.statuses].filter((s) => availableStatuses.includes(s)));
    return valid.size === 0 ? new Set(availableStatuses) : valid;
  }, [filters.statuses, availableStatuses]);

  const filteredBills = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const f = sourceBills.filter(
      (b) =>
        filters.stances.has(b.stance ?? 'mixed') &&
        activeStatuses.has(b.status_desc || '') &&
        (b.issue_categories ?? []).some((c) => activeCategories.has(c)) &&
        activeYears.has(b.year ?? new Date().getFullYear()) &&
        (!q ||
          (b.title ?? '').toLowerCase().includes(q) ||
          (b.description ?? '').toLowerCase().includes(q) ||
          (b.bill_number ?? '').toLowerCase().includes(q))
    );
    return f.sort((a, b) => {
      const da = new Date(a.last_action_date ?? 0).getTime();
      const db = new Date(b.last_action_date ?? 0).getTime();
      return filters.sort === 'newest' ? db - da : da - db;
    });
  }, [sourceBills, filters.stances, activeStatuses, activeCategories, activeYears, filters.sort, searchQuery]);

  const toggleStance = useCallback((stance: LegislativeStatus) => {
    setFilters((prev) => {
      const next = new Set(prev.stances);
      if (next.has(stance)) {
        if (next.size <= 1) return prev;
        next.delete(stance);
      } else {
        next.add(stance);
      }
      return { ...prev, stances: next };
    });
  }, []);

  /** Same rules as `toggleStance`: toggle membership; cannot remove the last selected option. */
  const toggleStatus = useCallback((status: string) => {
    setFilters((prev) => {
      const next = new Set(prev.statuses);
      if (next.has(status)) {
        if (next.size <= 1) return prev;
        next.delete(status);
      } else {
        next.add(status);
      }
      return { ...prev, statuses: next };
    });
  }, []);

  const toggleCategory = useCallback((cat: string) => {
    setFilters((prev) => {
      const next = new Set(prev.categories);
      if (next.has(cat)) {
        if (next.size <= 1) return prev;
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return { ...prev, categories: next };
    });
  }, []);

  /** Category search Enter: narrow to a single category (sidebar). */
  const pickCategoryFromSearch = useCallback((cat: string) => {
    setFilters((prev) => ({ ...prev, categories: new Set([cat]) }));
  }, []);

  const setYearRange = useCallback(
    (start: number, end: number) => {
      const sorted = [...availableYears].sort((a, b) => a - b);
      const lo = Math.min(start, end);
      const hi = Math.max(start, end);
      const inRange = sorted.filter((y) => y >= lo && y <= hi);
      setFilters((prev) => {
        if (inRange.length === 0 || inRange.length === sorted.length) {
          return { ...prev, years: new Set<number>() };
        }
        return { ...prev, years: new Set(inRange) };
      });
    },
    [availableYears]
  );

  const setSort = useCallback((sort: SortOrder) => {
    setFilters((prev) => ({ ...prev, sort }));
  }, []);

  const switchTab = useCallback(
    (newTab: BillTab) => {
      setTab(newTab);
      setSearchQuery('');
      const bills = newTab === 'active' ? activeBills : passedBills;
      const nextStatuses = [...new Set(bills.map((b) => b.status_desc).filter(Boolean))].sort() as string[];
      const nextCategories = [...new Set(bills.flatMap((b) => b.issue_categories ?? []))].sort();
      setFilters((prev) => ({
        ...prev,
        statuses: new Set(nextStatuses),
        categories: new Set(nextCategories),
        years: new Set<number>(),
      }));
    },
    [activeBills, passedBills]
  );

  /** When options load or change, prune invalid keys; if none left, default to all (stance-style full set). */
  useLayoutEffect(() => {
    setFilters((prev) => {
      if (availableStatuses.length === 0 && availableCategories.length === 0) {
        if (prev.statuses.size === 0 && prev.categories.size === 0) return prev;
        return { ...prev, statuses: new Set<string>(), categories: new Set<string>() };
      }
      const prunedS = new Set([...prev.statuses].filter((s) => availableStatuses.includes(s)));
      const prunedC = new Set([...prev.categories].filter((c) => availableCategories.includes(c)));
      const nextS = prunedS.size > 0 ? prunedS : new Set(availableStatuses);
      const nextC = prunedC.size > 0 ? prunedC : new Set(availableCategories);
      if (
        nextS.size === prev.statuses.size &&
        [...nextS].every((x) => prev.statuses.has(x)) &&
        nextC.size === prev.categories.size &&
        [...nextC].every((x) => prev.categories.has(x))
      ) {
        return prev;
      }
      return { ...prev, statuses: nextS, categories: nextC };
    });
  }, [availableStatuses, availableCategories]);

  const resetAll = useCallback(() => {
    setFilters({
      stances: new Set<LegislativeStatus>(['supportive', 'harmful', 'mixed']),
      statuses: new Set(availableStatuses),
      categories: new Set(availableCategories),
      years: new Set<number>(),
      sort: 'newest',
    });
  }, [availableStatuses, availableCategories]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.stances.size < 3) count++;
    if (availableStatuses.length > 0 && filters.statuses.size < availableStatuses.length) count++;
    if (availableCategories.length > 0 && filters.categories.size < availableCategories.length) {
      count++;
    }
    if (filters.years.size > 0) count++;
    if (filters.sort !== 'newest') count++;
    return count;
  }, [filters, availableStatuses.length, availableCategories.length]);

  return {
    tab,
    switchTab,
    filters,
    activeFilterCount,
    activeCategories,
    activeYears,
    activeStatuses,
    availableCategories,
    availableYears,
    availableStatuses,
    filteredBills,
    sourceBills,
    searchQuery,
    setSearchQuery,
    toggleStance,
    toggleStatus,
    toggleCategory,
    pickCategoryFromSearch,
    setYearRange,
    setSort,
    resetAll,
  };
}

// ── Icons ────────────────────────────────────────

function FilterIcon({ size = 16, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M2 4h12M4 8h8M6 12h4" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

// ── Mobile filter bottom sheet ───────────────────

function FilterBottomSheet({
  visible,
  onClose,
  filters,
  activeCategories,
  activeYears,
  activeStatuses,
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
  onSetYearRange,
  onSetSort,
  onReset,
}: {
  visible: boolean;
  onClose: () => void;
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
  onSetYearRange: (start: number, end: number) => void;
  onSetSort: (s: SortOrder) => void;
  onReset: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/20">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View className="rounded-t-2xl bg-white pb-8 pt-3" style={{ maxHeight: '80%' }}>
          {/* Handle bar */}
          <View className="mb-4 h-1 w-8 self-center rounded-full bg-zinc-300" />

          <ScrollView className="px-5" showsVerticalScrollIndicator bounces={false}>
            {/* Header */}
            <View className="mb-5 flex-row items-center justify-between">
              <Text className="font-sans-semibold text-base text-zinc-900">Filters</Text>
              <Pressable onPress={onClose} className="rounded-md px-2 py-1 active:opacity-70">
                <Text className="font-sans-medium text-sm text-zinc-400">Done</Text>
              </Pressable>
            </View>

            {/* Year */}
            <Text className="mb-2 font-sans-semibold text-[11px] uppercase tracking-widest text-zinc-400">
              Year
            </Text>
            <View className="mb-5">
              <YearFilterSliders
                availableYears={availableYears}
                selectedYears={filters.years}
                billCountByYear={billCountByYear}
                onSetYearRange={onSetYearRange}
              />
            </View>

            {/* Stance */}
            <Text className="mb-2 font-sans-semibold text-[11px] uppercase tracking-widest text-zinc-400">
              Stance
            </Text>
            <View className="mb-5 flex-row flex-wrap gap-2">
              {STANCES.map((st) => {
                const isOn = filters.stances.has(st);
                return (
                  <Pressable
                    key={st}
                    onPress={() => onToggleStance(st)}
                    style={[
                      chipStyles.chip,
                      isOn && {
                        backgroundColor: STANCE_CHECK_BG[st],
                        borderColor: STANCE_CHECK_BG[st],
                      },
                    ]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {!isOn && (
                        <View
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 4,
                            backgroundColor: STANCE_DOT[st],
                          }}
                        />
                      )}
                      <Text style={[chipStyles.chipText, isOn && chipStyles.chipTextActive]}>
                        {STANCE_LABEL[st]} · {billCountByStance[st] ?? 0}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Status */}
            <Text className="mb-2 font-sans-semibold text-[11px] uppercase tracking-widest text-zinc-400">
              Status
            </Text>
            <View className="mb-5 flex-row flex-wrap gap-2">
              {availableStatuses.map((st) => {
                const isOn = filters.statuses.size === 0 || filters.statuses.has(st);
                return (
                  <Pressable
                    key={st}
                    onPress={() => onToggleStatus(st)}
                    style={[chipStyles.chip, isOn && chipStyles.chipActive]}>
                    <Text style={[chipStyles.chipText, isOn && chipStyles.chipTextActive]}>
                      {st} · {billCountByStatus[st] ?? 0}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Category */}
            <Text className="mb-2 font-sans-semibold text-[11px] uppercase tracking-widest text-zinc-400">
              Category
            </Text>
            <View className="mb-5 flex-row flex-wrap gap-2">
              {availableCategories.map((c) => {
                const isOn = filters.categories.size === 0 || filters.categories.has(c);
                return (
                  <Pressable
                    key={c}
                    onPress={() => onToggleCategory(c)}
                    style={[chipStyles.chip, isOn && chipStyles.chipActive]}>
                    <Text style={[chipStyles.chipText, isOn && chipStyles.chipTextActive]}>
                      {c.replace(/_/g, ' ')} · {billCountByCategory[c] ?? 0}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Sort */}
            <Text className="mb-2 font-sans-semibold text-[11px] uppercase tracking-widest text-zinc-400">
              Sort
            </Text>
            <View className="mb-5 flex-row gap-2">
              {(['newest', 'oldest'] as SortOrder[]).map((sortVal) => {
                const isOn = filters.sort === sortVal;
                return (
                  <Pressable
                    key={sortVal}
                    onPress={() => onSetSort(sortVal)}
                    style={[chipStyles.chip, isOn && chipStyles.chipActive]}>
                    <Text style={[chipStyles.chipText, isOn && chipStyles.chipTextActive]}>
                      {sortVal === 'newest' ? 'Newest first' : 'Oldest first'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Reset */}
            <Pressable onPress={onReset} className="mb-4">
              <Text className="font-sans-semibold text-xs text-blue-500">Reset all filters</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── Page component ───────────────────────────────

interface StateBillsPageProps {
  stateAbbr: string;
  stateName: string;
  status?: LegislativeStatus;
  /** When set, lists use API rows per tab (no client-side tab split). */
  apiBills?: { active: Bill[]; passed: Bill[] };
  /** Sum of `meta.totalCount` from both tab queries when available. */
  totalBillCount?: number;
  apiPagination?: {
    active: {
      hasNextPage: boolean;
      fetchNextPage: () => void;
      isFetchingNextPage: boolean;
    };
    passed: {
      hasNextPage: boolean;
      fetchNextPage: () => void;
      isFetchingNextPage: boolean;
    };
  };
  apiLoading?: { active: boolean; passed: boolean };
  apiErrors?: { active: string | null; passed: string | null };
  /** Legacy single error line when not using `apiErrors`. */
  errorMessage?: string | null;
  stateInfo?: {
    legislature: string;
    session: string;
    sessionWindow: string;
    stateLink: string;
    lastUpdated: string;
  };
  onSelectState?: (stateAbbr: string) => void;
  onBrowseMap?: () => void;
  onBillPress?: (billId: string, billTab: BillTab) => void;
  /** When set, dropdown list uses API order/names (GET /states). */
  stateDropdownOptions?: { abbr: string; name: string }[];
}

export function StateBillsPage({
  stateAbbr,
  stateName,
  status = 'mixed',
  apiBills,
  totalBillCount,
  apiPagination,
  apiLoading,
  apiErrors,
  errorMessage,
  stateInfo,
  onSelectState,
  onBrowseMap,
  onBillPress,
  stateDropdownOptions,
}: StateBillsPageProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  /** Larger Active/Passed control on desktop web only; native + narrow web stay compact. */
  const tabWebLarge = Platform.OS === 'web' && isWide;
  const pillInset = tabWebLarge ? PILL_INSET_WEB_WIDE : PILL_INSET;
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [pillSize, setPillSize] = useState({ w: 0, h: 0 });
  const slideAnim = useRef(new Animated.Value(0)).current;

  const mockBills = useMemo(
    () => getBillsForState({ stateAbbr, stateName, status }).map(mapBillDetailToBill),
    [stateAbbr, stateName, status]
  );

  const activeBills = useMemo(
    () => (apiBills ? apiBills.active : mockBills.filter((b) => b.billTab === 'active')),
    [apiBills, mockBills]
  );
  const passedBills = useMemo(
    () => (apiBills ? apiBills.passed : mockBills.filter((b) => b.billTab === 'passed')),
    [apiBills, mockBills]
  );

  const allBillsCount = useMemo(() => {
    if (totalBillCount != null) return totalBillCount;
    return activeBills.length + passedBills.length;
  }, [totalBillCount, activeBills.length, passedBills.length]);

  const {
    tab,
    switchTab,
    filters,
    activeFilterCount,
    activeCategories,
    activeYears,
    activeStatuses,
    availableCategories,
    availableYears,
    availableStatuses,
    filteredBills,
    sourceBills,
    searchQuery,
    setSearchQuery,
    toggleStance,
    toggleStatus,
    toggleCategory,
    pickCategoryFromSearch,
    setYearRange,
    setSort,
    resetAll,
  } = useBillFilters(activeBills, passedBills);

  const handleTabSwitch = useCallback(
    (key: BillTab) => {
      Animated.timing(slideAnim, {
        toValue: key === 'passed' ? 1 : 0,
        duration: 280,
        useNativeDriver: false,
      }).start();
      switchTab(key);
    },
    [slideAnim, switchTab]
  );

  const billCountByStance = useMemo(() => {
    const c: Record<string, number> = {};
    sourceBills.forEach((b) => {
      const st = b.stance ?? 'mixed';
      c[st] = (c[st] ?? 0) + 1;
    });
    return c;
  }, [sourceBills]);

  const billCountByCategory = useMemo(() => {
    const c: Record<string, number> = {};
    sourceBills.forEach((b) =>
      (b.issue_categories ?? []).forEach((cat) => {
        c[cat] = (c[cat] ?? 0) + 1;
      })
    );
    return c;
  }, [sourceBills]);

  const billCountByYear = useMemo(() => {
    const c: Record<number, number> = {};
    sourceBills.forEach((b) => {
      const y = b.year ?? new Date().getFullYear();
      c[y] = (c[y] ?? 0) + 1;
    });
    return c;
  }, [sourceBills]);

  const billCountByStatus = useMemo(() => {
    const c: Record<string, number> = {};
    sourceBills.forEach((b) => {
      const st = b.status_desc || '';
      if (st) c[st] = (c[st] ?? 0) + 1;
    });
    return c;
  }, [sourceBills]);

  const dashboardInfo = useMemo(
    () => ({
      name: stateName,
      abbr: stateAbbr,
      legislature: stateInfo?.legislature ?? 'State Legislature',
      session: stateInfo?.session ?? '2025–2026 Regular',
      sessionWindow: stateInfo?.sessionWindow ?? 'Jan – Sep',
      billCount: allBillsCount,
      lastUpdated: stateInfo?.lastUpdated ?? '',
      stateLink: stateInfo?.stateLink ?? `https://legislature.${stateAbbr.toLowerCase()}.gov/bills`,
    }),
    [stateName, stateAbbr, stateInfo, allBillsCount]
  );

  const tabLoading = apiLoading
    ? tab === 'active'
      ? apiLoading.active
      : apiLoading.passed
    : false;

  const tabError = apiErrors
    ? tab === 'active'
      ? apiErrors.active
      : apiErrors.passed
    : errorMessage;

  const currentPagination = apiPagination
    ? tab === 'active'
      ? apiPagination.active
      : apiPagination.passed
    : null;

  const sidebarProps = {
    filters,
    activeCategories,
    activeYears,
    activeStatuses,
    availableCategories,
    availableYears,
    availableStatuses,
    billCountByStance,
    billCountByCategory,
    billCountByYear,
    billCountByStatus,
    onToggleStance: toggleStance,
    onToggleStatus: toggleStatus,
    onToggleCategory: toggleCategory,
    onPickCategoryFromSearch: pickCategoryFromSearch,
    onSetYearRange: setYearRange,
    onSetSort: setSort,
    onReset: resetAll,
  };

  const { onPickCategoryFromSearch: _omitCategorySearchFromSheet, ...filterSheetProps } =
    sidebarProps;

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={[]}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <ScreenContent>
          {/* Dashboard */}
          <View className={Platform.OS === 'web' ? 'pt-4' : 'pt-2'}>
            <StateDashboard
              info={dashboardInfo}
              status={status}
              headerRight={
                <View className={Platform.OS !== 'web' || isWide ? 'flex-shrink-0' : 'w-full'}>
                  <StateDropdown
                    value={stateAbbr}
                    onChange={onSelectState ?? (() => {})}
                    placeholder="Switch state"
                    compactDisplay
                    stateOptions={stateDropdownOptions}
                  />
                </View>
              }
              headerStacked={Platform.OS === 'web' && !isWide}
            />
          </View>

          {/* Main card: flat border like StateDashboard (no elevation shadow) */}
          <View className="mt-3 rounded-xl border border-zinc-200 bg-white">
            <View className="px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-3.5">
              {/* Active / Passed segmented control */}
              <View
                className={tabWebLarge ? 'flex-row rounded-xl' : 'flex-row rounded-lg'}
                style={{ padding: pillInset, backgroundColor: 'rgba(244,244,245,0.95)' }}
                onLayout={(e) => {
                  const { width: w, height: h } = e.nativeEvent.layout;
                  setPillSize({ w, h });
                }}>
                {pillSize.w > 0 && (
                  <Animated.View
                    style={[
                      styles.pillThumb,
                      tabWebLarge && styles.pillThumbWeb,
                      {
                        top: pillInset,
                        width: (pillSize.w - pillInset * 2) / 2,
                        height: pillSize.h - pillInset * 2,
                        left: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [pillInset, pillInset + (pillSize.w - pillInset * 2) / 2],
                        }),
                      },
                    ]}
                  />
                )}
                {TAB_CONFIG.map(({ key, title, subtitle }) => {
                  const isActive = tab === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => handleTabSwitch(key)}
                      style={[styles.pillSegment, tabWebLarge && styles.pillSegmentWeb]}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: isActive }}>
                      <Text
                        className={[
                          'font-sans leading-normal',
                          tabWebLarge ? 'text-[15px]' : 'text-[13px]',
                          isActive ? 'font-sans-semibold text-zinc-900' : 'text-zinc-400',
                        ].join(' ')}>
                        {title}
                      </Text>
                      <Text
                        className={[
                          'font-sans leading-normal',
                          tabWebLarge ? 'text-[12px]' : 'text-[11px]',
                          isActive ? 'text-zinc-500' : 'text-zinc-400',
                        ].join(' ')}>
                        {subtitle}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Legend */}
              <StanceLegend />

              {/* Main content */}
              <View>
                <View className="flex-1 px-0 pt-2.5">
                  {/* Bill count + filters row */}
                  <View className="mb-2 flex-row items-center justify-between gap-2" style={{ zIndex: 50, position: 'relative' } as any}>
                    <Text className="shrink-0 font-sans text-[11px] leading-tight text-zinc-500">
                      {filteredBills.length} bill{filteredBills.length !== 1 ? 's' : ''}
                      {filteredBills.length > 0 ? (
                        <Text className="font-sans text-[11px] text-zinc-400">
                          {' · '}Tap a card for bill details
                        </Text>
                      ) : null}
                    </Text>

                    {/* Web: connected filter bar */}
                    {isWide && (
                      <View className="flex-row items-stretch overflow-visible rounded-xl border border-zinc-200/80 bg-white" style={{ zIndex: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
                        {activeFilterCount > 0 && (
                          <>
                            <Pressable
                              onPress={resetAll}
                              className="items-center justify-center px-2.5 active:opacity-70"
                              accessibilityLabel="Reset all filters">
                              <Text className="font-sans-bold text-[11px] text-zinc-400">✕</Text>
                            </Pressable>
                            <View className="w-px self-center bg-zinc-300" style={{ height: 18 }} />
                          </>
                        )}
                        <FilterBarYearSection
                          filters={filters}
                          availableYears={availableYears}
                          billCountByYear={billCountByYear}
                          onSetYearRange={setYearRange}
                        />
                        <View className="w-px self-center bg-zinc-300" style={{ height: 18 }} />
                        <FilterBarSection
                          label="Stance"
                          value={filters.stances.size === STANCES.length ? 'All' : `${filters.stances.size} of ${STANCES.length}`}
                          active={filters.stances.size < STANCES.length}
                          items={STANCES.map((s) => ({ key: s, label: STANCE_LABEL[s], count: billCountByStance[s] ?? 0, checked: filters.stances.has(s), dot: STANCE_CHECK_BG[s] }))}
                          onToggle={(key) => toggleStance(key as LegislativeStatus)}
                          onReset={() => { for (const s of STANCES) { if (!filters.stances.has(s)) toggleStance(s); } }}
                        />
                        <View className="w-px self-center bg-zinc-300" style={{ height: 18 }} />
                        <FilterBarSection
                          label="Status"
                          value={filters.statuses.size === 0 || filters.statuses.size === availableStatuses.length ? 'All' : `${filters.statuses.size} of ${availableStatuses.length}`}
                          active={filters.statuses.size > 0 && filters.statuses.size < availableStatuses.length && availableStatuses.length > 1}
                          items={availableStatuses.map((s) => ({ key: s, label: s, count: billCountByStatus[s] ?? 0, checked: filters.statuses.size === 0 || filters.statuses.has(s) }))}
                          onToggle={(key) => toggleStatus(key)}
                          onReset={() => { for (const s of availableStatuses) { if (!filters.statuses.has(s)) toggleStatus(s); } }}
                        />
                        <View className="w-px self-center bg-zinc-300" style={{ height: 18 }} />
                        <FilterBarCategorySection
                          filters={filters}
                          availableCategories={availableCategories}
                          billCountByCategory={billCountByCategory}
                          onToggleCategory={toggleCategory}
                          onPickCategoryFromSearch={pickCategoryFromSearch}
                        />
                        <View className="w-px self-center bg-zinc-300" style={{ height: 18 }} />
                        <Pressable
                          onPress={() => setSort(filters.sort === 'newest' ? 'oldest' : 'newest')}
                          className="justify-center px-3 py-1 active:bg-zinc-50"
                          style={{ width: 65 }}>
                          <View className="flex-row items-center gap-1">
                            <Text className="font-sans-medium text-[9.5px] uppercase tracking-wider text-zinc-600">Sort</Text>
                            <Text style={{ fontSize: 12, color: '#a1a1aa' }}>{filters.sort === 'newest' ? '▾' : '▴'}</Text>
                          </View>
                          <Text className="font-sans text-[11px] text-zinc-400">
                            {filters.sort === 'newest' ? 'Newest' : 'Oldest'}
                          </Text>
                        </Pressable>
                        <View className="w-px self-center bg-zinc-300" style={{ height: 18 }} />
                        <View className="flex-row items-center" style={{ width: 120 }}>
                          <View style={{ paddingLeft: 12 }}>
                            <Search size={13} color="#a1a1aa" />
                          </View>
                          <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search bills..."
                            placeholderTextColor="#a1a1aa"
                            className="flex-1 px-2 font-sans text-[12px] text-zinc-800"
                            style={{ height: '100%', ...({ outlineStyle: 'none' } as any) } as any}
                          />
                          {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery('')} className="pr-3 active:opacity-70">
                              <Text className="font-sans text-[12px] text-zinc-400">✕</Text>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Native: search box */}
                    {!isWide && (
                      <View className="shrink flex-row items-center rounded-lg border border-zinc-200 bg-white"
                        style={{ height: 28, minWidth: Platform.OS === 'web' ? 90 : 140, maxWidth: Platform.OS === 'web' ? 140 : 200 }}>
                        <View style={{ paddingLeft: 8 }}>
                          <Search size={12} color="#a1a1aa" />
                        </View>
                        <TextInput
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                          placeholder="Search bills..."
                          placeholderTextColor="#a1a1aa"
                          className="flex-1 px-1.5 font-sans text-[11px] text-zinc-800"
                          style={{ height: 28 }}
                        />
                        {searchQuery.length > 0 && (
                          <Pressable
                            onPress={() => setSearchQuery('')}
                            className="items-center justify-center pr-2 active:opacity-70"
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                            <Text className="font-sans text-[11px] text-zinc-400">✕</Text>
                          </Pressable>
                        )}
                      </View>
                    )}
                  </View>
                  <View className="gap-2.5" style={{ zIndex: 1, position: 'relative' } as any}>
                    {tabError ? (
                      <Text className="py-8 text-center font-sans text-sm text-zinc-400">
                        {tabError}
                      </Text>
                    ) : tabLoading && sourceBills.length === 0 ? (
                      <Text className="py-8 text-center font-sans text-sm text-zinc-400">
                        Loading bills...
                      </Text>
                    ) : (
                      <>
                        {filteredBills.length > 0 ? (
                          filteredBills.map((bill) => (
                            <StateBillCard
                              key={bill.id}
                              bill={bill}
                              onPress={(billId) => onBillPress?.(billId, tab)}
                            />
                          ))
                        ) : (
                          <Text className="py-8 text-center font-sans text-sm text-zinc-400">
                            No bills match the current filters.
                          </Text>
                        )}
                        {currentPagination?.hasNextPage && !tabError ? (
                          <Pressable
                            onPress={() => currentPagination.fetchNextPage()}
                            disabled={currentPagination.isFetchingNextPage}
                            className="items-center rounded-lg border border-zinc-200 bg-zinc-50 py-3 active:opacity-85"
                            accessibilityRole="button"
                            accessibilityLabel="Load more bills">
                            <Text className="font-sans-semibold text-sm text-zinc-700">
                              {currentPagination.isFetchingNextPage ? 'Loading…' : 'Load more'}
                            </Text>
                          </Pressable>
                        ) : null}
                      </>
                    )}
                  </View>
                </View>

              </View>
            </View>
          </View>
        </ScreenContent>
      </ScrollView>

      {/* Mobile: FAB filter button — positioned above tab bar */}
      {!isWide && (
        <Pressable
          onPress={() => setFilterSheetOpen(true)}
          className="absolute bottom-4 right-4 flex-row items-center gap-1.5 rounded-full px-4 py-2.5 active:opacity-85"
          style={[
            styles.fab,
            Platform.OS === 'web' ? ({ backdropFilter: 'blur(8px)' } as object) : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Open filters">
          <FilterIcon size={14} color="#fff" />
          <Text className="font-sans-semibold text-[12px] text-white">Filters</Text>
          {activeFilterCount > 0 && (
            <View className="ml-0.5 h-4 w-4 items-center justify-center rounded-full bg-white">
              <Text className="font-sans-semibold text-[9px] text-zinc-900">
                {activeFilterCount}
              </Text>
            </View>
          )}
        </Pressable>
      )}

      {/* Mobile: filter bottom sheet */}
      {!isWide && (
        <FilterBottomSheet
          visible={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          {...filterSheetProps}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────

const styles = StyleSheet.create({
  pillSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: 7,
    zIndex: 1,
  },
  pillSegmentWeb: {
    paddingVertical: 8,
    borderRadius: 8,
  },
  pillThumb: {
    position: 'absolute',
    borderRadius: 7,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(228,228,231,0.9)',
    zIndex: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  pillThumbWeb: {
    borderRadius: 8,
  },
  fab: {
    backgroundColor: 'rgba(24,24,27,0.90)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
});

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#e4e4e7',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: 'rgba(24,24,27,0.95)',
    borderColor: '#18181b',
  },
  chipText: {
    fontSize: 13,
    color: '#71717a',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
});
