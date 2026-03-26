import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BillFilterSidebar } from './BillFilterSidebar';
import { StateBillCard } from './StateBillCard';
import { StateDashboard } from './StateDashboard';
import { StateDropdown } from './StateDropdown';
import { StanceLegend } from './StanceLegend';
import type { Bill, BillFilters, BillTab, SortOrder } from '../static/billConstants';
import { STANCE_CHECK_BG, STANCE_DOT, STANCE_LABEL } from '../static/billConstants';
import { getBillsForState } from '../static/bills';
import type { BillDetail } from '../static/bills';
import type { LegislativeStatus } from '../static/states';

// ── Constants ────────────────────────────────────

const STANCES: LegislativeStatus[] = ['supportive', 'harmful', 'mixed'];

const TAB_CONFIG: { key: BillTab; title: string; subtitle: string }[] = [
  { key: 'active', title: 'Active', subtitle: 'Bills' },
  { key: 'passed', title: 'Passed', subtitle: 'Bills' },
];

/** Track padding; desktop web uses a roomier inset for the larger tab. */
const PILL_INSET = 3;
const PILL_INSET_WEB_WIDE = 4;

// ── Helpers ──────────────────────────────────────

function mapBillDetailToBill(d: BillDetail, index: number): Bill {
  return {
    id: d.id,
    bill_number: `${d.title.split(' ')[1] ?? index + 1}`,
    title: d.title,
    description: d.summary,
    stance: d.status,
    billTab: d.billTab,
    status: 'In Committee',
    status_desc: '',
    last_action: '',
    last_action_date: new Date().toISOString().slice(0, 10),
    year: new Date().getFullYear(),
    primary_sponsor: '',
    issue_categories: d.tags,
  };
}

// ── Filter hook (embedded) ───────────────────────

function useBillFilters(activeBills: Bill[], passedBills: Bill[]) {
  const [tab, setTab] = useState<BillTab>('active');
  const [filters, setFilters] = useState<BillFilters>({
    stances: new Set<LegislativeStatus>(['supportive', 'harmful', 'mixed']),
    categories: new Set<string>(),
    years: new Set<number>(),
    sort: 'newest',
  });

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

  const activeCategories = useMemo(() => {
    if (filters.categories.size === 0) return new Set(availableCategories);
    const valid = new Set([...filters.categories].filter((c) => availableCategories.includes(c)));
    return valid.size === 0 ? new Set(availableCategories) : valid;
  }, [filters.categories, availableCategories]);

  const activeYears = useMemo(() => {
    if (filters.years.size === 0) return new Set(availableYears);
    const valid = new Set([...filters.years].filter((y) => availableYears.includes(y)));
    return valid.size === 0 ? new Set(availableYears) : valid;
  }, [filters.years, availableYears]);

  const filteredBills = useMemo(() => {
    const f = sourceBills.filter(
      (b) =>
        filters.stances.has(b.stance ?? 'mixed') &&
        (b.issue_categories ?? []).some((c) => activeCategories.has(c)) &&
        activeYears.has(b.year ?? new Date().getFullYear())
    );
    return f.sort((a, b) => {
      const da = new Date(a.last_action_date ?? 0).getTime();
      const db = new Date(b.last_action_date ?? 0).getTime();
      return filters.sort === 'newest' ? db - da : da - db;
    });
  }, [sourceBills, filters.stances, activeCategories, activeYears, filters.sort]);

  const toggleStance = useCallback((stance: LegislativeStatus) => {
    setFilters((prev) => {
      const next = new Set(prev.stances);
      next.has(stance) ? next.delete(stance) : next.add(stance);
      if (next.size === 0)
        return { ...prev, stances: new Set<LegislativeStatus>(['supportive', 'harmful', 'mixed']) };
      return { ...prev, stances: next };
    });
  }, []);

  const toggleCategory = useCallback(
    (cat: string) => {
      setFilters((prev) => {
        const base =
          prev.categories.size === 0 ? new Set(availableCategories) : new Set(prev.categories);
        base.has(cat) ? base.delete(cat) : base.add(cat);
        return { ...prev, categories: base.size === 0 ? new Set<string>() : base };
      });
    },
    [availableCategories]
  );

  const toggleYear = useCallback(
    (year: number) => {
      setFilters((prev) => {
        const base = prev.years.size === 0 ? new Set(availableYears) : new Set(prev.years);
        base.has(year) ? base.delete(year) : base.add(year);
        return { ...prev, years: base.size === 0 ? new Set<number>() : base };
      });
    },
    [availableYears]
  );

  const setSort = useCallback((sort: SortOrder) => {
    setFilters((prev) => ({ ...prev, sort }));
  }, []);

  const switchTab = useCallback((newTab: BillTab) => {
    setTab(newTab);
    setFilters((prev) => ({ ...prev, categories: new Set<string>(), years: new Set<number>() }));
  }, []);

  const resetAll = useCallback(() => {
    setFilters({
      stances: new Set<LegislativeStatus>(['supportive', 'harmful', 'mixed']),
      categories: new Set<string>(),
      years: new Set<number>(),
      sort: 'newest',
    });
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.stances.size < 3) count++;
    if (filters.categories.size > 0) count++;
    if (filters.years.size > 0) count++;
    if (filters.sort !== 'newest') count++;
    return count;
  }, [filters]);

  return {
    tab,
    switchTab,
    filters,
    activeFilterCount,
    activeCategories,
    activeYears,
    availableCategories,
    availableYears,
    filteredBills,
    sourceBills,
    toggleStance,
    toggleCategory,
    toggleYear,
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
  availableCategories,
  availableYears,
  billCountByStance,
  billCountByCategory,
  billCountByYear,
  onToggleStance,
  onToggleCategory,
  onToggleYear,
  onSetSort,
  onReset,
}: {
  visible: boolean;
  onClose: () => void;
  filters: BillFilters;
  activeCategories: Set<string>;
  activeYears: Set<number>;
  availableCategories: string[];
  availableYears: number[];
  billCountByStance: Record<string, number>;
  billCountByCategory: Record<string, number>;
  billCountByYear: Record<number, number>;
  onToggleStance: (s: LegislativeStatus) => void;
  onToggleCategory: (c: string) => void;
  onToggleYear: (y: number) => void;
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
            <Text className="mb-2 font-sans-semibold text-[10px] uppercase tracking-widest text-zinc-400">
              Year
            </Text>
            <View className="mb-5 flex-row flex-wrap gap-2">
              {availableYears.map((y) => {
                const isOn = activeYears.has(y);
                return (
                  <Pressable
                    key={y}
                    onPress={() => onToggleYear(y)}
                    style={[chipStyles.chip, isOn && chipStyles.chipActive]}>
                    <Text style={[chipStyles.chipText, isOn && chipStyles.chipTextActive]}>
                      {y} · {billCountByYear[y] ?? 0}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Stance */}
            <Text className="mb-2 font-sans-semibold text-[10px] uppercase tracking-widest text-zinc-400">
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

            {/* Category */}
            <Text className="mb-2 font-sans-semibold text-[10px] uppercase tracking-widest text-zinc-400">
              Category
            </Text>
            <View className="mb-5 flex-row flex-wrap gap-2">
              {availableCategories.map((c) => {
                const isOn = activeCategories.has(c);
                return (
                  <Pressable
                    key={c}
                    onPress={() => onToggleCategory(c)}
                    style={[chipStyles.chip, isOn && chipStyles.chipActive]}>
                    <Text style={[chipStyles.chipText, isOn && chipStyles.chipTextActive]}>
                      {c} · {billCountByCategory[c] ?? 0}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Sort */}
            <Text className="mb-2 font-sans-semibold text-[10px] uppercase tracking-widest text-zinc-400">
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
}

export function StateBillsPage({
  stateAbbr,
  stateName,
  status = 'mixed',
  stateInfo,
  onSelectState,
  onBrowseMap,
  onBillPress,
}: StateBillsPageProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  /** Larger Active/Passed control on desktop web only; native + narrow web stay compact. */
  const tabWebLarge = Platform.OS === 'web' && isWide;
  const pillInset = tabWebLarge ? PILL_INSET_WEB_WIDE : PILL_INSET;
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [pillSize, setPillSize] = useState({ w: 0, h: 0 });
  const slideAnim = useRef(new Animated.Value(0)).current;

  const allBills = useMemo(
    () =>
      getBillsForState({ stateAbbr, stateName, status }).map((d, i) => mapBillDetailToBill(d, i)),
    [stateAbbr, stateName, status]
  );

  const activeBills = useMemo(
    () => allBills.filter((b: Bill) => b.billTab === 'active'),
    [allBills]
  );
  const passedBills = useMemo(
    () => allBills.filter((b: Bill) => b.billTab === 'passed'),
    [allBills]
  );

  const {
    tab,
    switchTab,
    filters,
    activeFilterCount,
    activeCategories,
    activeYears,
    availableCategories,
    availableYears,
    filteredBills,
    sourceBills,
    toggleStance,
    toggleCategory,
    toggleYear,
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

  const dashboardInfo = useMemo(
    () => ({
      name: stateName,
      abbr: stateAbbr,
      legislature: stateInfo?.legislature ?? 'State Legislature',
      session: stateInfo?.session ?? '2025–2026 Regular',
      sessionWindow: stateInfo?.sessionWindow ?? 'Jan – Sep',
      billCount: allBills.length,
      lastUpdated: stateInfo?.lastUpdated ?? '',
      stateLink: stateInfo?.stateLink ?? `https://legislature.${stateAbbr.toLowerCase()}.gov/bills`,
    }),
    [stateName, stateAbbr, stateInfo, allBills.length]
  );

  const sidebarProps = {
    filters,
    activeCategories,
    activeYears,
    availableCategories,
    availableYears,
    billCountByStance,
    billCountByCategory,
    billCountByYear,
    onToggleStance: toggleStance,
    onToggleCategory: toggleCategory,
    onToggleYear: toggleYear,
    onSetSort: setSort,
    onReset: resetAll,
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={[]}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="w-full max-w-screen-lg self-center px-4 sm:px-6 md:px-8">
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
                  />
                </View>
              }
              headerStacked={Platform.OS === 'web' && !isWide}
            />
          </View>

          {/* Main card: flat border like StateDashboard (no elevation shadow) */}
          <View className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white">
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

              {/* Main: list + sidebar (desktop) or list only (mobile) */}
              <View className={isWide ? 'flex-row gap-5' : ''}>
                {/* Bill list */}
                <View className="flex-1 px-0 pt-2.5">
                  <Text className="mb-2 font-sans text-[11px] leading-tight text-zinc-500">
                    {filteredBills.length} bill{filteredBills.length !== 1 ? 's' : ''}
                    {filteredBills.length > 0 ? (
                      <Text className="font-sans text-[11px] text-zinc-400">
                        {' · '}Tap a card for the full bill
                      </Text>
                    ) : null}
                  </Text>
                  <View className="gap-2.5">
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
                  </View>
                </View>

                {/* Desktop: sidebar */}
                {isWide && <BillFilterSidebar {...sidebarProps} />}
              </View>
            </View>
          </View>
        </View>
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
          {...sidebarProps}
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
    backgroundColor: 'rgba(24,24,27,0.88)',
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
    backgroundColor: 'rgba(24,24,27,0.88)',
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
