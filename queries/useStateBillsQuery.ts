import { useQuery } from '@tanstack/react-query';
import { fetchStateBills } from '@/api/bills';
import { queryKeys } from '@/queries/keys';

export function useStateBillsQuery(stateAbbr: string) {
  return useQuery({
    queryKey: queryKeys.stateBills(stateAbbr),
    enabled: Boolean(stateAbbr),
    queryFn: ({ signal }) => fetchStateBills(stateAbbr, signal),
  });
}
