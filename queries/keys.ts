import type { BillTab } from '@/static/billConstants';

export const queryKeys = {
  stateBills: (stateAbbr: string, tab: BillTab) => ['stateBills', stateAbbr, tab] as const,
  billDetail: (stateAbbr: string, billId: string) => ['billDetail', stateAbbr, billId] as const,
};
