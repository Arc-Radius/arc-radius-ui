// app/dashboard/[state].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import StateDashboard from '../../components/StateDashboard';

export default function Dashboard() {
  const { state } = useLocalSearchParams<{ state: string }>();
  const router = useRouter();

  return (
    <StateDashboard
      stateAbbr={state}
      stateName={state}
      overallStatus="supportive"
      activeBills={12}
      needsAttention={3}
      recentBills={[]}
      onBack={() => router.back()}
    />
  );
}
