import type { Href } from 'expo-router';

export type AppTabId = 'home' | 'bills' | 'crisis';

interface TabContext {
  stateAbbr?: string;
}

interface AppTabConfig {
  id: AppTabId;
  routeName: string;
  label: string;
  icon: 'home-outline' | 'document-text-outline' | 'warning-outline';
  getHref: (context: TabContext) => Href;
  matchesPath: (pathname: string) => boolean;
}

export const DEFAULT_STATE = 'CA';

export const APP_TABS: AppTabConfig[] = [
  {
    id: 'home',
    routeName: 'index',
    label: 'Home',
    icon: 'home-outline',
    getHref: () => '/',
    matchesPath: (pathname) => pathname === '/',
  },
  {
    id: 'bills',
    routeName: 'state/[state]',
    label: 'Bills',
    icon: 'document-text-outline',
    getHref: ({ stateAbbr }) => ({
      pathname: '/state/[state]',
      params: { state: stateAbbr ?? DEFAULT_STATE },
    }),
    matchesPath: (pathname) => pathname.startsWith('/state/') || pathname.startsWith('/dashboard/'),
  },
  {
    id: 'crisis',
    routeName: 'crisis',
    label: 'Crisis',
    icon: 'warning-outline',
    getHref: () => '/crisis',
    matchesPath: (pathname) => pathname.startsWith('/crisis'),
  },
];

export function getCurrentStateAbbr(segments: string[]): string | undefined {
  const cleaned = segments.filter((segment) => segment && !segment.startsWith('('));

  if (cleaned[0] !== 'state' && cleaned[0] !== 'dashboard') {
    return undefined;
  }

  const candidate = cleaned[1];
  if (!candidate || candidate.length !== 2) {
    return undefined;
  }

  const normalized = candidate.toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : undefined;
}
