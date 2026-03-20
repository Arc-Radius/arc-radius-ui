import { useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import StateDashboard from '../../../components/StateDashboard';
import { STATES } from '../../../static/states';

export default function Dashboard() {
  const { state } = useLocalSearchParams<{ state?: string | string[] }>();
  const router = useRouter();
  const stateAbbr = useMemo(() => {
    const rawState = Array.isArray(state) ? state[0] : state;
    return typeof rawState === 'string' ? rawState.trim().toUpperCase() : '';
  }, [state]);
  const stateInfo = stateAbbr ? STATES[stateAbbr] : null;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  }, [router]);

  const handleAskPress = useCallback(() => {
    router.push('/ask');
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

  const handleViewAllBills = useCallback(() => {
    if (!stateAbbr || !STATES[stateAbbr]) {
      return;
    }

    router.push({
      pathname: '/state/[state]',
      params: { state: stateAbbr },
    });
  }, [router, stateAbbr]);

  if (!stateInfo) {
    return (
      <StateDashboard
        stateAbbr={stateAbbr || 'N/A'}
        stateName={stateAbbr || 'Unknown state'}
        overallStatus="mixed"
        activeBills={0}
        needsAttention={0}
        recentBills={[]}
        onBack={() => router.replace('/')}
      />
    );
  }

  const activeBills = stateInfo.status === 'harmful' ? 14 : stateInfo.status === 'mixed' ? 8 : 5;
  const needsAttention = stateInfo.status === 'harmful' ? 5 : stateInfo.status === 'mixed' ? 2 : 1;

  return (
    <StateDashboard
      stateAbbr={stateAbbr}
      stateName={stateInfo.name}
      overallStatus={stateInfo.status}
      activeBills={activeBills}
      needsAttention={needsAttention}
      recentBills={[]}
      onBack={handleBack}
      onBillPress={handleBillPress}
      onAskPress={handleAskPress}
      onViewAllBills={handleViewAllBills}
    />
  );
}
