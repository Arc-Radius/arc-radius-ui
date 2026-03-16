// app/dashboard/[state].tsx
import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import StateDashboard from '../../components/StateDashboard';
import { STATES } from '../../static/states';

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
    Alert.alert('Coming soon', 'Rights Q&A is not wired yet.');
  }, []);

  const handleBillPress = useCallback((billId: string) => {
    Alert.alert('Bill details', `Open bill details for ${billId} (not wired yet).`);
  }, []);

  const handleTabPress = useCallback(
    (tab: 'home' | 'bills' | 'ask' | 'crisis') => {
      if (tab === 'home') {
        router.replace('/');
        return;
      }

      Alert.alert('Coming soon', `${tab[0].toUpperCase()}${tab.slice(1)} is not wired yet.`);
    },
    [router]
  );

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
      onTabPress={handleTabPress}
    />
  );
}
