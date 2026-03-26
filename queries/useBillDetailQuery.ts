import { useQuery } from '@tanstack/react-query';
import { fetchBillDetail } from '@/api/bills';
import { queryKeys } from '@/queries/keys';

export function useBillDetailQuery(stateAbbr: string, billId: string) {
  return useQuery({
    queryKey: queryKeys.billDetail(stateAbbr, billId),
    enabled: Boolean(stateAbbr) && Boolean(billId),
    queryFn: ({ signal }) => fetchBillDetail(stateAbbr, billId, signal),
  });
}
