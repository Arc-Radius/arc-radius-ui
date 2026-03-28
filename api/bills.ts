import { apiClient } from '@/api/client';
import {
  billDetailEnvelopeSchema,
  billDetailResponseSchema,
  stateBillsEnvelopeSchema,
  type BillDetailResponse,
  type StateBillListItem,
  type StateBillsMeta,
} from '@/api/schemas';
import type { Bill, BillTab } from '@/static/billConstants';
import type { BillDetail } from '@/static/bills';

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

function mapSpectrumToStance(
  spectrum: 'Supportive' | 'Neutral' | 'Harmful' | undefined
): 'supportive' | 'mixed' | 'harmful' {
  if (spectrum === 'Supportive') return 'supportive';
  if (spectrum === 'Harmful') return 'harmful';
  return 'mixed';
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

export async function fetchBillDetail(
  _stateAbbr: string,
  billId: string,
  signal?: AbortSignal
): Promise<BillDetailResponse> {
  const data = await apiClient.get<unknown>(`/bills/${encodeURIComponent(billId)}`, { signal });
  const parsed = billDetailEnvelopeSchema.parse(data);
  const bill = parsed.bill;
  return billDetailResponseSchema.parse({
    id: bill.id,
    title: bill.title,
    summary: bill.summary,
    tags: ((bill.subjects ?? []).filter((subject) =>
      ['Healthcare', 'Education', 'Identity Documents', 'Safety', 'Sports'].includes(subject)
    ) as BillDetail['tags']) ?? [],
    status: mapSpectrumToStance(bill.spectrum),
    billTab: bill.billTab ?? 'active',
    whatItMeans: bill.summary,
    whyItMatters: bill.summary,
    takeActionTitle: 'Take Action',
    takeActionBody:
      "Make your voice heard. Here's how you can create meaningful change. Get started by drafting an email or phone script about this bill to share with your representative.",
    actionItem: {
      title: 'Contact your representatives',
      subtitle: 'Send a message to your elected officials',
    },
    relatedBillIds: [],
    relatedBills: [],
  });
}
