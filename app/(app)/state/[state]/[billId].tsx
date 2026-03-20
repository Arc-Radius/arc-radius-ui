import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { BillDetailPage } from '../../../../components/BillDetailPage';
import { getBillsForState } from '../../../../static/bills';
import { STATES } from '../../../../static/states';

export default function BillDetailRoute() {
  const { state, billId } = useLocalSearchParams<{
    state?: string | string[];
    billId?: string | string[];
  }>();

  const stateAbbr = useMemo(() => {
    const rawState = Array.isArray(state) ? state[0] : state;
    return typeof rawState === 'string' ? rawState.trim().toUpperCase() : '';
  }, [state]);

  const normalizedBillId = useMemo(() => {
    const rawBillId = Array.isArray(billId) ? billId[0] : billId;
    return typeof rawBillId === 'string' ? rawBillId.trim() : '';
  }, [billId]);

  const stateInfo = stateAbbr ? STATES[stateAbbr] : null;
  const fallbackStateName = stateAbbr || 'Unknown State';

  const resolvedStateAbbr = stateAbbr || 'N/A';
  const resolvedStateName = stateInfo?.name ?? fallbackStateName;
  const resolvedStatus = stateInfo?.status ?? 'mixed';

  const bills = useMemo(
    () =>
      getBillsForState({
        stateAbbr: resolvedStateAbbr,
        stateName: resolvedStateName,
        status: resolvedStatus,
      }),
    [resolvedStateAbbr, resolvedStateName, resolvedStatus]
  );
  const bill = bills.find((item) => item.id === normalizedBillId) ?? bills[0];
  const relatedBills = bills.filter((item) => bill.relatedBillIds.includes(item.id));

  return <BillDetailPage stateName={resolvedStateName} bill={bill} relatedBills={relatedBills} />;
}
