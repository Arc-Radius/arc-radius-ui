import { useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { StateBillsPage } from '@/components/StateBillsPage';
import type { BillTab } from '@/static/billConstants';
import { STATES } from '@/static/states';

export default function StateBillsRoute() {
  const { state } = useLocalSearchParams<{ state?: string | string[] }>();
  const router = useRouter();

  const stateAbbr = useMemo(() => {
    const rawState = Array.isArray(state) ? state[0] : state;
    return typeof rawState === 'string' ? rawState.trim().toUpperCase() : '';
  }, [state]);

  const stateInfo = stateAbbr ? STATES[stateAbbr] : null;

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

      router.push({
        pathname: '/state/[state]/[billId]',
        params: { state: stateAbbr, billId, billTab },
      });
    },
    [router, stateAbbr]
  );

  if (!stateInfo) {
    return (
      <StateBillsPage
        stateAbbr={stateAbbr || 'N/A'}
        stateName={stateAbbr || 'Unknown State'}
        status="mixed"
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
      onSelectState={handleSelectState}
      onBrowseMap={handleBrowseMap}
      onBillPress={handleBillPress}
    />
  );
}
