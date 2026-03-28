import { useMemo } from 'react';

import { useStateBillsInfiniteQuery } from '@/queries/useStateBillsQuery';

const BILLS_LOAD_ERROR = 'Failed to load bills. Pull to refresh or try again.';

export function useStateBillsTabData(stateAbbr: string) {
  const activeQuery = useStateBillsInfiniteQuery(stateAbbr, 'active');
  const passedQuery = useStateBillsInfiniteQuery(stateAbbr, 'passed');

  const activeBills = useMemo(
    () => activeQuery.data?.pages.flatMap((p) => p.bills) ?? [],
    [activeQuery.data]
  );
  const passedBills = useMemo(
    () => passedQuery.data?.pages.flatMap((p) => p.bills) ?? [],
    [passedQuery.data]
  );

  const totalBillCount = useMemo(() => {
    const a = activeQuery.data?.pages[0]?.meta.totalCount;
    const p = passedQuery.data?.pages[0]?.meta.totalCount;
    if (a != null && p != null) {
      return a + p;
    }
    return undefined;
  }, [activeQuery.data, passedQuery.data]);

  const apiPagination = useMemo(
    () => ({
      active: {
        hasNextPage: activeQuery.hasNextPage,
        fetchNextPage: activeQuery.fetchNextPage,
        isFetchingNextPage: activeQuery.isFetchingNextPage,
      },
      passed: {
        hasNextPage: passedQuery.hasNextPage,
        fetchNextPage: passedQuery.fetchNextPage,
        isFetchingNextPage: passedQuery.isFetchingNextPage,
      },
    }),
    [
      activeQuery.hasNextPage,
      activeQuery.fetchNextPage,
      activeQuery.isFetchingNextPage,
      passedQuery.hasNextPage,
      passedQuery.fetchNextPage,
      passedQuery.isFetchingNextPage,
    ]
  );

  const apiLoading = useMemo(
    () => ({
      active: activeQuery.isPending && !activeQuery.data,
      passed: passedQuery.isPending && !passedQuery.data,
    }),
    [
      activeQuery.isPending,
      activeQuery.data,
      passedQuery.isPending,
      passedQuery.data,
    ]
  );

  const apiErrors = useMemo(
    () => ({
      active: activeQuery.isError ? BILLS_LOAD_ERROR : null,
      passed: passedQuery.isError ? BILLS_LOAD_ERROR : null,
    }),
    [activeQuery.isError, passedQuery.isError]
  );

  return {
    activeBills,
    passedBills,
    totalBillCount,
    apiPagination,
    apiLoading,
    apiErrors,
  };
}
