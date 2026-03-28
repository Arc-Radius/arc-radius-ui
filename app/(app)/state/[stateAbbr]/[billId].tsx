import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { BillDetailPage } from '@/components/bills/BillDetailPage';
import { useBillDetailQuery } from '@/queries/useBillDetailQuery';
import { useStateBillsQuery } from '@/queries/useStateBillsQuery';
import type { BillTab } from '@/static/billConstants';
import { STATES } from '@/static/states';

function parseBillTab(raw: string | string[] | undefined): BillTab | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === 'passed') return 'passed';
  if (v === 'active') return 'active';
  return undefined;
}

export default function BillDetailRoute() {
  const {
    stateAbbr: stateParam,
    billId,
    billTab: billTabParam,
  } = useLocalSearchParams<{
    stateAbbr?: string | string[];
    billId?: string | string[];
    billTab?: string | string[];
  }>();

  const stateAbbr = useMemo(() => {
    const rawState = Array.isArray(stateParam) ? stateParam[0] : stateParam;
    return typeof rawState === 'string' ? rawState.trim().toUpperCase() : '';
  }, [stateParam]);

  const normalizedBillId = useMemo(() => {
    const rawBillId = Array.isArray(billId) ? billId[0] : billId;
    return typeof rawBillId === 'string' ? rawBillId.trim() : '';
  }, [billId]);

  const stateInfo = stateAbbr ? STATES[stateAbbr] : null;
  const resolvedStateName = stateInfo?.name ?? (stateAbbr || 'Unknown State');
  const detailQuery = useBillDetailQuery(stateAbbr, normalizedBillId);
  const stateBillsQuery = useStateBillsQuery(stateAbbr);
  const stateBills = stateBillsQuery.data ?? [];
  const bill = detailQuery.data;
  const relatedBills = useMemo(() => {
    if (!bill) return [];
    return stateBills.filter((item) => bill.relatedBillIds.includes(item.id));
  }, [bill, stateBills]);

  const billTabFromRoute = parseBillTab(billTabParam);

  if (detailQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg px-6">
        <Text className="font-sans text-sm text-zinc-500">Loading bill details...</Text>
      </View>
    );
  }

  if (detailQuery.isError || !bill) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg px-6">
        <Text className="text-center font-sans text-sm text-zinc-500">
          Failed to load this bill right now.
        </Text>
      </View>
    );
  }

  return (
    <BillDetailPage
      stateName={resolvedStateName}
      bill={bill}
      relatedBills={relatedBills}
      billTab={billTabFromRoute ?? bill.billTab ?? 'active'}
    />
  );
}
