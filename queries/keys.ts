export const queryKeys = {
  stateBills: (stateAbbr: string) => ['stateBills', stateAbbr] as const,
  billDetail: (stateAbbr: string, billId: string) => ['billDetail', stateAbbr, billId] as const,
};
