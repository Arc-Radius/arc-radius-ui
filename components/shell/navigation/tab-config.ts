import type { Href } from 'expo-router';

export type AppTabId = 'home' | 'bills' | 'crisis';

/** Default state code for non-Bills URLs (e.g. external affiliate links). */
export const DEFAULT_STATE = 'CA';

export interface TabContext {
  /** Two-letter code when the current URL is `/state/XX`. */
  stateAbbrFromPath?: string;
  lastBillsState: string | null;
}

export function getBillsTabHref(ctx: Pick<TabContext, 'stateAbbrFromPath' | 'lastBillsState'>): Href {
  if (ctx.stateAbbrFromPath) {
    return { pathname: '/state/[stateAbbr]', params: { stateAbbr: ctx.stateAbbrFromPath } };
  }
  if (ctx.lastBillsState) {
    return { pathname: '/state/[stateAbbr]', params: { stateAbbr: ctx.lastBillsState } };
  }
  return '/state';
}

function normalizePathname(pathname: string): string {
  return pathname.split('?')[0] ?? '';
}

interface AppTabConfig {
  id: AppTabId;
  routeName: string;
  label: string;
  icon: 'home-outline' | 'document-text-outline' | 'warning-outline' | 'call-outline';
  getHref: (context: TabContext) => Href;
  matchesPath: (pathname: string) => boolean;
}

export const APP_TABS: AppTabConfig[] = [
  {
    id: 'home',
    routeName: 'index',
    label: 'Home',
    icon: 'home-outline',
    getHref: () => '/',
    matchesPath: (pathname) => {
      const p = normalizePathname(pathname);
      return p === '/' || p === '';
    },
  },
  {
    id: 'bills',
    routeName: 'state/[stateAbbr]',
    label: 'Bills',
    icon: 'document-text-outline',
    getHref: (ctx) => getBillsTabHref(ctx),
    matchesPath: (pathname) => {
      const p = normalizePathname(pathname);
      return p === '/state' || p.startsWith('/state/');
    },
  },
  {
    id: 'crisis',
    routeName: 'crisis',
    label: 'Crisis',
    icon: 'call-outline',
    getHref: () => '/crisis',
    matchesPath: (pathname) => pathname.startsWith('/crisis'),
  },
];

export function getCurrentStateAbbr(segments: string[]): string | undefined {
  const cleaned = segments.filter((segment) => segment && !segment.startsWith('('));

  if (cleaned[0] !== 'state') {
    return undefined;
  }

  const candidate = cleaned[1];
  if (!candidate || candidate.length !== 2) {
    return undefined;
  }

  const normalized = candidate.toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : undefined;
}
