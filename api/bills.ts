import { apiClient } from '@/api/client';
import {
  billDetailResponseSchema,
  stateBillsResponseSchema,
  type BillDetailResponse,
  type StateBillsResponse,
} from '@/api/schemas';

export async function fetchStateBills(
  stateAbbr: string,
  signal?: AbortSignal
): Promise<StateBillsResponse> {
  const data = await apiClient.get<unknown>(`/states/${encodeURIComponent(stateAbbr)}/bills`, {
    signal,
  });
  return stateBillsResponseSchema.parse(data);
}

export async function fetchBillDetail(
  stateAbbr: string,
  billId: string,
  signal?: AbortSignal
): Promise<BillDetailResponse> {
  const data = await apiClient.get<unknown>(
    `/states/${encodeURIComponent(stateAbbr)}/bills/${encodeURIComponent(billId)}`,
    { signal }
  );
  return billDetailResponseSchema.parse(data);
}
