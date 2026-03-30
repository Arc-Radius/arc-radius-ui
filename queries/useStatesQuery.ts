import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { fetchStates } from '@/api/states';
import type { StateListItem } from '@/api/schemas';

import { queryKeys } from './keys';

const STALE_MS = 10 * 60 * 1000;

export function aggregateStatusCounts(states: StateListItem[]) {
  let supportive = 0;
  let mixed = 0;
  let harmful = 0;
  for (const s of states) {
    if (s.status === 'supportive') supportive++;
    else if (s.status === 'mixed') mixed++;
    else harmful++;
  }
  return { supportive, mixed, harmful };
}

export function statesToByAbbr(states: StateListItem[]): Record<string, StateListItem> {
  const r: Record<string, StateListItem> = {};
  for (const s of states) {
    r[s.abbr.trim().toUpperCase()] = { ...s, abbr: s.abbr.trim().toUpperCase() };
  }
  return r;
}

export function useStatesQuery() {
  return useQuery({
    queryKey: queryKeys.states(),
    queryFn: ({ signal }) => fetchStates(signal),
    staleTime: STALE_MS,
  });
}

export function useStatesDerived() {
  const query = useStatesQuery();
  const statesByAbbr = useMemo(() => {
    if (!query.data?.states) return null;
    return statesToByAbbr(query.data.states);
  }, [query.data]);
  const statusCounts = useMemo(() => {
    if (!query.data?.states) return null;
    return aggregateStatusCounts(query.data.states);
  }, [query.data]);
  const dropdownOptions = useMemo(() => {
    if (!query.data?.states) return null;
    return query.data.states
      .map((s) => ({ abbr: s.abbr.trim().toUpperCase(), name: s.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [query.data]);
  return { ...query, statesByAbbr, statusCounts, dropdownOptions };
}
