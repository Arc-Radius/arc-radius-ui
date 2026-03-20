import { useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { StateBillsPage } from '../../../components/StateBillsPage';
import { STATES } from '../../../static/states';

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
    (billId: string) => {
      if (!stateAbbr || !STATES[stateAbbr]) {
        return;
      }

      router.push({
        pathname: '/state/[state]/[billId]',
        params: { state: stateAbbr, billId },
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
