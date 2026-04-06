/**
 * BillDetailPage — 1:1 React Native port of the web prototype BillDetailView.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { useQueries } from '@tanstack/react-query';
import { useBillTextQuery } from '@/queries/useBillTextQuery';
import { fetchBillDetail, generateBillLetter, type BillDetailMerged } from '@/api/bills';
import { queryKeys } from '@/queries/keys';
import type { Href } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Alert,
  Animated,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
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
  ChevronDown,
} from 'lucide-react-native';

import { ScreenContent } from '@/components/ui/screen-layout';
import { BillGraphRecordPlaceholder, type GraphBillRecord } from './BillRecordPlaceholder';
import type { BillTab } from '@/static/billConstants';
import {
  STANCE_BADGE,
  STANCE_DOT,
  STANCE_HEADER_GLASS,
  STANCE_CHECK_BG,
} from '@/static/billConstants';
import type { RelatedBill } from '@/static/bills';
import type { LegislativeStatus } from '@/static/states';

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
  description?: string;
  whyMatters?: string;
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
  /** From merged `graphRecord` (LegiScan / state portal). */
  url?: string;
  state_link?: string;
}

const CONFIDENCE_DOT: Record<string, string> = {
  high: '#2563eb',
  medium: '#d97706',
  low: '#a1a1aa',
};

function RelatedBillsSection({
  relatedBills,
  relatedBillDetailsByPk,
  onPressBill,
}: {
  relatedBills: RelatedBill[];
  relatedBillDetailsByPk?: Map<string, BillDetailMerged>;
  onPressBill?: (billId: string) => void;
}) {
  if (relatedBills.length === 0) {
    return (
      <View className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
        <View className="mb-2 flex-row items-center gap-1.5">
          <Sparkles size={13} color="#a16207" />
          <Text className="font-sans-semibold text-sm text-zinc-800">Related bills</Text>
        </View>
        <Text className="font-sans text-sm leading-relaxed text-zinc-500">Coming soon.</Text>
      </View>
    );
  }
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
      <View className="mb-2 flex-row items-center gap-1.5">
        <Sparkles size={13} color="#a16207" />
        <Text className="font-sans-semibold text-sm text-zinc-800">Related bills</Text>
      </View>
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
                (() => {
                  const detail = relatedBillDetailsByPk?.get(rb.bill_id);
                  const displayId =
                    detail?.number?.trim() || detail?.bill_number?.trim() || rb.bill_id;
                  const title = detail?.title?.trim() || '';
                  const status = (detail as BillDetailMerged | undefined)?.status_desc?.trim() || '';
                  const lastActionDate = detail?.lastActionDate?.trim() || '';
                  return (
                <Pressable
                  key={rb.bill_id}
                  onPress={() => onPressBill?.(rb.bill_id)}
                  className="bg-white px-3.5 py-3 active:bg-zinc-50"
                  style={
                    idx < tier.bills.length - 1
                      ? { borderBottomWidth: 0.5, borderBottomColor: 'rgba(228,228,231,0.9)' }
                      : undefined
                  }>
                  <View className="mb-0.5 flex-row items-center gap-1.5">
                    <Text className="font-sans-semibold text-[13px] text-zinc-800">{displayId}</Text>
                    {displayId !== rb.bill_id ? (
                      <Text className="font-mono text-[11px] text-zinc-400">{rb.bill_id}</Text>
                    ) : null}
                  </View>
                  {title ? (
                    <Text className="mb-1 font-sans text-[12px] text-zinc-500">{title}</Text>
                  ) : null}
                  <Text className="font-sans text-[13px] leading-relaxed text-zinc-600">
                    {rb.summary}
                  </Text>
                  {status || lastActionDate ? (
                    <Text className="mt-1.5 font-sans text-[11px] text-zinc-400">
                      {[status, lastActionDate ? `Last action: ${lastActionDate}` : '']
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  ) : null}
                </Pressable>
                  );
                })()
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

/** Decode common HTML entities in API summaries (e.g. &quot;). */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function resolveLifecyclePillLabel(billTab: BillTab): 'Proposed' | 'Passed' {
  return billTab === 'passed' ? 'Passed' : 'Proposed';
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

function AnimatedDots({ anim }: { anim: Animated.Value }) {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const id = anim.addListener(({ value }) => {
      const count = Math.floor(value) % 4; // 0, 1, 2, 3
      setDots('.'.repeat(count));
    });
    return () => anim.removeListener(id);
  }, [anim]);
  return (
    <Text className="font-sans-medium text-[15px] text-white" style={{ width: 110 }}>
      Generating{dots}
    </Text>
  );
}

export function BillDetailPage({
  bill: rawBill,
  onClose,
  stateName: _stateName,
  relatedBills: _relatedBills,
  billTab: billTabProp,
}: {
  bill: Bill | BillDetailMerged | null | undefined;
  onClose?: () => void;
  stateName?: string;
  relatedBills?: unknown[];
  billTab?: BillTab;
}) {
  const raw = (rawBill ?? {}) as Bill;
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
  const handlePressRelatedBill = useCallback(
    (billPk: string) => {
      const stateAbbr = billPk.split(':')[0]?.trim().toUpperCase();
      if (!stateAbbr) return;
      router.push({
        pathname: '/state/[stateAbbr]/[billId]',
        params: { stateAbbr, billId: billPk, billTab: 'active' },
      });
    },
    [router]
  );
  const ai = (raw.aiAnalysis ?? {}) as NonNullable<Bill['aiAnalysis']>;
  const re = raw.researchEvidence as Bill['researchEvidence'] | undefined;
  const sc = raw.sponsorContact as Bill['sponsorContact'] | undefined;

  const bill = {
    id: raw.id ?? '',
    number: raw.number ?? '',
    title: raw.title ?? '',
    summary: decodeHtmlEntities(
      raw.summary ??
        (raw as { llm_bill_summary?: string }).llm_bill_summary ??
        raw.description ??
        ''
    ),
    description: decodeHtmlEntities(raw.description ?? ''),
    whyMatters: decodeHtmlEntities(
      raw.whyMatters ?? (raw as { llm_bill_why_matters?: string }).llm_bill_why_matters ?? ''
    ),
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
    const str = (v: string | undefined | null, fb?: string) => {
      if (v === undefined || v === null) return fb;
      const t = String(v).trim();
      return t !== '' ? t : fb;
    };
    const num = (v: number | string | undefined | null): number | undefined => {
      if (v === undefined || v === null) return undefined;
      const n = typeof v === 'string' ? parseFloat(v) : v;
      return Number.isFinite(n) ? n : undefined;
    };
    const snp = (v: number | string | undefined | null): number | string | undefined => {
      if (v === undefined || v === null) return undefined;
      if (typeof v === 'string' && v.trim() === '') return undefined;
      return v;
    };
    const pk = str(r.bill_pk, bill.state && bill.id ? `${bill.state}:${bill.id}` : undefined);
    const bsg = (): string | undefined => {
      const bs = bill.status?.trim() ?? '';
      return !bs || isLegislativeStanceStatus(bs) ? undefined : bill.status;
    };
    const isHumanLabeled = r.label_source === 'aclu' || r.label_source === 'plural';
    const rawConf = num(r.confidence);
    const conf = rawConf ?? (isHumanLabeled ? 1.0 : undefined);
    const rawRel = num(r.relevance_score);
    const rel = rawRel ?? (isHumanLabeled ? 1.0 : undefined);
    return {
      bill_pk: pk,
      bill_id: str(r.bill_id, bill.id || undefined),
      state: str(bill.state || r.state, undefined),
      session_id: str(r.session_id, undefined),
      bill_number: str(bill.number || r.bill_number, undefined),
      title: str(bill.title, undefined),
      description: str(r.description ?? bill.summary, undefined),
      status: str(r.status, undefined) ?? str(bsg(), undefined),
      status_desc: str(r.status_desc, undefined),
      status_date: str(r.status_date ?? bill.introducedDate, undefined),
      url: r.url,
      state_link: r.state_link,
      label: str(r.label, spectrumLabel),
      label_source: str(r.label_source, undefined),
      confidence: conf,
      relevance_score: rel,
      issues: str(r.issues, bill.subjects.length ? bill.subjects.join(', ') : undefined),
      issue_categories: str(
        r.issue_categories,
        bill.subjects?.length ? bill.subjects.join(', ') : (r.tags?.length ? JSON.stringify(r.tags) : undefined)
      ),
      sponsor_names: str(r.sponsor_names, sponsorLine || undefined),
      primary_sponsor: str(r.primary_sponsor, bill.sponsors[0]?.name),
      last_action: str(r.last_action, bill.lastAction || undefined),
      last_action_date: str(r.last_action_date, bill.lastActionDate || undefined),
      year: num(year),
      session_year: num(r.session_year ?? year),
      state_lean: str(r.state_lean, undefined),
      bill_dominant_party: str(r.bill_dominant_party, undefined),
      state_r_sponsorship_ratio: num(r.state_r_sponsorship_ratio),
      pass_rate_gap: snp(r.pass_rate_gap),
      overall_pass_rate: snp(r.overall_pass_rate),
    };
  }, [rawBill, bill]);

  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'action'>('summary');
  const [draftLetter, setDraftLetter] = useState<string | null>(null);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!isGeneratingLetter) return;
    spinAnim.setValue(0);
    dotsAnim.setValue(0);
    const spin = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 800, useNativeDriver: false })
    );
    const dots = Animated.loop(
      Animated.timing(dotsAnim, { toValue: 4, duration: 2000, useNativeDriver: false })
    );
    spin.start();
    dots.start();
    return () => { spin.stop(); dots.stop(); };
  }, [isGeneratingLetter, spinAnim, dotsAnim]);
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'email' | 'phone'>('email');
  const [tone, setTone] = useState<'formal' | 'conversational'>('formal');
  const [reportModal, setReportModal] = useState<'closed' | 'form' | 'submitted'>('closed');

  const letterStance: 'support' | 'oppose' = stanceKey === 'harmful' ? 'oppose' : 'support';
  const accent = ACTION_ACCENT[stanceKey];

  const generateLetter = async () => {
    const billPk = graphRecordValues.bill_pk ?? bill.id;
    if (!billPk) return;
    setIsGeneratingLetter(true);
    try {
      const answer = await generateBillLetter(billPk, {
        medium: format,
        stance: letterStance,
        tone,
      });
      setDraftLetter(answer);
    } catch {
      setDraftLetter('Failed to generate letter. Please try again.');
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (Platform.OS === 'web' && navigator?.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Copied', 'Text copied to clipboard.');
    }
  };

  const tabStanceHighlight = useMemo(
    () => ({
      border: STANCE_HEADER_GLASS[stanceKey].border,
      bg: STANCE_HEADER_GLASS[stanceKey].bg,
      iconActive: STANCE_BADGE[stanceKey].text,
    }),
    [stanceKey]
  );

  const tabDef = [
    { key: 'summary' as const, label: 'Summary', Icon: Sparkles },
    { key: 'details' as const, label: 'Details', Icon: ScrollText },
    { key: 'action' as const, label: 'Take Action', Icon: Megaphone },
  ];

  const detailBillText = useMemo(() => bill.fullText?.trim() ?? '', [bill.fullText]);
  const [billTextOpen, setBillTextOpen] = useState(true);
  const detailHistory = useMemo(() => [...(bill.history ?? [])].reverse(), [bill.history]);
  const rawGraph = rawBill as (Bill & Partial<GraphBillRecord>) | null | undefined;
  const legiscanBillId = rawGraph?.bill_id ?? '';
  const billTextQuery = useBillTextQuery(legiscanBillId, activeTab === 'details' && !detailBillText);
  const billTextMime = billTextQuery.data?.mime ?? '';
  const isPdf = billTextMime.includes('pdf');
  const sanitizedHtml = useMemo(() => {
    const raw = billTextQuery.data?.html ?? '';
    if (!raw || isPdf) return '';
    return DOMPurify.sanitize(raw, { ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'em', 'strong', 'u', 'div', 'span', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'pre', 'blockquote', 'hr', 'sup', 'sub'], ALLOWED_ATTR: ['href', 'target', 'style', 'align', 'colspan', 'rowspan'] });
  }, [billTextQuery.data?.html, isPdf]);
  const lifecycleLabel = resolveLifecyclePillLabel(bill.billTab);
  const relatedBillPks = useMemo(
    () => Array.from(new Set((bill.relatedBills ?? []).map((rb) => rb.bill_id).filter(Boolean))),
    [bill.relatedBills]
  );
  const relatedBillQueries = useQueries({
    queries: relatedBillPks.map((billPk) => ({
      queryKey: queryKeys.billDetailByPk(billPk),
      queryFn: ({ signal }: { signal: AbortSignal }) => {
        const stateAbbr = billPk.split(':')[0] ?? '';
        return fetchBillDetail(stateAbbr, billPk, signal);
      },
      staleTime: 5 * 60 * 1000,
    })),
  });
  const relatedBillDetailsByPk = useMemo(() => {
    const map = new Map<string, BillDetailMerged>();
    relatedBillQueries.forEach((q, idx) => {
      const billPk = relatedBillPks[idx];
      if (billPk && q.data) map.set(billPk, q.data);
    });
    return map;
  }, [relatedBillPks, relatedBillQueries]);
  const rawLegislativeStatus =
    rawGraph?.status_desc?.trim() ||
    (bill.status && !isLegislativeStanceStatus(bill.status) ? bill.status : '');
  const displayLegislativeStatus =
    rawLegislativeStatus.toLowerCase() === lifecycleLabel.toLowerCase() ? '' : rawLegislativeStatus;
  const { width: windowWidth } = useWindowDimensions();
  const tabStripCompactWeb = Platform.OS === 'web' && windowWidth < 640;
  const headerGlass = STANCE_HEADER_GLASS[stanceKey];

  return (
    <View className="flex-1 bg-app-bg">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <ScreenContent>
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
                      <Text className="min-w-0 flex-1 font-sans-bold text-lg leading-tight tracking-tight text-zinc-900">
                        {bill.title}
                      </Text>
                    </View>
                    <View className="mt-1.5 flex-row flex-wrap items-center gap-2">
                      {bill.number ? (
                        <Text className="font-mono text-xs text-zinc-500">{bill.number}</Text>
                      ) : null}
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
                          {lifecycleLabel}
                        </Text>
                      </View>
                      {displayLegislativeStatus ? (
                        <View className="rounded-md bg-zinc-200/90 px-2 py-0.5">
                          <Text className="font-sans text-xs text-zinc-700">
                            {displayLegislativeStatus}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className="mt-2 font-sans text-sm leading-relaxed text-zinc-600">
                      {bill.description}
                    </Text>
                  </View>
                  <Pressable
                    onPress={handleClose}
                    className="h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200/90 bg-white/70 active:opacity-70"
                    style={{ zIndex: 10, position: 'relative' }}
                    accessibilityRole="button"
                    accessibilityLabel="Back to state bills">
                    <X size={13} color="#71717a" strokeWidth={2} />
                  </Pressable>
                </View>
                <View className="mt-3 flex-row flex-wrap items-center gap-2">
                  <Text className="font-sans text-xs text-zinc-500">Sponsors:</Text>
                  {bill.sponsors.map((sponsor, idx) => (
                    <View
                      key={idx}
                      className="rounded bg-zinc-100 px-2 py-0.5">
                      <Text className="font-sans-medium text-xs text-zinc-700">
                        {sponsor.name} ({sponsor.party})
                      </Text>
                    </View>
                  ))}
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
                    <View
                      className="rounded-xl border px-4 py-3.5"
                      style={{
                        backgroundColor: 'rgba(59,130,246,0.05)',
                        borderColor: 'rgba(59,130,246,0.12)',
                      }}>
                      <View className="flex-row items-start gap-2.5">
                        <Sparkles size={14} color="#2563eb" style={{ marginTop: 2 }} />
                        <View className="flex-1">
                          <Text className="font-sans-semibold text-sm text-zinc-800">
                            AI-generated from the knowledge graph
                          </Text>
                          <Text className="mt-0.5 font-sans text-xs leading-5 text-zinc-600">
                            This summary is generated using our legislative knowledge graph, bill
                            metadata, and related policy links, and the system was calibrated with
                            human evaluation to improve reliability. Review official bill text for
                            legal language.
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View>
                      <View className="mb-2 flex-row items-center gap-1.5">
                        <Sparkles size={13} color="#a16207" />
                        <Text className="font-sans-semibold text-sm text-zinc-800">What it means</Text>
                      </View>
                      <View className="rounded-xl border border-zinc-200/90 bg-zinc-50/90 p-4">
                        {bill.summary?.trim() ? (
                          <Text className="font-sans text-sm leading-relaxed text-zinc-700">
                            {bill.summary}
                          </Text>
                        ) : (
                          <Text className="font-sans text-sm leading-relaxed text-zinc-500">
                            Coming soon.
                          </Text>
                        )}
                      </View>
                    </View>
                    <View>
                      <View className="mb-2 flex-row items-center gap-1.5">
                        <Sparkles size={13} color="#a16207" />
                        <Text className="font-sans-semibold text-sm text-zinc-800">Why it matters</Text>
                      </View>
                      <View className="rounded-xl border border-zinc-200/90 bg-zinc-50/90 p-4">
                        {bill.whyMatters?.trim() ? (
                          <Text className="font-sans text-sm leading-relaxed text-zinc-700">
                            {bill.whyMatters}
                          </Text>
                        ) : (
                          <Text className="font-sans text-sm leading-relaxed text-zinc-500">
                            Coming soon.
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                )}

                {/* ── DETAILS ── */}
                {activeTab === 'details' && (
                  <View className="gap-5">
                    <View>
                      <Pressable
                        onPress={() => setBillTextOpen((o) => !o)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        className="mb-2 flex-row items-center gap-1 self-start rounded-md py-0.5 active:opacity-70"
                        accessibilityRole="button"
                        accessibilityState={{ expanded: billTextOpen }}
                        accessibilityLabel={billTextOpen ? 'Collapse bill text' : 'Expand bill text'}>
                        <Text className="font-sans-semibold text-sm text-zinc-800">
                          Bill text
                        </Text>
                        <View
                          className="h-5 w-[18px] items-center justify-center"
                          style={{ transform: [{ rotate: billTextOpen ? '180deg' : '0deg' }] }}>
                          <ChevronDown size={18} color="#71717a" strokeWidth={2} />
                        </View>
                      </Pressable>
                      {billTextOpen && <View className="rounded-xl border border-zinc-200 bg-white p-4">
                        {detailBillText.length > 0 ? (
                          <ScrollView
                            className="max-h-52 rounded-lg bg-zinc-50 p-3"
                            nestedScrollEnabled>
                            <Text className="font-sans text-xs leading-5 text-zinc-600">
                              {detailBillText}
                            </Text>
                          </ScrollView>
                        ) : sanitizedHtml ? (
                          <ScrollView
                            className="max-h-96 rounded-lg bg-zinc-50 p-3"
                            nestedScrollEnabled>
                            {Platform.OS === 'web' ? (
                              <div
                                className="prose prose-sm max-w-none text-xs leading-5 text-zinc-600"
                                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                              />
                            ) : (
                              <Text className="font-sans text-xs leading-5 text-zinc-600">
                                {sanitizedHtml.replace(/<[^>]*>/g, '')}
                              </Text>
                            )}
                          </ScrollView>
                        ) : billTextQuery.isLoading ? (
                          <Text className="font-sans text-sm text-zinc-400">
                            Loading bill text...
                          </Text>
                        ) : isPdf && rawGraph?.url?.trim() ? (
                          <View className="gap-3">
                            <Text className="font-sans text-sm leading-relaxed text-zinc-600">
                              This bill text is available as a PDF.
                            </Text>
                            <Pressable
                              onPress={() => void Linking.openURL(rawGraph.url!.trim())}
                              className="self-start rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 active:bg-zinc-100">
                              <Text className="font-sans-medium text-xs text-zinc-800">
                                View PDF on LegiScan
                              </Text>
                            </Pressable>
                          </View>
                        ) : (
                          <View className="gap-3">
                            <Text className="font-sans text-sm leading-relaxed text-zinc-600">
                              Full bill text is not available. Open the official source.
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                              {rawGraph?.url?.trim() ? (
                                <Pressable
                                  onPress={() =>
                                    void Linking.openURL(rawGraph.url!.trim())
                                  }
                                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 active:bg-zinc-100">
                                  <Text className="font-sans-medium text-xs text-zinc-800">
                                    LegiScan
                                  </Text>
                                </Pressable>
                              ) : null}
                              {rawGraph?.state_link?.trim() ? (
                                <Pressable
                                  onPress={() =>
                                    void Linking.openURL(rawGraph.state_link!.trim())
                                  }
                                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 active:bg-zinc-100">
                                  <Text className="font-sans-medium text-xs text-zinc-800">
                                    State legislature
                                  </Text>
                                </Pressable>
                              ) : null}
                            </View>
                            {!rawGraph?.url?.trim() && !rawGraph?.state_link?.trim() ? (
                              <Text className="font-sans text-xs text-zinc-400">
                                No external link was provided for this bill.
                              </Text>
                            ) : null}
                          </View>
                        )}
                      </View>}
                    </View>
                    <BillGraphRecordPlaceholder values={graphRecordValues} stanceKey={stanceKey} />
                    <View>
                      <Text className="mb-2 font-sans-semibold text-sm text-zinc-800">
                        Legislative history
                      </Text>
                      <View className="rounded-xl border border-zinc-200 bg-white p-4">
                        {detailHistory.length === 0 ? (
                          <Text className="font-sans text-sm text-zinc-500">
                            No actions recorded yet.
                          </Text>
                        ) : (
                          detailHistory.map((entry, i) => (
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
                          ))
                        )}
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
                          {/* Classification */}
                          <View className="gap-2">
                            <View className="flex-row items-baseline justify-between">
                              <Text className="font-sans text-sm text-zinc-500">Source:</Text>
                              <Text className="font-sans-medium text-sm text-zinc-700">
                                {(() => {
                                  const src = graphRecordValues.label_source;
                                  if (src === 'aclu') return 'ACLU';
                                  if (src === 'plural') return 'Plural';
                                  return src || '—';
                                })()}
                              </Text>
                            </View>
                            <View className="flex-row items-baseline justify-between">
                              <Text className="font-sans text-sm text-zinc-500">Stance:</Text>
                              <Text
                                className="font-sans-medium text-sm"
                                style={{ color: STANCE_BADGE[stanceKey].text }}>
                                {STANCE_WORD[stanceKey]}
                              </Text>
                            </View>
                            <View className="flex-row items-baseline justify-between">
                              <Text className="font-sans text-sm text-zinc-500">Confidence:</Text>
                              <Text
                                className="font-sans-medium text-sm"
                                style={{ color: STANCE_BADGE[stanceKey].text }}>
                                {(() => {
                                  const src = graphRecordValues.label_source;
                                  const isHumanLabeled = src === 'aclu' || src === 'plural';
                                  const conf = isHumanLabeled
                                    ? 1.0
                                    : typeof graphRecordValues.confidence === 'number'
                                      ? graphRecordValues.confidence
                                      : typeof graphRecordValues.confidence === 'string'
                                        ? parseFloat(graphRecordValues.confidence)
                                        : null;
                                  if (conf != null && Number.isFinite(conf)) {
                                    return `${(conf <= 1 ? conf * 100 : conf).toFixed(0)}%`;
                                  }
                                  return '—';
                                })()}
                              </Text>
                            </View>
                          </View>
                          <View
                            className="border-t"
                            style={{ borderColor: 'rgba(228,228,231,0.9)' }}
                          />
                          <View>
                            <Text className="mb-2 font-sans-medium text-xs text-zinc-500">
                              Format
                            </Text>
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
                            <Text className="mb-2 font-sans-medium text-xs text-zinc-500">
                              Tone
                            </Text>
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
                              <Animated.View
                                style={{
                                  transform: [{
                                    rotate: spinAnim.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: ['0deg', '360deg'],
                                    }),
                                  }],
                                }}>
                                <Loader2 size={16} color="#fff" />
                              </Animated.View>
                              <AnimatedDots anim={dotsAnim} />
                            </View>
                          ) : (
                            <Text className="font-sans-medium text-[15px] text-white">
                              {letterStance === 'oppose'
                                ? 'Generate opposing message'
                                : 'Generate supportive message'}
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
                            <AlertCircle
                              size={12}
                              color={STANCE_BADGE.harmful.text}
                              style={{ marginTop: 2 }}
                            />
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
                            Generated {format === 'email' ? 'email message' : 'phone script'}
                          </Text>
                          <View className="flex-row items-center gap-1.5">
                            <Pressable
                              onPress={() => copyToClipboard(draftLetter)}
                              className="items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 active:bg-zinc-50">
                              {copied ? (
                                <View className="flex-row items-center gap-1">
                                  <Check size={11} color="#71717a" />
                                  <Text className="font-sans-medium text-xs text-zinc-500">
                                    Copied
                                  </Text>
                                </View>
                              ) : (
                                <Text className="font-sans-medium text-xs text-zinc-500">Copy</Text>
                              )}
                            </Pressable>
                          </View>
                        </View>

                        <View className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                          <Text className="font-sans text-[13px] leading-relaxed text-zinc-800">
                            {draftLetter}
                          </Text>
                        </View>

                        {/* Regenerate */}
                        <Pressable
                          onPress={() => setDraftLetter(null)}
                          className="items-center rounded-xl py-3.5 active:opacity-90"
                          style={{ backgroundColor: accent.button }}>
                          <Text className="font-sans-medium text-[15px] text-white">
                            Regenerate
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
            <RelatedBillsSection
              relatedBills={bill.relatedBills}
              relatedBillDetailsByPk={relatedBillDetailsByPk}
              onPressBill={handlePressRelatedBill}
            />
          </View>
        </ScreenContent>
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
          <Pressable className="mx-6 w-full max-w-sm rounded-2xl bg-white p-5" onPress={() => {}}>
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
                  style={{ backgroundColor: STANCE_BADGE[stanceKey].bg }}>
                  <Check size={20} color={STANCE_BADGE[stanceKey].text} />
                </View>
                <Text className="font-sans-medium text-base text-zinc-900">Response recorded</Text>
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
