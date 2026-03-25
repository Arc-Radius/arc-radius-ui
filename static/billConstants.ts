import type { LegislativeStatus } from '../static/states';

// ── Bill types ──────────────────────────────────

export type BillTab = 'active' | 'passed';

export interface Bill {
  id: string;
  bill_number: string;
  title: string;
  description: string;
  stance: LegislativeStatus;
  /** Active vs passed legislation tab (state bills list). */
  billTab: BillTab;
  status: string;
  status_desc: string;
  last_action: string;
  last_action_date: string;
  year: number;
  primary_sponsor: string;
  issue_categories: string[];
  url?: string;
}

export type SortOrder = 'newest' | 'oldest';

export interface BillFilters {
  stances: Set<LegislativeStatus>;
  categories: Set<string>;
  years: Set<number>;
  sort: SortOrder;
}

// ── Stance palette ──────────────────────────────
// Blue = supportive · Amber = harmful · Zinc = neutral/mixed
// Matches HeroSection: #93c5fd / #a1a1aa / #fdba74

export const STANCE_DOT: Record<LegislativeStatus, string> = {
  supportive: '#93c5fd',
  mixed: '#a1a1aa',
  harmful: '#fdba74',
};

export const STANCE_LABEL: Record<LegislativeStatus, string> = {
  supportive: 'Supportive',
  mixed: 'Neutral',
  harmful: 'Harmful',
};

export const STANCE_CHECK_BG: Record<LegislativeStatus, string> = {
  supportive: '#3b82f6',
  mixed: '#71717a',
  harmful: '#f97316',
};

export const STANCE_BADGE: Record<LegislativeStatus, { bg: string; text: string }> = {
  supportive: { bg: 'rgba(147,197,253,0.15)', text: '#1d4ed8' },
  mixed: { bg: 'rgba(161,161,170,0.15)', text: '#52525b' },
  harmful: { bg: 'rgba(253,186,116,0.15)', text: '#c2410c' },
};

/** State dashboard header card + bill card header tint (supportive / neutral / harmful). */
export const STANCE_HEADER_GLASS: Record<LegislativeStatus, { bg: string; border: string }> = {
  supportive: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)' },
  mixed: { bg: 'rgba(161,161,170,0.06)', border: 'rgba(161,161,170,0.12)' },
  harmful: { bg: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.12)' },
};

export const ACCENT_BLUE = '#3b82f6';
