import type { BillTab } from '@/static/billConstants';

export const queryKeys = {
  states: () => ['states'] as const,
  stateBills: (stateAbbr: string, tab: BillTab) => ['stateBills', stateAbbr, tab] as const,
  billDetail: (stateAbbr: string, billId: string) => ['billDetail', stateAbbr, billId] as const,
  billDetailByPk: (billPk: string) => ['billDetailByPk', billPk] as const,
  billText: (billId: string) => ['billText', billId] as const,
};
