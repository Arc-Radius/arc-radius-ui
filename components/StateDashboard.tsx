import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';

/*
 * ─────────────────────────────────────────────────────────────
 *  COLORS
 * ─────────────────────────────────────────────────────────────
 */
const C = {
  bg: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceMuted: '#F2F0EC',

  border: '#E5E2DC',

  ink: '#2C2820',
  text: '#1A1814',
  text2: '#5A564E',
  text3: '#8A857E',

  supportive: '#0072B2',
  supportiveBg: '#E8F2FA',
  mixed: '#E69F00',
  mixedBg: '#FEF5E0',
  harmful: '#D55E00',
  harmfulBg: '#FCEEE4',
} as const;

/*
 * ─────────────────────────────────────────────────────────────
 *  TYPES
 * ─────────────────────────────────────────────────────────────
 */
type LegislativeStatus = 'supportive' | 'mixed' | 'harmful';
type TabId = 'home' | 'bills' | 'ask' | 'crisis';

interface BillSummary {
  id: string;
  number: string;
  title: string;
  status: LegislativeStatus;
  date: string;
}

interface DashboardProps {
  stateAbbr: string;
  stateName: string;
  overallStatus: LegislativeStatus;
  activeBills: number;
  needsAttention: number;
  recentBills: BillSummary[];
  onBack?: () => void;
  onBillPress?: (billId: string) => void;
  onAskPress?: () => void;
  onTabPress?: (tab: TabId) => void;
  activeTab?: TabId;
}

const STATUS_CONFIG: Record<
  LegislativeStatus,
  { label: string; color: string; bg: string; description: string }
> = {
  supportive: {
    label: 'Supportive',
    color: C.supportive,
    bg: C.supportiveBg,
    description: 'This state has strong protections for LGBTQ+ youth.',
  },
  mixed: {
    label: 'Mixed',
    color: C.mixed,
    bg: C.mixedBg,
    description: 'This state has some protections, but also active risks.',
  },
  harmful: {
    label: 'High Risk',
    color: C.harmful,
    bg: C.harmfulBg,
    description: 'This state has active legislation that may affect your rights.',
  },
};

/*
 * ─────────────────────────────────────────────────────────────
 *  ICONS
 * ─────────────────────────────────────────────────────────────
 */
function IconBack() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5" />
      <Path d="M12 19l-7-7 7-7" />
    </Svg>
  );
}

function IconSettings() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={3} />
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </Svg>
  );
}

function IconHome({ active }: { active?: boolean }) {
  const color = active ? C.ink : C.text3;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <Path d="M9 22V12h6v10" />
    </Svg>
  );
}

function IconBills({ active }: { active?: boolean }) {
  const color = active ? C.ink : C.text3;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <Path d="M14 2v6h6" />
      <Path d="M16 13H8" />
      <Path d="M16 17H8" />
      <Path d="M10 9H8" />
    </Svg>
  );
}

function IconChat({ active }: { active?: boolean }) {
  const color = active ? C.ink : C.text3;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </Svg>
  );
}

function IconCrisis({ active }: { active?: boolean }) {
  const color = active ? C.harmful : C.text3;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

function IconChevron() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 18l6-6-6-6" />
    </Svg>
  );
}

function IconAlert() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.harmful} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <Path d="M12 9v4" />
      <Path d="M12 17h.01" />
    </Svg>
  );
}

/*
 * ─────────────────────────────────────────────────────────────
 *  STATUS CARD
 * ─────────────────────────────────────────────────────────────
 */
function StatusCard({ status }: { status: LegislativeStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <View
      className="rounded-xl p-5"
      style={{ backgroundColor: config.bg }}
      accessible
      accessibilityLabel={`Legislative climate: ${config.label}. ${config.description}`}
    >
      <View className="flex-row items-center gap-2 mb-2">
        <View
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: config.color }}
        />
        <Text className="text-lg font-bold" style={{ color: config.color }}>
          {config.label}
        </Text>
      </View>
      <Text className="text-sm leading-5" style={{ color: C.text2 }}>
        {config.description}
      </Text>
    </View>
  );
}

/*
 * ─────────────────────────────────────────────────────────────
 *  STAT BOX
 * ─────────────────────────────────────────────────────────────
 */
function StatBox({
  value,
  label,
  alert,
}: {
  value: number;
  label: string;
  alert?: boolean;
}) {
  return (
    <View
      className="flex-1 rounded-xl border p-4 items-center"
      style={{ backgroundColor: C.surface, borderColor: C.border }}
    >
      <View className="flex-row items-center gap-1.5">
        {alert && <IconAlert />}
        <Text
          className="text-2xl font-bold"
          style={{ color: alert ? C.harmful : C.ink }}
        >
          {value}
        </Text>
      </View>
      <Text
        className="text-xs font-medium mt-1"
        style={{ color: C.text3 }}
      >
        {label}
      </Text>
    </View>
  );
}

/*
 * ─────────────────────────────────────────────────────────────
 *  BILL ROW
 * ─────────────────────────────────────────────────────────────
 */
function BillRow({
  bill,
  onPress,
  isLast,
}: {
  bill: BillSummary;
  onPress?: () => void;
  isLast: boolean;
}) {
  const config = STATUS_CONFIG[bill.status];

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center py-3.5 active:opacity-70 ${
        !isLast ? 'border-b' : ''
      }`}
      style={{ borderColor: C.border }}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${bill.number}: ${bill.title}, ${config.label}`}
      accessibilityHint="View bill details"
    >
      {/* Status dot */}
      <View
        className="w-2.5 h-2.5 rounded-full mr-3"
        style={{ backgroundColor: config.color }}
      />

      {/* Bill info */}
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-bold" style={{ color: C.ink }}>
            {bill.number}
          </Text>
          <Text
            className="text-xs font-semibold px-1.5 py-0.5 rounded"
            style={{ color: config.color, backgroundColor: config.bg }}
          >
            {config.label}
          </Text>
        </View>
        <Text
          className="text-sm mt-0.5"
          style={{ color: C.text2 }}
          numberOfLines={1}
        >
          {bill.title}
        </Text>
      </View>

      {/* Date + chevron */}
      <View className="flex-row items-center gap-1 ml-2">
        <Text className="text-xs" style={{ color: C.text3 }}>
          {bill.date}
        </Text>
        <IconChevron />
      </View>
    </Pressable>
  );
}

/*
 * ─────────────────────────────────────────────────────────────
 *  ASK CARD
 * ─────────────────────────────────────────────────────────────
 */
function AskCard({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl border p-5 flex-row items-center gap-4 active:opacity-80"
      style={{ backgroundColor: C.surface, borderColor: C.border }}
      accessible
      accessibilityRole="button"
      accessibilityLabel="Ask about your rights"
      accessibilityHint="Opens the AI-powered question assistant"
    >
      <View
        className="w-11 h-11 rounded-full items-center justify-center"
        style={{ backgroundColor: C.surfaceMuted }}
      >
        <IconChat />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold" style={{ color: C.ink }}>
          Ask about your rights
        </Text>
        <Text className="text-xs mt-0.5" style={{ color: C.text3 }}>
          Get answers grounded in real legislative data
        </Text>
      </View>
      <IconChevron />
    </Pressable>
  );
}

/*
 * ─────────────────────────────────────────────────────────────
 *  SECTION HEADER
 * ─────────────────────────────────────────────────────────────
 */
function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row justify-between items-center mb-3">
      <Text
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: C.text3 }}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {actionLabel && (
        <Pressable onPress={onAction} accessible accessibilityRole="button" accessibilityLabel={actionLabel}>
          <Text className="text-xs font-semibold" style={{ color: C.supportive }}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/*
 * ─────────────────────────────────────────────────────────────
 *  BOTTOM TAB BAR
 * ─────────────────────────────────────────────────────────────
 */
const TABS: { id: TabId; label: string; Icon: React.FC<{ active?: boolean }> }[] = [
  { id: 'home', label: 'Home', Icon: IconHome },
  { id: 'bills', label: 'Bills', Icon: IconBills },
  { id: 'ask', label: 'Ask', Icon: IconChat },
  { id: 'crisis', label: 'Crisis', Icon: IconCrisis },
];

function BottomTabBar({
  activeTab = 'home',
  onTabPress,
}: {
  activeTab?: TabId;
  onTabPress?: (tab: TabId) => void;
}) {
  return (
    <View
      className="flex-row border-t pt-2 pb-1"
      style={{ backgroundColor: C.surface, borderColor: C.border }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <Pressable
            key={id}
            onPress={() => onTabPress?.(id)}
            className="flex-1 items-center py-1.5"
            accessible
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: active }}
          >
            <Icon active={active} />
            <Text
              className="text-xs mt-0.5 font-medium"
              style={{ color: active ? (id === 'crisis' ? C.harmful : C.ink) : C.text3 }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/*
 * ─────────────────────────────────────────────────────────────
 *  SAMPLE DATA
 * ─────────────────────────────────────────────────────────────
 */
const SAMPLE_BILLS: BillSummary[] = [
  {
    id: '1',
    number: 'SB 407',
    title: 'Nondiscrimination protections for trans youth in schools',
    status: 'supportive',
    date: 'Feb 12',
  },
  {
    id: '2',
    number: 'HB 68',
    title: 'Restrictions on gender-affirming care for minors',
    status: 'harmful',
    date: 'Feb 8',
  },
  {
    id: '3',
    number: 'AB 12',
    title: 'School bathroom and facilities policy update',
    status: 'mixed',
    date: 'Jan 30',
  },
  {
    id: '4',
    number: 'SB 221',
    title: 'Conversion therapy ban for minors',
    status: 'supportive',
    date: 'Jan 22',
  },
];

/*
 * ─────────────────────────────────────────────────────────────
 *  DASHBOARD SCREEN
 * ─────────────────────────────────────────────────────────────
 */
export default function StateDashboard({
  stateAbbr = 'CA',
  stateName = 'California',
  overallStatus = 'supportive',
  activeBills = 12,
  needsAttention = 3,
  recentBills = SAMPLE_BILLS,
  onBack,
  onBillPress,
  onAskPress,
  onTabPress,
  activeTab = 'home',
}: DashboardProps) {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: C.bg }}>
      {/* ─── CONTENT ──────────────────────────────── */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-3 w-full max-w-[640px] self-center">
          {/* ─── TOP BAR ────────────────────────────── */}
          <View className="flex-row justify-between items-center mb-6">
            <Pressable
              onPress={onBack}
              className="flex-row items-center gap-1.5 active:opacity-70"
              accessible
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <IconBack />
              <Text className="text-base font-bold" style={{ color: C.ink }}>
                {stateName}
              </Text>
            </Pressable>
            <Pressable
              className="p-2 rounded-lg active:opacity-70"
              accessible
              accessibilityRole="button"
              accessibilityLabel="Settings"
            >
              <IconSettings />
            </Pressable>
          </View>

          {/* ─── STATUS CARD ────────────────────────── */}
          <StatusCard status={overallStatus} />

          {/* ─── STATS ──────────────────────────────── */}
          <View className="flex-row gap-3 mt-4 mb-6">
            <StatBox value={activeBills} label="Active bills" />
            <StatBox value={needsAttention} label="Need attention" alert />
          </View>

          {/* ─── RECENT BILLS ───────────────────────── */}
          <SectionHeader
            title="What's happening"
            actionLabel="View all →"
            onAction={() => onTabPress?.('bills')}
          />
          <View
            className="rounded-xl border px-4 mb-6"
            style={{ backgroundColor: C.surface, borderColor: C.border }}
          >
            {recentBills.map((bill, i) => (
              <BillRow
                key={bill.id}
                bill={bill}
                onPress={() => onBillPress?.(bill.id)}
                isLast={i === recentBills.length - 1}
              />
            ))}
          </View>

          {/* ─── ASK ────────────────────────────────── */}
          <SectionHeader title="Have a question?" />
          <AskCard onPress={onAskPress} />

          {/* ─── QUICK ACTIONS ──────────────────────── */}
          <View className="mt-6">
            <SectionHeader title="Quick actions" />
            <View className="gap-2">
              {[
                { title: 'Contact your representatives', subtitle: 'Send a message to elected officials' },
                { title: 'Find legal aid', subtitle: 'LGBTQ+-affirming legal services near you' },
              ].map((action) => (
                <Pressable
                  key={action.title}
                  className="rounded-xl border px-4 py-3.5 flex-row items-center justify-between active:opacity-80"
                  style={{ backgroundColor: C.surface, borderColor: C.border }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={action.title}
                  accessibilityHint={action.subtitle}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-semibold" style={{ color: C.ink }}>
                      {action.title}
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: C.text3 }}>
                      {action.subtitle}
                    </Text>
                  </View>
                  <IconChevron />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ─── BOTTOM TABS ──────────────────────────── */}
      <BottomTabBar activeTab={activeTab} onTabPress={onTabPress} />
    </SafeAreaView>
  );
}
