import { apiClient } from '@/api/client';
import {
  billDetailEnvelopeSchema,
  relatedBillSchema,
  stateBillsEnvelopeSchema,
  type ApiBillDetailItem,
  type GraphRecordParsed,
  type StateBillListItem,
  type StateBillsMeta,
} from '@/api/schemas';
import type { Bill, BillTab } from '@/static/billConstants';
import type { RelatedBill } from '@/static/bills';

/** `GET /bills/:billPk`: API `bill` plus optional `graphRecord` fields merged for the detail UI. */
export type BillDetailMerged = Omit<ApiBillDetailItem, 'relatedBills'> &
  Partial<GraphRecordParsed> & { relatedBills?: RelatedBill[] };

function normalizeRelatedBills(raw: unknown[] | undefined): RelatedBill[] {
  if (!raw?.length) return [];
  return raw.flatMap((item) => {
    const r = relatedBillSchema.safeParse(item);
    return r.success ? [r.data] : [];
  });
}

export function mapListItemToBill(item: StateBillListItem): Bill {
  return {
    id: item.id,
    bill_number: item.bill_number,
    title: item.title,
    description: item.description,
    stance: item.stance,
    billTab: item.billTab,
    status: item.status,
    status_desc: item.status_desc,
    last_action: item.last_action,
    last_action_date: item.last_action_date,
    year: item.year,
    primary_sponsor: item.primary_sponsor,
    issue_categories: item.issue_categories,
    url: item.url,
  };
}

export interface FetchStateBillsOptions {
  cursor?: string | null;
  tab?: BillTab;
}

export interface StateBillsListResult {
  bills: Bill[];
  meta: StateBillsMeta;
  facets: unknown;
}

function mapEnvelopeToResult(
  parsed: ReturnType<typeof stateBillsEnvelopeSchema.parse>
): StateBillsListResult {
  return {
    bills: parsed.bills.map(mapListItemToBill),
    meta: parsed.meta ?? {},
    facets: parsed.facets,
  };
}

export async function fetchStateBills(
  stateAbbr: string,
  options: FetchStateBillsOptions = {},
  signal?: AbortSignal
): Promise<StateBillsListResult> {
  const params = new URLSearchParams();
  params.set('state', stateAbbr);
  if (options.tab) {
    params.set('tab', options.tab);
  }
  if (options.cursor) {
    params.set('cursor', options.cursor);
  }
  const qs = params.toString();
  const data = await apiClient.get<unknown>(`/bills?${qs}`, { signal });
  const parsed = stateBillsEnvelopeSchema.parse(data);
  return mapEnvelopeToResult(parsed);
}

export interface BillTextResult {
  html: string;
  mime: string;
}

export async function fetchBillText(
  billId: string,
  signal?: AbortSignal
): Promise<BillTextResult> {
  const data = await apiClient.get<Record<string, unknown>>(
    `/bills/get-with-text?bill_id=${encodeURIComponent(billId)}`,
    { signal }
  );
  const latestText = data?.latest_text as Record<string, unknown> | undefined;
  const doc = latestText?.doc as string | undefined;
  const mime = (latestText?.mime as string) ?? '';
  if (!doc) return { html: '', mime };
  try {
    const bytes = Uint8Array.from(atob(doc), (c) => c.charCodeAt(0));
    const html = new TextDecoder('utf-8').decode(bytes);
    return { html, mime };
  } catch {
    return { html: '', mime };
  }
}

export async function fetchBillDetail(
  _stateAbbr: string,
  billId: string,
  signal?: AbortSignal
): Promise<BillDetailMerged> {
  const data = await apiClient.get<unknown>(`/bills/${encodeURIComponent(billId)}`, { signal });
  const parsed = billDetailEnvelopeSchema.parse(data);
  const { bill, graphRecord } = parsed;
  const relatedBills = normalizeRelatedBills(bill.relatedBills ?? undefined);
  return {
    ...bill,
    ...(graphRecord ?? {}),
    relatedBills,
  };
}

export interface GenerateLetterParams {
  medium: 'email' | 'phone';
  stance: 'support' | 'oppose';
  tone: 'formal' | 'conversational';
}

export async function generateBillLetter(
  billPk: string,
  params: GenerateLetterParams,
): Promise<string> {
  const data = await apiClient.post<Record<string, unknown>>('/generate/bill', {
    task: 'generate_letter',
    bill_pk: billPk,
    letter_params: params,
  });
  return (data?.answer as string) ?? '';
}
