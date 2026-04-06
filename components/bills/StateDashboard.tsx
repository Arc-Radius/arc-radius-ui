import type { ReactNode } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Landmark } from 'lucide-react-native';

import { STANCE_HEADER_GLASS } from '@/static/billConstants';
import type { LegislativeStatus } from '@/static/states';
import {
  SESSION_CALENDAR,
  getSessionStatus,
  formatSessionDate,
} from '@/static/sessionCalendar';

interface StateInfo {
  name: string;
  abbr: string;
  legislature: string;
  session: string;
  sessionWindow: string;
  billCount: number;
  lastUpdated: string;
  stateLink: string;
}

interface StateDashboardProps {
  info: StateInfo;
  status?: LegislativeStatus;
  headerRight?: ReactNode;
  headerStacked?: boolean;
}

const SESSION_STATUS_STYLES = {
  in_session: { label: 'In Session', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
  not_started: { label: 'Not Started', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  adjourned: { label: 'Adjourned', color: '#71717a', bg: 'rgba(113,113,122,0.1)' },
  no_session: { label: 'No Session', color: '#a1a1aa', bg: 'rgba(161,161,170,0.1)' },
};

export function StateDashboard({
  info,
  status = 'mixed',
  headerRight,
  headerStacked,
}: StateDashboardProps) {
  const fullUrl = info.stateLink
    ? info.stateLink.startsWith('http')
      ? info.stateLink
      : `https://${info.stateLink}`
    : '';

  const displayHost = fullUrl
    ? (() => {
        try {
          return new URL(fullUrl).hostname.replace(/^www\./, '');
        } catch {
          return info.stateLink;
        }
      })()
    : '';

  const headerStyle = STANCE_HEADER_GLASS[status];

  const cal = SESSION_CALENDAR[info.abbr];
  const sessionStatus = cal ? getSessionStatus(cal) : null;
  const sessionStyle = sessionStatus ? SESSION_STATUS_STYLES[sessionStatus] : null;

  return (
    <View
      className="overflow-hidden rounded-xl border bg-white"
      style={{ borderColor: headerStyle.border }}>
      {/* ── Header bar (climate-tinted) ── */}
      <View
        className="px-4 py-3"
        style={{
          backgroundColor: headerStyle.bg,
          borderBottomWidth: 0.5,
          borderBottomColor: headerStyle.border,
        }}>
        <View
          className={`gap-3 ${headerStacked ? 'flex-col' : 'flex-row items-center justify-between'}`}>
          <View className="flex-row items-center gap-2.5">
            <Landmark size={20} color="#71717a" strokeWidth={2} accessibilityElementsHidden />
            <Text className="font-sans-bold text-lg leading-tight tracking-tight text-zinc-900">
              {info.name}
            </Text>
            {displayHost ? (
              <Pressable
                className="flex-row items-center gap-1 active:opacity-70"
                onPress={() => Linking.openURL(fullUrl)}>
                <ExternalLinkIcon />
                <Text className="font-sans text-xs text-blue-500">{displayHost}</Text>
              </Pressable>
            ) : null}
          </View>
          {headerRight}
        </View>
      </View>

      {/* ── Session info rows ── */}
      <View>
        <StatRow
          label="Session"
          value={cal?.session || info.session || '—'}
          badge={sessionStyle ? { label: sessionStyle.label, color: sessionStyle.color, bg: sessionStyle.bg } : undefined}
          last={sessionStatus === 'no_session'}
        />
        {cal && sessionStatus !== 'no_session' && (
          <>
            <StatRow
              label="Convenes"
              value={formatSessionDate(cal.convenes)}
            />
            <StatRow
              label="Adjourns"
              value={formatSessionDate(cal.adjourns)}
              last={!cal.notes}
            />
          </>
        )}
        {cal?.notes && (
          <StatRow label="Notes" value={cal.notes} valueColor="#d97706" last />
        )}
      </View>
    </View>
  );
}

function StatRow({
  label,
  value,
  last,
  badge,
  valueColor,
}: {
  label: string;
  value: string;
  last?: boolean;
  badge?: { label: string; color: string; bg: string };
  valueColor?: string;
}) {
  return (
    <View
      className="flex-row items-center justify-between px-4 py-2.5"
      style={!last ? { borderBottomWidth: 0.5, borderBottomColor: '#e4e4e7' } : undefined}>
      <Text className="font-sans text-xs text-zinc-500">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Text className="font-sans-medium text-sm" style={{ color: valueColor ?? '#18181b' }}>
          {value}
        </Text>
        {badge && (
          <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: badge.bg }}>
            <Text className="font-sans-semibold text-[10px]" style={{ color: badge.color }}>
              {badge.label}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function ExternalLinkIcon() {
  return (
    <Svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3b82f6"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <Path d="M15 3h6v6" />
      <Path d="M10 14L21 3" />
    </Svg>
  );
}
