import { apiClient } from '@/api/client';
import {
  billDetailEnvelopeSchema,
  billDetailResponseSchema,
  stateBillsEnvelopeSchema,
  type BillDetailResponse,
  type StateBillsResponse,
} from '@/api/schemas';
import type { BillDetail } from '@/static/bills';

function mapListItemToBillDetail(item: {
  id: string;
  title: string;
  description: string;
  issue_categories: string[];
  stance: 'supportive' | 'mixed' | 'harmful';
  billTab: 'active' | 'passed';
}): BillDetail {
  return {
    id: item.id,
    title: item.title,
    summary: item.description,
    tags: (item.issue_categories ?? []) as BillDetail['tags'],
    status: item.stance,
    billTab: item.billTab,
    whatItMeans: item.description,
    whyItMatters: item.description,
    takeActionTitle: 'Take Action',
    takeActionBody:
      "Make your voice heard. Here's how you can create meaningful change. Get started by drafting an email or phone script about this bill to share with your representative.",
    actionItem: {
      title: 'Contact your representatives',
      subtitle: 'Send a message to your elected officials',
    },
    relatedBillIds: [],
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
  signal?: AbortSignal
): Promise<StateBillsResponse> {
  const data = await apiClient.get<unknown>(`/bills?state=${encodeURIComponent(stateAbbr)}`, {
    signal,
  });
  const parsed = stateBillsEnvelopeSchema.parse(data);
  return parsed.bills.map(mapListItemToBillDetail);
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
