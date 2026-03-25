/**
 * BillDetailPage — 1:1 React Native port of the web prototype BillDetailView.
 */
import { useCallback, useMemo, useState } from 'react';
import type { Href } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Sparkles,
  ScrollText,
  Megaphone,
  FileText,
  X,
  Check,
  Loader2,
  AlertCircle,
  LogIn,
} from 'lucide-react-native';

import {
  BillGraphRecordPlaceholder,
  type GraphBillRecord,
} from './BillRecordPlaceholder';
import type { BillTab } from '../static/billConstants';
import {
  STANCE_BADGE,
  STANCE_DOT,
  STANCE_HEADER_GLASS,
  STANCE_CHECK_BG,
} from '../static/billConstants';
import type { RelatedBill } from '../static/bills';
import type { LegislativeStatus } from '../static/states';

interface Sponsor {
  name: string;
  party: 'D' | 'R' | 'I';
}
interface HistoryEntry {
  date: string;
  chamber: string;
  action: string;
}
interface KeyDate {
  date: string;
  description: string;
  isPast?: boolean;
}
interface Study {
  title: string;
  authors: string;
  journal: string;
  year: number;
  finding: string;
  impactType: 'positive' | 'negative' | 'neutral';
  sampleSize?: string;
  doi?: string;
}
interface HealthImpact {
  category: string;
  direction: 'positive' | 'negative';
  magnitude: 'significant' | 'moderate' | 'minor';
  description: string;
}
interface SponsorContact {
  name: string;
  email?: string;
  phone?: string;
  office?: string;
  district?: string;
}

export interface Bill {
  id?: string;
  number?: string;
  title?: string;
  summary?: string;
  fullText?: string;
  state?: string;
  status?: string;
  progression?: number;
  lastAction?: string;
  lastActionDate?: string;
  pendingCommittee?: string;
  sponsors?: Sponsor[];
  spectrum?: 'Supportive' | 'Neutral' | 'Harmful';
  introducedDate?: string;
  history?: HistoryEntry[];
  subjects?: string[];
  similarBills?: string[];
  relatedBills?: RelatedBill[];
  keyDates?: KeyDate[];
  aiAnalysis?: {
    classification?: string;
    impactScore?: number;
    keyProvisions?: string[];
    potentialImpact?: string;
    legalContext?: string;
    recommendation?: string;
  };
  researchEvidence?: { studies?: Study[]; healthImpacts?: HealthImpact[]; dsTechnique?: string };
  sponsorContact?: SponsorContact;
  billTab?: BillTab;
}

const CONFIDENCE_DOT: Record<string, string> = {
  high: '#2563eb',
  medium: '#d97706',
  low: '#a1a1aa',
};

function RelatedBillsSection({
  relatedBills,
  onPressBill,
}: {
  relatedBills: RelatedBill[];
  onPressBill?: (billId: string) => void;
}) {
  if (relatedBills.length === 0) return null;
  const grouped = {
    high: relatedBills.filter((b) => b.confidence === 'high'),
    medium: relatedBills.filter((b) => b.confidence === 'medium'),
    low: relatedBills.filter((b) => b.confidence === 'low'),
  };
  const tiers = [
    { key: 'high' as const, label: 'High confidence', bills: grouped.high },
    { key: 'medium' as const, label: 'Medium confidence', bills: grouped.medium },
    { key: 'low' as const, label: 'Low confidence', bills: grouped.low },
  ].filter((t) => t.bills.length > 0);
  return (
    <View className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
      <Text className="mb-2 font-sans-semibold text-sm text-zinc-800">Related bills</Text>
      <View className="gap-3">
        {tiers.map((tier) => (
          <View key={tier.key}>
            <View className="mb-1.5 flex-row items-center gap-1.5">
              <View
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: CONFIDENCE_DOT[tier.key] }}
              />
              <Text className="font-sans text-[11px] text-zinc-400">{tier.label}</Text>
            </View>
            <View className="overflow-hidden rounded-lg border border-zinc-200">
              {tier.bills.map((rb, idx) => (
                <Pressable
                  key={rb.bill_id}
                  onPress={() => onPressBill?.(rb.bill_id)}
                  className="flex-row items-baseline justify-between gap-3 bg-white px-3.5 py-2.5 active:bg-zinc-50"
                  style={
                    idx < tier.bills.length - 1
                      ? { borderBottomWidth: 0.5, borderBottomColor: 'rgba(228,228,231,0.9)' }
                      : undefined
                  }>
                  <Text className="font-sans-semibold text-[13px] text-zinc-800">{rb.bill_id}</Text>
                  <Text className="flex-1 text-right font-sans text-xs text-zinc-400" numberOfLines={1}>
                    {rb.summary}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Segmented toggle: two options, no gap, left rounds left corners, right rounds right corners. */
function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  labels,
  accentBg,
  accentBorder,
  accentText,
}: {
  options: readonly [T, T];
  value: T;
  onChange: (v: T) => void;
  labels: Record<T, string>;
  accentBg: string;
  accentBorder: string;
  accentText: string;
}) {
  return (
    <View className="flex-row rounded-lg" style={{ backgroundColor: '#ffffff' }}>
      {options.map((opt, i) => {
        const active = value === opt;
        const isLeft = i === 0;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            className="flex-1 items-center justify-center py-2.5"
            style={[
              {
                backgroundColor: active ? accentBg : '#f4f4f5',
                borderRadius: 8,
                marginVertical: 4,
                marginHorizontal: 4,
              },
              isLeft
                ? { borderRightWidth: 2, borderRightColor: active ? accentBorder : 'transparent' }
                : { borderLeftWidth: 2, borderLeftColor: active ? accentBorder : 'transparent' },
            ]}>
            <Text
              className="font-sans-medium text-[13px]"
              style={{ color: active ? accentText : '#6b7280' }}>
              {labels[opt]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function spectrumToStance(spectrum: string | undefined): LegislativeStatus {
  const s = (spectrum ?? '').toLowerCase();
  if (s === 'supportive') return 'supportive';
  if (s === 'harmful') return 'harmful';
  return 'mixed';
}
function resolveStanceKey(raw: Bill): LegislativeStatus {
  if (raw.spectrum) return spectrumToStance(raw.spectrum);
  const s = raw.status;
  if (s === 'supportive' || s === 'harmful' || s === 'mixed') return s;
  return 'mixed';
}
function isLegislativeStanceStatus(s: string): boolean {
  const t = s.toLowerCase();
  return t === 'supportive' || t === 'harmful' || t === 'mixed';
}

const STANCE_WORD: Record<LegislativeStatus, string> = {
  supportive: 'supportive',
  harmful: 'harmful',
  mixed: 'neutral',
};
const STANCE_PILL_BORDER: Record<LegislativeStatus, string> = {
  supportive: 'rgba(147,197,253,0.45)',
  mixed: 'rgba(161,161,170,0.45)',
  harmful: 'rgba(253,186,116,0.45)',
};

const PILL_LABEL_TEXT_STYLE = Platform.select({
  android: { includeFontPadding: false as const, lineHeight: 14 },
  default: { lineHeight: 14 },
});
const HEADER_PILL_MIN_HEIGHT = 24;

const MOCK_BILL_TEXT = `SECTION 1. Title.\nThis act may be cited as the "Illustrative Civil Rights Update Act."\n\nSECTION 2. Definitions.\nFor purposes of this chapter:\n(a) "Gender identity" means a person's internal sense of gender, which may or may not align with sex assigned at birth.\n(b) "Sexual orientation" means emotional, romantic, or sexual attraction to other persons.\n\nSECTION 3. Public accommodations.\nA place of public accommodation may not discriminate on the basis of sexual orientation, gender identity, or gender expression in the provision of services, programs, or facilities.`;

const MOCK_LEGISLATIVE_HISTORY: HistoryEntry[] = [
  {
    date: 'Mar 4, 2025',
    chamber: 'House',
    action: 'Introduced and read first time. Referred to Committee on Judiciary.',
  },
  {
    date: 'Mar 11, 2025',
    chamber: 'House',
    action: 'Committee hearing held; public testimony received.',
  },
  {
    date: 'Mar 18, 2025',
    chamber: 'House',
    action: 'Placed on calendar for second reading (mock).',
  },
];

const MOCK_GRAPH_BILL_RECORD: Partial<GraphBillRecord> = {
  bill_pk: 'TX:1796:1398089',
  bill_id: '1398089',
  state: 'TX',
  session_id: '1796',
  bill_number: 'HB1234',
  year: 2024,
  session_year: 2024,
  title: 'An act relating to gender transition procedures for minors',
  description:
    'Prohibits gender transition surgeries and hormone therapy for individuals under 18 years of age.',
  status: '1',
  status_desc: 'Introduced',
  status_date: '2024-03-15',
  last_action_date: '2024-03-20',
  last_action: 'Referred to Health & Human Services Committee',
  label: 'harmful',
  label_source: 'legalbert',
  confidence: 99.5,
  relevance_score: 98.8,
  issues: 'Gender-affirming care',
  issue_categories: 'healthcare',
  sponsor_names: 'Smith, J / Garcia, R / Lee, M',
  primary_sponsor: 'Rep. John Smith',
  state_lean: 'R',
  bill_dominant_party: 'R',
  passed: false,
  failed: false,
  vetoed: false,
  r_sponsorship_ratio: 1,
  pass_rate_gap: '+12%',
  overall_pass_rate: '34%',
  bipartisan_ratio: 0,
};

// ── Action accent derived from stance key ────────

const ACTION_ACCENT: Record<
  LegislativeStatus,
  {
    glass: { bg: string; border: string };
    button: string;
    activeBg: string;
    activeBorder: string;
    activeText: string;
  }
> = {
  harmful: {
    glass: STANCE_HEADER_GLASS.harmful,
    button: STANCE_CHECK_BG.harmful,
    activeBg: STANCE_HEADER_GLASS.harmful.bg,
    activeBorder: STANCE_CHECK_BG.harmful,
    activeText: STANCE_BADGE.harmful.text,
  },
  supportive: {
    glass: STANCE_HEADER_GLASS.supportive,
    button: STANCE_CHECK_BG.supportive,
    activeBg: STANCE_HEADER_GLASS.supportive.bg,
    activeBorder: STANCE_CHECK_BG.supportive,
    activeText: STANCE_BADGE.supportive.text,
  },
  mixed: {
    glass: STANCE_HEADER_GLASS.mixed,
    button: STANCE_CHECK_BG.mixed,
    activeBg: STANCE_HEADER_GLASS.mixed.bg,
    activeBorder: STANCE_CHECK_BG.mixed,
    activeText: STANCE_BADGE.mixed.text,
  },
};

export function BillDetailPage({
  bill: rawBill,
  onClose,
  stateName: _stateName,
  relatedBills: _relatedBills,
  billTab: billTabProp,
}: {
  bill: Bill | null | undefined;
  onClose?: () => void;
  stateName?: string;
  relatedBills?: unknown[];
  billTab?: BillTab;
}) {
  const raw = rawBill ?? ({} as Bill);
  const stanceKey = resolveStanceKey(raw);
  const router = useRouter();
  const { state: stateParam } = useLocalSearchParams<{ state?: string | string[] }>();
  const stateAbbrFromRoute = useMemo(() => {
    const r = Array.isArray(stateParam) ? stateParam[0] : stateParam;
    return typeof r === 'string' ? r.trim().toUpperCase() : '';
  }, [stateParam]);
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else if (stateAbbrFromRoute) {
      router.replace(`/state/${stateAbbrFromRoute}` as Href);
    }
  }, [onClose, router, stateAbbrFromRoute]);
  const ai = raw.aiAnalysis ?? {};
  const re = raw.researchEvidence;
  const sc = raw.sponsorContact;

  const bill = {
    id: raw.id ?? '',
    number: raw.number ?? '',
    title: raw.title ?? '',
    summary: raw.summary ?? '',
    fullText: raw.fullText ?? '',
    state: raw.state ?? '',
    status: raw.status ?? '',
    progression: raw.progression ?? 0,
    lastAction: raw.lastAction ?? '',
    lastActionDate: raw.lastActionDate ?? '',
    pendingCommittee: raw.pendingCommittee ?? '',
    sponsors: raw.sponsors ?? [],
    spectrum: raw.spectrum ?? ('Neutral' as const),
    introducedDate: raw.introducedDate ?? '',
    history: raw.history ?? [],
    subjects: raw.subjects ?? [],
    similarBills: raw.similarBills ?? [],
    relatedBills: raw.relatedBills ?? [],
    keyDates: raw.keyDates ?? [],
    aiAnalysis: {
      classification: ai.classification ?? '',
      impactScore: ai.impactScore ?? 0,
      keyProvisions: ai.keyProvisions ?? [],
      potentialImpact: ai.potentialImpact ?? '',
      legalContext: ai.legalContext ?? '',
      recommendation: ai.recommendation ?? '',
    },
    researchEvidence: re
      ? {
          studies: re.studies ?? [],
          healthImpacts: re.healthImpacts ?? [],
          dsTechnique: re.dsTechnique ?? '',
        }
      : undefined,
    sponsorContact: sc
      ? {
          name: sc.name ?? '',
          email: sc.email ?? '',
          phone: sc.phone ?? '',
          office: sc.office ?? '',
          district: sc.district ?? '',
        }
      : undefined,
    billTab: billTabProp ?? raw.billTab ?? 'active',
  };

  const graphRecordValues = useMemo((): Partial<GraphBillRecord> => {
    const r = (rawBill ?? {}) as Bill & Partial<GraphBillRecord> & { tags?: string[] };
    const sponsorLine = bill.sponsors
      .map((s) => s.name)
      .filter(Boolean)
      .join(', ');
    const spectrumLabel =
      bill.spectrum === 'Harmful'
        ? 'harmful'
        : bill.spectrum === 'Supportive'
          ? 'supportive'
          : 'mixed';
    let year = r.year;
    if (year === undefined && bill.introducedDate && bill.introducedDate.length >= 4) {
      const n = parseInt(bill.introducedDate.slice(0, 4), 10);
      if (Number.isFinite(n)) year = n;
    }
    const m = MOCK_GRAPH_BILL_RECORD;
    const str = (v: string | undefined, fb?: string) =>
      v !== undefined && String(v).trim() !== '' ? v : fb;
    const num = (v: number | undefined, fb?: number) =>
      v !== undefined && Number.isFinite(v) ? v : fb;
    const snp = (
      v: number | string | undefined,
      fb?: number | string
    ): number | string | undefined => {
      if (v === undefined || v === null) return fb;
      if (typeof v === 'string' && v.trim() === '') return fb;
      return v;
    };
    const pk =
      str(r.bill_pk, bill.state && bill.id ? `${bill.state}:${bill.id}` : undefined) ?? m.bill_pk;
    const bsg = (): string | undefined => {
      const bs = bill.status?.trim() ?? '';
      return !bs || isLegislativeStanceStatus(bs) ? undefined : bill.status;
    };
    return {
      bill_pk: pk,
      bill_id: str(r.bill_id, bill.id || undefined) ?? m.bill_id,
      state: str(bill.state || r.state, undefined) ?? m.state,
      session_id: str(r.session_id, undefined) ?? m.session_id,
      bill_number: str(bill.number || r.bill_number, undefined) ?? m.bill_number,
      title: str(bill.title, undefined) ?? m.title,
      description: str(r.description ?? bill.summary, undefined) ?? m.description,
      status: str(r.status, undefined) ?? str(bsg(), undefined) ?? m.status,
      status_desc: str(r.status_desc, undefined) ?? m.status_desc,
      status_date: str(r.status_date ?? bill.introducedDate, undefined) ?? m.status_date,
      url: r.url,
      state_link: r.state_link,
      label: str(r.label, spectrumLabel) ?? m.label,
      label_source: str(r.label_source, undefined) ?? m.label_source,
      confidence: num(r.confidence, m.confidence),
      relevance_score: num(r.relevance_score, m.relevance_score),
      issues:
        str(r.issues, bill.subjects.length ? bill.subjects.join(', ') : undefined) ?? m.issues,
      issue_categories:
        str(r.issue_categories, r.tags?.length ? JSON.stringify(r.tags) : undefined) ??
        m.issue_categories,
      sponsor_names: str(r.sponsor_names, sponsorLine || undefined) ?? m.sponsor_names,
      primary_sponsor: str(r.primary_sponsor, bill.sponsors[0]?.name) ?? m.primary_sponsor,
      last_action: str(r.last_action, bill.lastAction || undefined) ?? m.last_action,
      last_action_date:
        str(r.last_action_date, bill.lastActionDate || undefined) ?? m.last_action_date,
      year: num(year, m.year),
      session_year: num(r.session_year ?? year, m.session_year),
      state_lean: str(r.state_lean, undefined) ?? m.state_lean,
      bill_dominant_party: str(r.bill_dominant_party, undefined) ?? m.bill_dominant_party,
      passed: r.passed ?? (bill.billTab === 'passed' ? true : m.passed),
      failed: r.failed ?? m.failed,
      vetoed: r.vetoed ?? m.vetoed,
      r_sponsorship_ratio: num(r.r_sponsorship_ratio, m.r_sponsorship_ratio),
      pass_rate_gap: snp(r.pass_rate_gap, m.pass_rate_gap),
      overall_pass_rate: snp(r.overall_pass_rate, m.overall_pass_rate),
      bipartisan_ratio: num(r.bipartisan_ratio, m.bipartisan_ratio),
    };
  }, [rawBill, bill]);

  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'action'>('summary');
  const [draftLetter, setDraftLetter] = useState<string | null>(null);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'email' | 'phone'>('email');
  const [tone, setTone] = useState<'formal' | 'conversational'>('formal');
  const [reportModal, setReportModal] = useState<'closed' | 'form' | 'submitted'>('closed');
  const [personalContext, setPersonalContext] = useState('');
  const [selectedRefine, setSelectedRefine] = useState<string | null>(null);

  const letterStance: 'support' | 'oppose' = stanceKey === 'harmful' ? 'oppose' : 'support';
  const accent = ACTION_ACCENT[stanceKey];

  const generateLetter = async () => {
    setIsGeneratingLetter(true);
    await new Promise((r) => setTimeout(r, 1500));
    const rep = bill.sponsors?.[0]?.name || 'Honorable Legislator';
    const ctx = personalContext.trim().length > 0 ? `\n\n${personalContext.trim()}\n` : '';
    const toneNote = tone === 'formal' ? '' : '\n\n(Tone: conversational.)';
    const fmtNote =
      format === 'phone' ? '\n\n(Format: phone script — keep sentences speakable.)' : '';
    const template =
      letterStance === 'support'
        ? `Dear ${rep},\n\nI am writing to express my strong SUPPORT for ${bill.number} - ${bill.title}.${ctx}${toneNote}${fmtNote}\n\nAs a constituent who cares deeply about LGBTQ+ rights and wellbeing, I believe this legislation is an important step forward for our community.\n\nThank you for your leadership on this issue.\n\nRespectfully,\n[Your Name]\n[Your Address]`
        : `Dear ${rep},\n\nI am writing to express my strong OPPOSITION to ${bill.number} - ${bill.title}.${ctx}${toneNote}${fmtNote}\n\nAs a constituent concerned about the wellbeing of LGBTQ+ individuals in our state, I urge you to reconsider this legislation.\n\nI ask that you vote NO on this bill.\n\nRespectfully,\n[Your Name]\n[Your Address]`;
    setSelectedRefine(null);
    setDraftLetter(template);
    setIsGeneratingLetter(false);
  };

  const copyToClipboard = (_text: string) => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Copied', 'Text copied to clipboard.');
  };

  const tabStanceHighlight = useMemo(
    () => ({
      border: STANCE_HEADER_GLASS[stanceKey].border,
      bg: STANCE_HEADER_GLASS[stanceKey].bg,
      iconActive: STANCE_BADGE[stanceKey].text,
    }),
    [stanceKey]
  );

  const partyColor = (party: string) => {
    if (party === 'D')
      return { bg: STANCE_BADGE.supportive.bg, text: STANCE_BADGE.supportive.text };
    if (party === 'R') return { bg: STANCE_BADGE.harmful.bg, text: STANCE_BADGE.harmful.text };
    return { bg: STANCE_BADGE.mixed.bg, text: STANCE_BADGE.mixed.text };
  };

  const tabDef = [
    { key: 'summary' as const, label: 'Summary', Icon: Sparkles },
    { key: 'details' as const, label: 'Details', Icon: ScrollText },
    { key: 'action' as const, label: 'Take Action', Icon: Megaphone },
  ];

  const detailBillText = useMemo(() => bill.fullText?.trim() || MOCK_BILL_TEXT, [bill.fullText]);
  const detailHistory = useMemo(
    () => (bill.history.length > 0 ? bill.history : MOCK_LEGISLATIVE_HISTORY),
    [bill.history]
  );
  const { width: windowWidth } = useWindowDimensions();
  const tabStripCompactWeb = Platform.OS === 'web' && windowWidth < 640;
  const headerGlass = STANCE_HEADER_GLASS[stanceKey];

  return (
    <View className="flex-1 bg-app-bg">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="w-full max-w-screen-lg self-center px-4 sm:px-6 md:px-8">
          <View className={Platform.OS === 'web' ? 'pt-4' : 'pt-2'}>
            <View
              className="flex-1 overflow-hidden rounded-xl border bg-white"
              style={{ borderColor: headerGlass.border }}>
              {/* ═══ HEADER ═══ */}
              <View
                className="p-4 sm:p-5"
                style={{
                  backgroundColor: headerGlass.bg,
                  borderBottomWidth: 0.5,
                  borderBottomColor: headerGlass.border,
                }}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="min-w-0 flex-1 pr-1">
                    <View className="flex-row items-center gap-2.5">
                      <FileText
                        size={20}
                        color="#71717a"
                        strokeWidth={2}
                        accessibilityElementsHidden
                      />
                      <View className="min-w-0 flex-1 flex-row flex-wrap items-center gap-x-4 gap-y-1.5">
                        <Text className="min-w-0 flex-shrink font-sans-bold text-lg leading-tight tracking-tight text-zinc-900">
                          {bill.title}
                        </Text>
                        <View className="shrink-0 flex-row items-center gap-2">
                          <View
                            className="flex-row items-center gap-1 rounded-full px-2 py-0.5"
                            style={{
                              minHeight: HEADER_PILL_MIN_HEIGHT,
                              backgroundColor: STANCE_BADGE[stanceKey].bg,
                              borderWidth: 1,
                              borderColor: STANCE_PILL_BORDER[stanceKey],
                            }}>
                            <View
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: STANCE_DOT[stanceKey] }}
                            />
                            <Text
                              className="font-sans-semibold text-xs leading-none tracking-tight"
                              style={[
                                { color: STANCE_BADGE[stanceKey].text },
                                PILL_LABEL_TEXT_STYLE,
                              ]}>
                              {STANCE_WORD[stanceKey]}
                            </Text>
                          </View>
                          <View
                            className="flex-row items-center justify-center rounded-full border border-zinc-200/90 bg-zinc-100/90 px-2 py-0.5"
                            style={{ minHeight: HEADER_PILL_MIN_HEIGHT }}>
                            <Text
                              className="font-sans-semibold text-xs leading-none tracking-tight text-zinc-600"
                              style={PILL_LABEL_TEXT_STYLE}>
                              {bill.billTab === 'passed' ? 'Passed' : 'Active'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <View className="mt-1.5 flex-row flex-wrap items-center gap-2">
                      {bill.number ? (
                        <Text className="font-mono text-xs text-zinc-500">{bill.number}</Text>
                      ) : null}
                      {bill.status && !isLegislativeStanceStatus(bill.status) ? (
                        <View className="rounded-md bg-zinc-200/90 px-2 py-0.5">
                          <Text className="font-sans text-xs text-zinc-700">{bill.status}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className="mt-2 font-sans text-sm leading-relaxed text-zinc-600">
                      {bill.summary}
                    </Text>
                  </View>
                  <Pressable
                    onPress={handleClose}
                    className="h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200/90 bg-white/70 active:opacity-70"
                    accessibilityRole="button"
                    accessibilityLabel="Back to state bills">
                    <X size={13} color="#71717a" strokeWidth={2} />
                  </Pressable>
                </View>
                <View className="mt-3 flex-row flex-wrap items-center gap-2">
                  <Text className="font-sans text-xs text-zinc-500">Sponsors:</Text>
                  {bill.sponsors.map((sponsor, idx) => {
                    const pc = partyColor(sponsor.party);
                    return (
                      <View
                        key={idx}
                        className="rounded px-2 py-0.5"
                        style={{ backgroundColor: pc.bg }}>
                        <Text className="font-sans-medium text-xs" style={{ color: pc.text }}>
                          {sponsor.name}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <Text className="mt-2 font-sans text-xs text-zinc-500">
                  <Text className="font-sans-semibold text-zinc-600">Last Action Date: </Text>
                  {bill.lastActionDate?.trim() ? bill.lastActionDate : '—'}
                </Text>
              </View>

              {/* ═══ TABS ═══ */}
              <View className="flex-row rounded-lg border-b border-zinc-200">
                {tabDef.map(({ key, label, Icon }) => {
                  const active = activeTab === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setActiveTab(key)}
                      className={
                        tabStripCompactWeb
                          ? 'flex-1 flex-row items-center justify-center gap-1.5 px-2 py-2.5'
                          : 'flex-1 flex-row items-center justify-center gap-2 px-4 py-3'
                      }
                      style={[
                        {
                          borderBottomWidth: 2,
                          borderBottomColor: active ? tabStanceHighlight.border : 'transparent',
                          backgroundColor: active ? tabStanceHighlight.bg : 'transparent',
                          borderRadius: 8,
                          marginVertical: 4,
                          marginHorizontal: 4,
                        },
                      ]}>
                      <Icon
                        size={tabStripCompactWeb ? 14 : 16}
                        color={active ? tabStanceHighlight.iconActive : '#6b7280'}
                      />
                      <Text
                        className={
                          tabStripCompactWeb
                            ? 'font-sans-semibold text-[13px] leading-tight'
                            : 'font-sans-semibold text-sm'
                        }
                        style={{ color: active ? tabStanceHighlight.iconActive : '#6b7280' }}
                        numberOfLines={1}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* ═══ TAB CONTENT ═══ */}
              <View className="p-4">
                {/* ── SUMMARY ── */}
                {activeTab === 'summary' && (
                  <View className="gap-6">
                    <View>
                      <Text className="mb-2 font-sans-semibold text-sm text-zinc-800">
                        What it means
                      </Text>
                      <View className="rounded-xl border border-zinc-200/90 bg-zinc-50/90 p-4">
                        <Text className="mb-2 font-sans-medium text-[11px] uppercase tracking-wide text-zinc-400">
                          RAG answer (mock)
                        </Text>
                        <Text className="font-sans text-sm leading-relaxed text-zinc-600">
                          Retrieved chunks from the bill text and committee analyses are condensed
                          here.
                          {bill.summary
                            ? ` In short: ${bill.summary}`
                            : ' This measure updates definitions, eligibility, and enforcement pathways.'}{' '}
                          Confidence is labeled high for definitional sections and medium where
                          fiscal or interagency effects depend on rulemaking.
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Text className="mb-2 font-sans-semibold text-sm text-zinc-800">
                        Why it matters
                      </Text>
                      <View className="rounded-xl border border-zinc-200/90 bg-zinc-50/90 p-4">
                        <Text className="font-sans text-sm leading-relaxed text-zinc-600">
                          Stakeholders in {bill.state || 'this state'} could see changes to how
                          complaints are filed, which agencies enforce the rules, and what timelines
                          apply. Advocacy groups often highlight implementation and compliance
                          windows as the highest-risk phase for LGBTQ+ residents when policy
                          shifts—this summary is illustrative until live data is wired to Arc
                          Radius.
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* ── DETAILS ── */}
                {activeTab === 'details' && (
                  <View className="gap-5">
                    <View>
                      <Text className="mb-2 font-sans-semibold text-sm text-zinc-800">
                        Bill text
                      </Text>
                      <View className="rounded-xl border border-zinc-200 bg-white p-4">
                        <ScrollView
                          className="max-h-52 rounded-lg bg-zinc-50 p-3"
                          nestedScrollEnabled>
                          <Text className="font-sans text-xs leading-5 text-zinc-600">
                            {detailBillText}
                          </Text>
                        </ScrollView>
                      </View>
                    </View>
                    <BillGraphRecordPlaceholder values={graphRecordValues} stanceKey={stanceKey} />
                    <View>
                      <Text className="mb-2 font-sans-semibold text-sm text-zinc-800">
                        Legislative history
                      </Text>
                      <View className="rounded-xl border border-zinc-200 bg-white p-4">
                        {detailHistory.map((entry, i) => (
                          <View
                            key={i}
                            className="mb-3.5 pb-3.5"
                            style={
                              i < detailHistory.length - 1
                                ? {
                                    borderBottomWidth: 0.5,
                                    borderBottomColor: 'rgba(228,228,231,0.9)',
                                  }
                                : { paddingBottom: 0, marginBottom: 0 }
                            }>
                            <Text className="mb-1 font-sans text-[11px] text-zinc-400">
                              {entry.date}
                              {entry.chamber ? ` · ${entry.chamber}` : ''}
                            </Text>
                            <Text className="font-sans text-[13px] leading-relaxed text-zinc-800">
                              {entry.action}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* ── TAKE ACTION ── */}
                {activeTab === 'action' && (
                  <View className="gap-3">
                    {/* Idle state */}
                    {!draftLetter && (
                      <View className="gap-3">
                        {/* Options card */}
                        <View className="gap-4 rounded-xl border border-zinc-200 bg-white p-4">
                          {/* Classification + recipient */}
                          <View className="gap-2">
                            <View className="flex-row items-baseline justify-between">
                              <Text className="font-sans text-sm text-zinc-500" >Stance:</Text>
                              <Text
                                className="font-sans-medium text-sm"
                                style={{ color: STANCE_BADGE[stanceKey].text }}>
                                {STANCE_WORD[stanceKey]}
                              </Text>
                            </View>
                            <View className="flex-row items-baseline justify-between">
                              <Text className="font-sans text-sm text-zinc-500" >Confidence:</Text>
                              <Text
                                className="font-sans-medium text-sm"
                                style={{ color: STANCE_BADGE[stanceKey].text }}>
                                {graphRecordValues.confidence != null
                                  ? `${
                                      typeof graphRecordValues.confidence === 'number' &&
                                      graphRecordValues.confidence <= 1
                                        ? (graphRecordValues.confidence * 100).toFixed(1)
                                        : graphRecordValues.confidence
                                    }%`
                                  : '—'}
                              </Text>
                            </View>
                            <View className="flex-row items-baseline justify-between">
                              <Text className="font-sans text-sm text-zinc-500" >To:</Text>
                              <Text className="font-sans-medium text-sm text-zinc-900">
                                {bill.sponsorContact?.name ||
                                  bill.sponsors?.[0]?.name ||
                                  'Your representative'}
                              </Text>
                            </View>
                          </View>
                          <View
                            className="border-t"
                            style={{ borderColor: 'rgba(228,228,231,0.9)' }}
                          />
                          <View>
                            <Text className="mb-2 font-sans-medium text-xs text-zinc-500">Format</Text>
                            <SegmentedToggle
                              options={['email', 'phone'] as const}
                              value={format}
                              onChange={setFormat}
                              labels={{ email: 'Email', phone: 'Phone script' }}
                              accentBg={accent.activeBg}
                              accentBorder={tabStanceHighlight.border}
                              accentText={accent.activeText}
                            />
                          </View>
                          <View>
                            <Text className="mb-2 font-sans-medium text-xs text-zinc-500">Tone</Text>
                            <SegmentedToggle
                              options={['formal', 'conversational'] as const}
                              value={tone}
                              onChange={setTone}
                              labels={{ formal: 'Formal', conversational: 'Conversational' }}
                              accentBg={accent.activeBg}
                              accentBorder={tabStanceHighlight.border}
                              accentText={accent.activeText}
                            />
                          </View>
                          <View>
                            <Text className="mb-2 font-sans-medium text-xs text-zinc-500">
                              Personal context{' '}
                              <Text className="font-sans text-xs text-zinc-400">(optional)</Text>
                            </Text>
                            <TextInput
                              value={personalContext}
                              onChangeText={setPersonalContext}
                              placeholder="e.g., I'm a parent concerned about youth healthcare access in my state..."
                              placeholderTextColor="#a1a1aa"
                              multiline
                              className="min-h-[72px] rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 font-sans text-sm text-zinc-800"
                              textAlignVertical="top"
                            />
                          </View>
                          <View className="flex-row items-start gap-1.5">
                            <AlertCircle size={12} color={STANCE_BADGE.harmful.text} style={{ marginTop: 2 }} />
                            <Text
                              className="font-sans text-[10px]"
                              style={{ color: STANCE_BADGE.harmful.text }}>
                              Do not enter personally identifiable information:{' '}
                              <Text className="font-sans text-[10px] text-zinc-500">
                                full name · address · phone · email · date of birth
                              </Text>
                            </Text>
                          </View>
                        </View>

                        {/* Generate button */}
                        <Pressable
                          onPress={generateLetter}
                          disabled={isGeneratingLetter}
                          className="items-center rounded-xl py-3.5 active:opacity-90"
                          style={{
                            backgroundColor: isGeneratingLetter ? '#d1d5db' : accent.button,
                          }}>
                          {isGeneratingLetter ? (
                            <View className="flex-row items-center gap-2">
                              <Loader2 size={16} color="#fff" />
                              <Text className="font-sans-medium text-[15px] text-white">
                                Generating...
                              </Text>
                            </View>
                          ) : (
                            <Text className="font-sans-medium text-[15px] text-white">
                              {letterStance === 'oppose'
                                ? 'Generate opposing letter'
                                : 'Generate supportive letter'}
                            </Text>
                          )}
                        </Pressable>

                        {/* Report */}
                        <View className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                          <Pressable
                            onPress={() => setReportModal('form')}
                            className="flex-row items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white py-2 active:bg-zinc-50">
                            <LogIn size={14} color="#71717a" />
                            <Text className="font-sans-medium text-xs text-zinc-500">
                              Sign in with Google to report
                            </Text>
                          </Pressable>
                          <View className="mt-2 flex-row items-start gap-1.5">
                            <AlertCircle size={12} color={STANCE_BADGE.harmful.text} style={{ marginTop: 2 }} />
                            <Text
                              className="font-sans text-[10px]"
                              style={{ color: STANCE_BADGE.harmful.text }}>
                              Think this classification is wrong?
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Generated state */}
                    {draftLetter && (
                      <View className="gap-3">
                        <View className="flex-row items-center justify-between">
                          <Text className="font-sans-medium text-sm text-zinc-800">
                            Generated {format === 'email' ? 'email' : 'phone script'}
                          </Text>
                          <View className="flex-row gap-1.5">
                            <Pressable
                              onPress={() => copyToClipboard(draftLetter)}
                              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 active:bg-zinc-50">
                              {copied ? (
                                <View className="flex-row items-center gap-1">
                                  <Check size={11} color="#71717a" />
                                  <Text className="font-sans-medium text-xs text-zinc-500">Copied</Text>
                                </View>
                              ) : (
                                <Text className="font-sans-medium text-xs text-zinc-500">Copy</Text>
                              )}
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                const email = bill.sponsorContact?.email ?? '';
                                const subject = encodeURIComponent(
                                  `RE: ${bill.number} - ${bill.title}`
                                );
                                if (email)
                                  Linking.openURL(
                                    `mailto:${email}?subject=${subject}&body=${encodeURIComponent(draftLetter)}`
                                  );
                              }}
                              className="rounded-lg px-3 py-1.5 active:opacity-90"
                              style={{ backgroundColor: accent.button }}>
                              <Text className="font-sans-medium text-xs text-white">Open in mail</Text>
                            </Pressable>
                          </View>
                        </View>

                        <View className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                          <Text className="font-sans text-[13px] leading-relaxed text-zinc-800">
                            {draftLetter}
                          </Text>
                        </View>

                        <View>
                          <Text className="mb-2 font-sans-medium text-xs text-zinc-500">Refine</Text>
                          <View className="flex-row flex-wrap gap-1.5">
                            {['More formal', 'More casual', 'Shorter', 'Longer'].map((label) => {
                              const active = selectedRefine === label;
                              return (
                                <Pressable
                                  key={label}
                                  onPress={() => setSelectedRefine(label)}
                                  className="rounded-full border px-3.5 py-1.5 active:opacity-90"
                                  style={{
                                    borderColor: active
                                      ? accent.activeBorder
                                      : 'rgba(228,228,231,0.9)',
                                    backgroundColor: active ? accent.activeBg : '#ffffff',
                                  }}>
                                  <Text
                                    className="text-xs"
                                    style={{ color: active ? accent.activeText : '#71717a' }}>
                                    {label}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>

                        {/* Regenerate — only clears, does NOT auto-fire */}
                        <Pressable
                          onPress={() => {
                            setSelectedRefine(null);
                            setDraftLetter(null);
                          }}
                          className="items-center rounded-xl py-3.5 active:opacity-90"
                          style={{ backgroundColor: accent.button }}>
                          <Text className="font-sans-medium text-[15px] text-white">Regenerate</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
            <RelatedBillsSection relatedBills={bill.relatedBills} />
          </View>
        </View>
      </ScrollView>

      {/* ── Report Modal ── */}
      <Modal
        visible={reportModal !== 'closed'}
        transparent
        animationType="fade"
        onRequestClose={() => setReportModal('closed')}>
        <Pressable
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onPress={() => setReportModal('closed')}>
          <Pressable
            className="mx-6 w-full max-w-sm rounded-2xl bg-white p-5"
            onPress={() => {}}>
            {reportModal === 'form' && (
              <View className="gap-4">
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans-medium text-base text-zinc-900">
                    Report misclassification
                  </Text>
                  <Pressable onPress={() => setReportModal('closed')}>
                    <X size={18} color="#71717a" />
                  </Pressable>
                </View>

                <View className="gap-2.5">
                  <View className="flex-row items-baseline justify-between">
                    <Text className="font-sans text-sm text-zinc-500">Bill:</Text>
                    <Text className="font-sans-medium text-sm text-zinc-900">
                      {bill.number ?? '—'}
                    </Text>
                  </View>
                  <View className="flex-row items-baseline justify-between">
                    <Text className="font-sans text-sm text-zinc-500">Current label:</Text>
                    <Text
                      className="font-sans-medium text-sm"
                      style={{ color: STANCE_BADGE.harmful.text }}>
                      harmful
                    </Text>
                  </View>
                  <View className="flex-row items-baseline justify-between">
                    <Text className="font-sans text-sm text-zinc-500">Suggested label:</Text>
                    <Text
                      className="font-sans-medium text-sm"
                      style={{ color: STANCE_BADGE.supportive.text }}>
                      supportive
                    </Text>
                  </View>
                </View>

                <View>
                  <Text className="mb-1.5 font-sans text-sm text-zinc-500">Reason:</Text>
                  <View className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                    <Text className="font-sans text-sm text-zinc-700">
                      This bill expands healthcare access for LGBTQ+ youth and should be classified
                      as supportive rather than harmful.
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => setReportModal('closed')}
                    className="flex-1 items-center rounded-lg border border-zinc-200 py-2.5 active:bg-zinc-50">
                    <Text className="font-sans-medium text-sm text-zinc-500">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setReportModal('submitted')}
                    className="flex-1 items-center rounded-lg py-2.5 active:opacity-90"
                    style={{ backgroundColor: accent.button }}>
                    <Text className="font-sans-medium text-sm text-white">Submit</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {reportModal === 'submitted' && (
              <View className="items-center gap-3 py-2">
                <View
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: STANCE_BADGE.supportive.bg }}>
                  <Check size={20} color={STANCE_BADGE.supportive.text} />
                </View>
                <Text className="font-sans-medium text-base text-zinc-900">
                  Response recorded
                </Text>
                <Text className="text-center font-sans text-sm text-zinc-500">
                  Thank you for helping improve our classifications.
                </Text>
                <Pressable
                  onPress={() => setReportModal('closed')}
                  className="mt-1 w-full items-center rounded-lg py-2.5 active:opacity-90"
                  style={{ backgroundColor: accent.button }}>
                  <Text className="font-sans-medium text-sm text-white">Done</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
