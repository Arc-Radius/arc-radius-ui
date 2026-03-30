import AppShell from '@/components/shell/navigation/AppShell';
import { LastBillsStateProvider } from '@/contexts/LastBillsStateContext';

export default function AppLayout() {
  return (
    <LastBillsStateProvider>
      <AppShell />
    </LastBillsStateProvider>
  );
}
