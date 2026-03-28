import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchStateBills } from '@/api/bills';
import { queryKeys } from '@/queries/keys';
import type { BillTab } from '@/static/billConstants';

export function useStateBillsInfiniteQuery(stateAbbr: string, tab: BillTab) {
  return useInfiniteQuery({
    queryKey: queryKeys.stateBills(stateAbbr, tab),
    enabled: Boolean(stateAbbr),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      fetchStateBills(stateAbbr, { cursor: pageParam ?? undefined, tab }, signal),
    getNextPageParam: (last) => {
      const m = last.meta;
      if ((m.hasMore ?? false) && m.nextCursor) {
        return m.nextCursor;
      }
      return undefined;
    },
  });
}
