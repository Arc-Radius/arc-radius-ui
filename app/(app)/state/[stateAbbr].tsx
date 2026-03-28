import { useCallback, useEffect, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { StateBillsPage } from '@/components/bills/StateBillsPage';
import { fetchBillDetail } from '@/api/bills';
import { useLastBillsState } from '@/contexts/LastBillsStateContext';
import { queryKeys } from '@/queries/keys';
import { useStateBillsTabData } from '@/queries/useStateBillsTabData';
import { useStatesDerived } from '@/queries/useStatesQuery';
import type { BillTab } from '@/static/billConstants';
import { STATES } from '@/static/states';

export default function StateBillsRoute() {
  const { stateAbbr: stateParam } = useLocalSearchParams<{ stateAbbr?: string | string[] }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setLastBillsState } = useLastBillsState();

  const stateAbbr = useMemo(() => {
    const rawState = Array.isArray(stateParam) ? stateParam[0] : stateParam;
    return typeof rawState === 'string' ? rawState.trim().toUpperCase() : '';
  }, [stateParam]);

  const { statesByAbbr, dropdownOptions } = useStatesDerived();

  const stateInfo = useMemo(() => {
    if (!stateAbbr) return null;
    const row = statesByAbbr?.[stateAbbr];
    const st = STATES[stateAbbr];
    if (row) return { name: row.name, status: row.status };
    if (st) return { name: st.name, status: st.status };
    if (statesByAbbr === null) return null;
    return null;
  }, [stateAbbr, statesByAbbr]);

  useEffect(() => {
    if (stateInfo) {
      setLastBillsState(stateAbbr);
    }
  }, [stateInfo, stateAbbr, setLastBillsState]);

  const { activeBills, passedBills, totalBillCount, apiPagination, apiLoading, apiErrors } =
    useStateBillsTabData(stateAbbr);

  const handleSelectState = useCallback(
    (selectedStateAbbr: string) => {
      if (!selectedStateAbbr) {
        router.replace('/');
        return;
      }
      router.replace({
        pathname: '/state/[stateAbbr]',
        params: { stateAbbr: selectedStateAbbr },
      });
    },
    [router]
  );

  const handleBrowseMap = useCallback(() => {
    router.replace('/');
  }, [router]);

  const handleBillPress = useCallback(
    (billId: string, billTab: BillTab) => {
      if (!stateAbbr || (!STATES[stateAbbr] && !statesByAbbr?.[stateAbbr])) {
        return;
      }

      void queryClient.prefetchQuery({
        queryKey: queryKeys.billDetail(stateAbbr, billId),
        queryFn: ({ signal }) => fetchBillDetail(stateAbbr, billId, signal),
      });

      router.push({
        pathname: '/state/[stateAbbr]/[billId]',
        params: { stateAbbr, billId, billTab },
      });
    },
    [queryClient, router, stateAbbr, statesByAbbr]
  );

  if (!stateInfo) {
    return (
      <StateBillsPage
        stateAbbr={stateAbbr || 'N/A'}
        stateName={stateAbbr || 'Unknown State'}
        status="mixed"
        apiBills={undefined}
        totalBillCount={undefined}
        apiPagination={undefined}
        apiLoading={undefined}
        apiErrors={undefined}
        errorMessage={null}
        onSelectState={handleSelectState}
        onBrowseMap={handleBrowseMap}
        onBillPress={handleBillPress}
        stateDropdownOptions={dropdownOptions ?? undefined}
      />
    );
  }

  return (
    <StateBillsPage
      stateAbbr={stateAbbr}
      stateName={stateInfo.name}
      status={stateInfo.status}
      apiBills={{ active: activeBills, passed: passedBills }}
      totalBillCount={totalBillCount}
      apiPagination={apiPagination}
      apiLoading={apiLoading}
      apiErrors={apiErrors}
      errorMessage={null}
      onSelectState={handleSelectState}
      onBrowseMap={handleBrowseMap}
      onBillPress={handleBillPress}
      stateDropdownOptions={dropdownOptions ?? undefined}
    />
  );
}
