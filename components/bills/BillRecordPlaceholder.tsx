import { useState, type ReactNode } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import type { GraphBillRecord } from './billRecord';
import type { LegislativeStatus } from '@/static/states';
import { STANCE_BADGE, STANCE_DOT } from '@/static/billConstants';

export type { GraphBillRecord } from './billRecord';

const STANCE_PILL_BORDER: Record<LegislativeStatus, string> = {
  supportive: 'rgba(147,197,253,0.45)',
  mixed: 'rgba(161,161,170,0.45)',
  harmful: 'rgba(253,186,116,0.45)',
};

function formatMeta(v: unknown): string {
  if (v === undefined || v === null) return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '—';
  if (typeof v === 'string' && v.trim() === '') return '—';
  return String(v);
}

function normalizeCommaSpaces(s: string): string {
  // Helps RN wrap long comma-separated category strings on mobile.
  return s.replace(/,\s*/g, ', ');
}

function formatPercentScore(v: unknown): string {
  if (v === undefined || v === null) return '—';
  let n: number;
  if (typeof v === 'string') {
    n = parseFloat(v);
    if (!Number.isFinite(n)) return v;
  } else if (typeof v === 'number' && Number.isFinite(v)) {
    n = v;
  } else {
    return formatMeta(v);
  }
  if (n >= 0 && n <= 1) return `${(n * 100).toFixed(1)}%`;
  if (n > 1 && n <= 100) return `${Number.isInteger(n) ? String(n) : n.toFixed(1)}%`;
  return String(n);
}

function formatPassOrOverall(v: unknown): string {
  if (v === undefined || v === null) return '—';
  if (typeof v === 'string') {
    const parsed = parseFloat(v);
    if (Number.isFinite(parsed)) {
      if (parsed >= -1 && parsed <= 1) return `${(parsed * 100).toFixed(1)}%`;
      if (parsed > 1 && parsed <= 100) return `${parsed}%`;
      return v;
    }
    return v;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    if (v >= 0 && v <= 1) return `${Math.round(v * 100)}%`;
    if (v > 1 && v <= 100) return `${v}%`;
    return String(v);
  }
  return formatMeta(v);
}

/** D → supportive colors, R → harmful. No dot, just the letter in a pill. */
function PartyChip({ value }: { value: string }) {
  const t = value.trim().toUpperCase();
  const sk: LegislativeStatus | null = t === 'D' ? 'supportive' : t === 'R' ? 'harmful' : null;
  if (!sk) {
    return <Text className="text-xs font-medium text-zinc-800">{value}</Text>;
  }
  return (
    <View
      className="mt-0.5 self-start rounded-full px-2 py-0.5"
      style={{
        backgroundColor: STANCE_BADGE[sk].bg,
        borderWidth: 1,
        borderColor: STANCE_PILL_BORDER[sk],
      }}>
      <Text className="text-[11px] font-medium" style={{ color: STANCE_BADGE[sk].text }}>
        {value.trim()}
      </Text>
    </View>
  );
}

function MetadataCell({
  label,
  children,
  span,
  className = '',
}: {
  label: string;
  children: ReactNode;
  span?: boolean;
  className?: string;
}) {
  return (
    <View
      className={`gap-1 rounded-md bg-zinc-50 px-2.5 py-2 ${span ? 'w-full self-stretch' : ''} ${className}`}>
      <Text className="text-[10px] text-zinc-400">{label.replace(/_/g, ' ')}</Text>
      {children}
    </View>
  );
}

const BILL_RECORD_TOGGLE_LABEL_STYLE = Platform.select({
  android: { includeFontPadding: false as const, lineHeight: 20 },
  default: { lineHeight: 20 },
});

function BillRecordToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      className="mb-2 flex-row items-center gap-1 self-start rounded-md py-0.5 active:opacity-70"
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={open ? 'Collapse bill record' : 'Expand bill record'}>
      <Text
        className="font-sans-semibold text-sm text-zinc-800"
        style={BILL_RECORD_TOGGLE_LABEL_STYLE}>
        Bill record
      </Text>
      <View
        className="h-5 w-[18px] items-center justify-center"
        style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
        <ChevronDown size={18} color="#71717a" strokeWidth={2} />
      </View>
    </Pressable>
  );
}

export function BillGraphRecordPlaceholder({
  values: g,
  stanceKey,
}: {
  values: Partial<GraphBillRecord>;
  stanceKey: LegislativeStatus;
}) {
  const [open, setOpen] = useState(true);

  return (
    <View>
      <BillRecordToggle open={open} onToggle={() => setOpen((o) => !o)} />
      {open && (
        <View className="rounded-xl border border-zinc-200 bg-white p-4">
          <Text className="mb-1.5 text-[11px] font-medium text-zinc-400">Identifiers</Text>
          <View className="mb-3 gap-0.5">
            <MetadataCell label="bill_pk" span>
              <Text className="font-mono text-[11px] text-zinc-800" selectable>
                {formatMeta(g.bill_pk)}
              </Text>
            </MetadataCell>
            <View className="flex-row gap-0.5">
              <MetadataCell label="bill_id" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">{formatMeta(g.bill_id)}</Text>
              </MetadataCell>
              <MetadataCell label="state" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">{formatMeta(g.state)}</Text>
              </MetadataCell>
            </View>
            <View className="flex-row gap-0.5">
              <MetadataCell label="session_id" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">
                  {formatMeta(g.session_id)}
                </Text>
              </MetadataCell>
              <MetadataCell label="bill_number" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">
                  {formatMeta(g.bill_number)}
                </Text>
              </MetadataCell>
            </View>
            <View className="flex-row gap-0.5">
              <MetadataCell label="year" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">{formatMeta(g.year)}</Text>
              </MetadataCell>
              <MetadataCell label="session_year" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">
                  {formatMeta(g.session_year)}
                </Text>
              </MetadataCell>
            </View>
          </View>

          <Text className="mb-1.5 text-[11px] font-medium text-zinc-400">Status</Text>
          <View className="mb-3 gap-0.5">
            <View className="flex-row gap-0.5">
              <MetadataCell label="status" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">{formatMeta(g.status)}</Text>
              </MetadataCell>
              <MetadataCell label="status_desc" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">
                  {formatMeta(g.status_desc)}
                </Text>
              </MetadataCell>
            </View>
            <View className="flex-row gap-0.5">
              <MetadataCell label="status_date" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">
                  {formatMeta(g.status_date)}
                </Text>
              </MetadataCell>
              <MetadataCell label="last_action_date" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">
                  {formatMeta(g.last_action_date)}
                </Text>
              </MetadataCell>
            </View>
            <MetadataCell label="last_action" span>
              <Text className="text-xs text-zinc-800">{formatMeta(g.last_action)}</Text>
            </MetadataCell>
          </View>

          <Text className="mb-1.5 text-[11px] font-medium text-zinc-400">Classification</Text>
          <View className="mb-3 gap-0.5">
            <View className="flex-row gap-0.5">
              <MetadataCell label="label" className="min-w-0 flex-1">
                <View
                  className="mt-0.5 flex-row items-center gap-1 self-start rounded-full px-2 py-0.5"
                  style={{
                    backgroundColor: STANCE_BADGE[stanceKey].bg,
                    borderWidth: 1,
                    borderColor: STANCE_PILL_BORDER[stanceKey],
                  }}>
                  <View
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: STANCE_DOT[stanceKey] }}
                  />
                  <Text
                    className="text-[11px] font-medium"
                    style={{ color: STANCE_BADGE[stanceKey].text }}>
                    {formatMeta(g.label)}
                  </Text>
                </View>
              </MetadataCell>
              <MetadataCell label="label source" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">
                  {g.label_source === 'aclu' ? 'ACLU' : g.label_source === 'plural' ? 'Plural' : formatMeta(g.label_source)}
                </Text>
              </MetadataCell>
            </View>
            <View className="flex-row gap-0.5">
              <MetadataCell label="confidence" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">
                  {formatPercentScore(g.confidence)}
                </Text>
              </MetadataCell>
              <MetadataCell label="relevance_score" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">
                  {formatPercentScore(g.relevance_score)}
                </Text>
              </MetadataCell>
            </View>
          </View>

          <Text className="mb-1.5 text-[11px] font-medium text-zinc-400">Issues</Text>
          <View className="mb-3 gap-0.5">
            <View className="flex-row gap-0.5">
              <MetadataCell label="issues" className="min-w-0 flex-1">
                <Text className="text-xs text-zinc-800">{formatMeta(g.issues)}</Text>
              </MetadataCell>
              <MetadataCell label="issue_categories" className="min-w-0 flex-1">
                <View className="w-full rounded-md bg-zinc-200/90 px-2 py-0.5">
                  <Text className="flex-shrink font-mono text-[11px] text-zinc-700" selectable>
                    {normalizeCommaSpaces(formatMeta(g.issue_categories))}
                  </Text>
                </View>
              </MetadataCell>
            </View>
          </View>

          <Text className="mb-1.5 text-[11px] font-medium text-zinc-400">Sponsors</Text>
          <View className="mb-3 flex-row gap-0.5">
            <MetadataCell label="sponsor_names" className="min-w-0 flex-1">
              <Text className="text-xs text-zinc-800">{formatMeta(g.sponsor_names)}</Text>
            </MetadataCell>
            <MetadataCell label="primary_sponsor" className="min-w-0 flex-1">
              <Text className="text-xs font-medium text-zinc-800">
                {formatMeta(g.primary_sponsor)}
              </Text>
            </MetadataCell>
          </View>

          <Text className="mb-1.5 text-[11px] font-medium text-zinc-400">Political features</Text>
          <View className="gap-0.5">
            <View className="flex-row gap-0.5">
              <MetadataCell label="state_lean" className="min-w-0 flex-1">
                <PartyChip value={formatMeta(g.state_lean)} />
              </MetadataCell>
              <MetadataCell label="bill_dominant_party" className="min-w-0 flex-1">
                <PartyChip value={formatMeta(g.bill_dominant_party)} />
              </MetadataCell>
            </View>
            <MetadataCell label="Sponsorship breakdown" span>
              {(() => {
                const raw = g.state_r_sponsorship_ratio;
                const n = typeof raw === 'string' ? parseFloat(raw) : typeof raw === 'number' ? raw : NaN;
                if (!Number.isFinite(n)) return <Text className="text-xs font-medium text-zinc-800">—</Text>;
                const rPct = n >= 0 && n <= 1 ? n * 100 : n;
                const dPct = 100 - rPct;
                return (
                  <View className="flex-row flex-wrap items-center gap-1">
                    <PartyChip value="D" />
                    <Text className="text-xs text-zinc-600">
                      {dPct.toFixed(0)}% sponsored
                    </Text>
                    <Text className="text-xs text-zinc-400">vs</Text>
                    <PartyChip value="R" />
                    <Text className="text-xs text-zinc-600">
                      {rPct.toFixed(0)}% sponsored
                    </Text>
                  </View>
                );
              })()}
              <Text className="mt-0.5 text-[10px] leading-tight text-zinc-400">
                Share of all bills in this state session by party
              </Text>
            </MetadataCell>
            <MetadataCell label="Party pass-rate gap" span>
              {(() => {
                const raw = g.pass_rate_gap;
                const n = typeof raw === 'string' ? parseFloat(raw) : typeof raw === 'number' ? raw : NaN;
                if (!Number.isFinite(n)) return <Text className="text-xs font-medium text-zinc-800">—</Text>;
                const abs = Math.abs(n >= -1 && n <= 1 ? n * 100 : n);
                const pct = `${abs.toFixed(1)}%`;
                const favorsR = n > 0;
                return (
                  <View className="flex-row flex-wrap items-center gap-1">
                    <PartyChip value={favorsR ? 'R' : 'D'} />
                    <Text className="text-xs text-zinc-600">
                      bills pass {pct} more than
                    </Text>
                    <PartyChip value={favorsR ? 'D' : 'R'} />
                    <Text className="text-xs text-zinc-600">bills</Text>
                  </View>
                );
              })()}
            </MetadataCell>
            <View className="flex-row gap-0.5">
              <MetadataCell label="Overall pass rate" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">
                  {formatPassOrOverall(g.overall_pass_rate)}
                </Text>
                <Text className="mt-0.5 text-[10px] leading-tight text-zinc-400">
                  Percentage of all bills that passed in this state session
                </Text>
              </MetadataCell>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
