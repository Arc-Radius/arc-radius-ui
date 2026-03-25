import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { BillDetailPage } from '../../../../components/BillDetailPage';
import type { BillTab } from '../../../../static/billConstants';
import { getBillsForState } from '../../../../static/bills';
import { STATES } from '../../../../static/states';

function parseBillTab(raw: string | string[] | undefined): BillTab | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === 'passed') return 'passed';
  if (v === 'active') return 'active';
  return undefined;
}

export default function BillDetailRoute() {
  const { state, billId, billTab: billTabParam } = useLocalSearchParams<{
    state?: string | string[];
    billId?: string | string[];
    billTab?: string | string[];
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

  const billTabFromRoute = parseBillTab(billTabParam);

  return (
    <BillDetailPage
      stateName={resolvedStateName}
      bill={bill}
      relatedBills={relatedBills}
      billTab={billTabFromRoute ?? bill.billTab}
    />
  );
}
