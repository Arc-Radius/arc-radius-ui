import { useQuery } from '@tanstack/react-query';
import { fetchBillText, type BillTextResult } from '@/api/bills';
import { queryKeys } from '@/queries/keys';

export function useBillTextQuery(billId: string, enabled = true) {
  return useQuery<BillTextResult, Error>({
    queryKey: queryKeys.billText(billId),
    enabled: Boolean(billId) && enabled,
    queryFn: ({ signal }) => fetchBillText(billId, signal),
    staleTime: Infinity,
  });
}
