import { useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { StateBillsPage } from '@/components/bills/StateBillsPage';
import { fetchBillDetail } from '@/api/bills';
import { queryKeys } from '@/queries/keys';
import { useStateBillsQuery } from '@/queries/useStateBillsQuery';
import type { BillTab } from '@/static/billConstants';
import type { BillDetail } from '@/static/bills';
import { STATES } from '@/static/states';

export default function StateBillsRoute() {
  const { state } = useLocalSearchParams<{ state?: string | string[] }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const stateAbbr = useMemo(() => {
    const rawState = Array.isArray(state) ? state[0] : state;
    return typeof rawState === 'string' ? rawState.trim().toUpperCase() : '';
  }, [state]);

  const stateInfo = stateAbbr ? STATES[stateAbbr] : null;
  const billsQuery = useStateBillsQuery(stateAbbr);
  const billsData: BillDetail[] = (billsQuery.data ?? []) as BillDetail[];

  const handleSelectState = useCallback(
    (selectedStateAbbr: string) => {
      if (!selectedStateAbbr) {
        router.replace('/');
        return;
      }
      router.replace({
        pathname: '/state/[state]',
        params: { state: selectedStateAbbr },
      });
    },
    [router]
  );

  const handleBrowseMap = useCallback(() => {
    router.replace('/');
  }, [router]);

  const handleBillPress = useCallback(
    (billId: string, billTab: BillTab) => {
      if (!stateAbbr || !STATES[stateAbbr]) {
        return;
      }

      void queryClient.prefetchQuery({
        queryKey: queryKeys.billDetail(stateAbbr, billId),
        queryFn: ({ signal }) => fetchBillDetail(stateAbbr, billId, signal),
      });

      router.push({
        pathname: '/state/[state]/[billId]',
        params: { state: stateAbbr, billId, billTab },
      });
    },
    [queryClient, router, stateAbbr]
  );

  if (!stateInfo) {
    return (
      <StateBillsPage
        stateAbbr={stateAbbr || 'N/A'}
        stateName={stateAbbr || 'Unknown State'}
        status="mixed"
        billsData={billsData}
        isLoading={billsQuery.isLoading}
        errorMessage={billsQuery.isError ? 'Failed to load bills. Pull to refresh or try again.' : null}
        onSelectState={handleSelectState}
        onBrowseMap={handleBrowseMap}
        onBillPress={handleBillPress}
      />
    );
  }

  return (
    <StateBillsPage
      stateAbbr={stateAbbr}
      stateName={stateInfo.name}
      status={stateInfo.status}
      billsData={billsData}
      isLoading={billsQuery.isLoading}
      errorMessage={billsQuery.isError ? 'Failed to load bills. Pull to refresh or try again.' : null}
      onSelectState={handleSelectState}
      onBrowseMap={handleBrowseMap}
      onBillPress={handleBillPress}
    />
  );
}
