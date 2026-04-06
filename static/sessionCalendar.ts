/** 2026 Legislative Session Calendar — sourced from LegiScan (Feb 4, 2026). */

export interface SessionInfo {
  session: string;
  convenes: string;
  adjourns: string;
  notes?: string;
}

export const SESSION_CALENDAR: Record<string, SessionInfo> = {
  AL: { session: '2026 Regular Session', convenes: '2026-01-13', adjourns: '2026-03-27' },
  AK: { session: '34th Legislature', convenes: '2026-01-20', adjourns: '2026-05-21' },
  AZ: { session: '57th Legislature', convenes: '2026-01-12', adjourns: '2026-04-25' },
  AR: { session: '95th General Assembly', convenes: '2026-04-08', adjourns: '2026-05-07' },
  CA: { session: '2025-2026 Biennium', convenes: '2026-01-05', adjourns: '2026-08-31' },
  CO: { session: '2026 Regular Session', convenes: '2026-01-14', adjourns: '2026-05-06' },
  CT: { session: '2026 Regular Session', convenes: '2026-02-04', adjourns: '2026-05-06' },
  DE: { session: '153rd General Assembly', convenes: '2026-01-13', adjourns: '2026-06-30' },
  FL: { session: '2026 Regular Session', convenes: '2026-01-13', adjourns: '2026-03-13' },
  GA: { session: '2025-2026 Biennium', convenes: '2026-01-12', adjourns: '2026-04-06' },
  HI: { session: '2026 Regular Session', convenes: '2026-01-21', adjourns: '2026-05-07' },
  ID: { session: '2026 Regular Session', convenes: '2026-01-12', adjourns: '2026-04-10' },
  IL: { session: '104th General Assembly', convenes: '2026-01-14', adjourns: '2026-05-31' },
  IN: { session: '2026 Regular Session', convenes: '2025-12-01', adjourns: '2026-02-27' },
  IA: { session: '91st General Assembly', convenes: '2026-01-12', adjourns: '2026-04-30' },
  KS: { session: '2025-2026 Biennium', convenes: '2026-01-12', adjourns: '2026-04-10' },
  KY: { session: '2026 Regular Session', convenes: '2026-01-06', adjourns: '2026-04-15' },
  LA: { session: '2026 Regular Session', convenes: '2026-03-09', adjourns: '2026-06-01', notes: 'Prefiling' },
  ME: { session: '132nd Legislature', convenes: '2026-01-07', adjourns: '2026-04-15' },
  MD: { session: '2026 Regular Session', convenes: '2026-01-14', adjourns: '2026-04-13' },
  MA: { session: '194th General Court', convenes: '2026-01-07', adjourns: '2026-07-31' },
  MI: { session: '103rd Legislature', convenes: '2026-01-14', adjourns: '2026-12-31' },
  MN: { session: '94th Legislature', convenes: '2026-02-17', adjourns: '2026-05-18' },
  MS: { session: '2026 Regular Session', convenes: '2026-01-06', adjourns: '2026-04-05' },
  MO: { session: '2026 Regular Session', convenes: '2026-01-07', adjourns: '2026-05-30' },
  MT: { session: 'No Regular Session in 2026', convenes: '', adjourns: '' },
  NE: { session: '109th Legislature', convenes: '2026-01-07', adjourns: '2026-04-17' },
  NV: { session: 'No Regular Session in 2026', convenes: '', adjourns: '' },
  NH: { session: '2026 Regular Session', convenes: '2026-01-07', adjourns: '2026-06-30' },
  NJ: { session: '2026-2027 Biennium', convenes: '2026-01-13', adjourns: '2028-01-11' },
  NM: { session: '2026 Regular Session', convenes: '2026-01-20', adjourns: '2026-02-19' },
  NY: { session: '2025-2026 Biennium', convenes: '2026-01-07', adjourns: '2026-06-04' },
  NC: { session: '2025-2026 Biennium', convenes: '2026-04-21', adjourns: '2026-08-31' },
  ND: { session: 'No Regular Session in 2026', convenes: '', adjourns: '' },
  OH: { session: '136th General Assembly', convenes: '2026-01-05', adjourns: '2026-12-31' },
  OK: { session: '2026 Regular Session', convenes: '2026-02-02', adjourns: '2026-05-30' },
  OR: { session: '2026 Regular Session', convenes: '2026-02-02', adjourns: '2026-03-09' },
  PA: { session: '2025-2026 Biennium', convenes: '2026-01-06', adjourns: '2026-11-30' },
  RI: { session: '2026 Regular Session', convenes: '2026-01-06', adjourns: '2026-06-30' },
  SC: { session: '126th General Assembly', convenes: '2026-01-13', adjourns: '2026-05-07' },
  SD: { session: '2026 Regular Session', convenes: '2026-01-13', adjourns: '2026-03-30' },
  TN: { session: '114th General Assembly', convenes: '2026-01-13', adjourns: '2026-04-26' },
  TX: { session: 'No Regular Session in 2026', convenes: '', adjourns: '' },
  UT: { session: '2026 Regular Session', convenes: '2026-01-20', adjourns: '2026-03-07' },
  VT: { session: '2025-2026 Biennium', convenes: '2026-01-06', adjourns: '2026-05-08' },
  VA: { session: '2026 Regular Session', convenes: '2026-01-14', adjourns: '2026-03-14' },
  WA: { session: '2025-2026 Biennium', convenes: '2026-01-12', adjourns: '2026-03-12' },
  WV: { session: '2026 Regular Session', convenes: '2026-01-14', adjourns: '2026-03-14' },
  WI: { session: '2025-2026 Biennium', convenes: '2026-01-13', adjourns: '2026-03-19' },
  WY: { session: '2026 Budget Session', convenes: '2026-02-09', adjourns: '2026-03-06', notes: 'Prefiling' },
};

/** Compute session status relative to today. */
export function getSessionStatus(info: SessionInfo): 'not_started' | 'in_session' | 'adjourned' | 'no_session' {
  if (!info.convenes) return 'no_session';
  const today = new Date().toISOString().slice(0, 10);
  if (today < info.convenes) return 'not_started';
  if (today > info.adjourns) return 'adjourned';
  return 'in_session';
}

/** Format date as "Jan 13, 2026". */
export function formatSessionDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
