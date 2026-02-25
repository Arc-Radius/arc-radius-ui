/*
 * ─────────────────────────────────────────────────────────────
 *  Shared state data, types, and legislative status constants
 *  Used by HomeScreen, StateSearch, FeatureCard, etc.
 * ─────────────────────────────────────────────────────────────
 */

// ── Types ────────────────────────────────────────
export type LegislativeStatus = 'supportive' | 'mixed' | 'harmful';

export interface StateInfo {
  name: string;
  status: LegislativeStatus;
}

// ── All 50 states ────────────────────────────────
export const STATES: Record<string, StateInfo> = {
  AL: { name: 'Alabama', status: 'harmful' },
  AK: { name: 'Alaska', status: 'mixed' },
  AZ: { name: 'Arizona', status: 'mixed' },
  AR: { name: 'Arkansas', status: 'harmful' },
  CA: { name: 'California', status: 'supportive' },
  CO: { name: 'Colorado', status: 'supportive' },
  CT: { name: 'Connecticut', status: 'supportive' },
  DE: { name: 'Delaware', status: 'supportive' },
  FL: { name: 'Florida', status: 'harmful' },
  GA: { name: 'Georgia', status: 'mixed' },
  HI: { name: 'Hawaii', status: 'supportive' },
  ID: { name: 'Idaho', status: 'harmful' },
  IL: { name: 'Illinois', status: 'supportive' },
  IN: { name: 'Indiana', status: 'harmful' },
  IA: { name: 'Iowa', status: 'mixed' },
  KS: { name: 'Kansas', status: 'harmful' },
  KY: { name: 'Kentucky', status: 'harmful' },
  LA: { name: 'Louisiana', status: 'harmful' },
  ME: { name: 'Maine', status: 'supportive' },
  MD: { name: 'Maryland', status: 'supportive' },
  MA: { name: 'Massachusetts', status: 'supportive' },
  MI: { name: 'Michigan', status: 'mixed' },
  MN: { name: 'Minnesota', status: 'supportive' },
  MS: { name: 'Mississippi', status: 'harmful' },
  MO: { name: 'Missouri', status: 'harmful' },
  MT: { name: 'Montana', status: 'mixed' },
  NE: { name: 'Nebraska', status: 'harmful' },
  NV: { name: 'Nevada', status: 'supportive' },
  NH: { name: 'New Hampshire', status: 'supportive' },
  NJ: { name: 'New Jersey', status: 'supportive' },
  NM: { name: 'New Mexico', status: 'supportive' },
  NY: { name: 'New York', status: 'supportive' },
  NC: { name: 'North Carolina', status: 'mixed' },
  ND: { name: 'North Dakota', status: 'harmful' },
  OH: { name: 'Ohio', status: 'mixed' },
  OK: { name: 'Oklahoma', status: 'harmful' },
  OR: { name: 'Oregon', status: 'supportive' },
  PA: { name: 'Pennsylvania', status: 'mixed' },
  RI: { name: 'Rhode Island', status: 'supportive' },
  SC: { name: 'South Carolina', status: 'harmful' },
  SD: { name: 'South Dakota', status: 'harmful' },
  TN: { name: 'Tennessee', status: 'harmful' },
  TX: { name: 'Texas', status: 'harmful' },
  UT: { name: 'Utah', status: 'harmful' },
  VT: { name: 'Vermont', status: 'supportive' },
  VA: { name: 'Virginia', status: 'supportive' },
  WA: { name: 'Washington', status: 'supportive' },
  WV: { name: 'West Virginia', status: 'harmful' },
  WI: { name: 'Wisconsin', status: 'mixed' },
  WY: { name: 'Wyoming', status: 'harmful' },
};

// ── Status display styles (Okabe-Ito colorblind-safe) ──
export const STATUS_STYLES: Record<
  LegislativeStatus,
  { label: string; color: string; bg: string; cellBg: string }
> = {
  supportive: {
    label: 'Supportive',
    color: '#0072B2',
    bg: '#DAEAF5',
    cellBg: '#0072B2',
  },
  mixed: {
    label: 'Mixed',
    color: '#E69F00',
    bg: '#FDF0CC',
    cellBg: '#E69F00',
  },
  harmful: {
    label: 'High Risk',
    color: '#D55E00',
    bg: '#FAE2D2',
    cellBg: '#D55E00',
  },
};

// ── A11y symbols (supplement color for colorblind users) ──
export const STATUS_SYMBOL: Record<LegislativeStatus, string> = {
  supportive: '●',
  mixed: '▲',
  harmful: '■',
};

// ── Geographic tile-grid layout ──────────────────
export const MAP_ROWS: (string | null)[][] = [
  [null, null, null, null, null, null, null, null, null, null, 'ME', 'VT'],
  ['WA', 'MT', 'ND', 'MN', 'WI', null, 'MI', null, null, 'NY', 'NH', 'MA'],
  ['OR', 'ID', 'WY', 'SD', 'IA', 'IL', 'IN', 'OH', 'PA', 'NJ', 'CT', 'RI'],
  ['CA', 'NV', 'UT', 'CO', 'NE', 'KS', 'MO', 'KY', 'WV', 'VA', 'MD', 'DE'],
  [null, 'AZ', 'NM', 'OK', 'AR', 'TN', 'NC', 'SC', null, null, null, null],
  [null, null, 'TX', null, 'LA', 'MS', 'AL', 'GA', null, null, null, null],
  [null, null, null, null, null, null, 'FL', null, null, null, null, null],
  ['AK', 'HI', null, null, null, null, null, null, null, null, null, null],
];
