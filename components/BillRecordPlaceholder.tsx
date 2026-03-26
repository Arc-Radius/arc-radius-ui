import { useState, type ReactNode } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import type { GraphBillRecord } from './billRecord';
import type { LegislativeStatus } from '../static/states';
import { STANCE_BADGE, STANCE_DOT } from '../static/billConstants';

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
  if (typeof v !== 'number' || !Number.isFinite(v)) return formatMeta(v);
  if (v > 0 && v <= 1) return `${(v * 100).toFixed(1)}%`;
  if (v > 1 && v <= 100) return `${Number.isInteger(v) ? String(v) : v.toFixed(1)}%`;
  return String(v);
}

function formatPassOrOverall(v: unknown): string {
  if (v === undefined || v === null) return '—';
  if (typeof v === 'string') return v;
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
      <Text className="text-[10px] text-zinc-400">{label}</Text>
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
              <MetadataCell label="label_source" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">
                  {formatMeta(g.label_source)}
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
            <View className="flex-row gap-0.5">
              <MetadataCell label="passed" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">{formatMeta(g.passed)}</Text>
              </MetadataCell>
              <MetadataCell label="failed" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">{formatMeta(g.failed)}</Text>
              </MetadataCell>
            </View>
            <View className="flex-row gap-0.5">
              <MetadataCell label="vetoed" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">{formatMeta(g.vetoed)}</Text>
              </MetadataCell>
              <MetadataCell label="r_sponsorship_ratio" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">
                  {typeof g.r_sponsorship_ratio === 'number' &&
                  Number.isFinite(g.r_sponsorship_ratio)
                    ? g.r_sponsorship_ratio.toFixed(1)
                    : formatMeta(g.r_sponsorship_ratio)}
                </Text>
              </MetadataCell>
            </View>
            <View className="flex-row gap-0.5">
              <MetadataCell label="pass_rate_gap" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">
                  {formatPassOrOverall(g.pass_rate_gap)}
                </Text>
              </MetadataCell>
              <MetadataCell label="overall_pass_rate" className="min-w-0 flex-1">
                <Text className="text-xs font-medium text-zinc-800">
                  {formatPassOrOverall(g.overall_pass_rate)}
                </Text>
              </MetadataCell>
            </View>
            <MetadataCell label="bipartisan_ratio" span>
              <Text className="text-xs font-medium text-zinc-800">
                {typeof g.bipartisan_ratio === 'number' && Number.isFinite(g.bipartisan_ratio)
                  ? g.bipartisan_ratio.toFixed(1)
                  : formatMeta(g.bipartisan_ratio)}
              </Text>
            </MetadataCell>
          </View>
        </View>
      )}
    </View>
  );
}
