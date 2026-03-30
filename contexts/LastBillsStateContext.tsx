import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { readLastBillsState, writeLastBillsState } from '@/lib/lastBillsStateStorage';
import { STATES } from '@/static/states';

interface LastBillsStateValue {
  lastBillsState: string | null;
  setLastBillsState: (abbr: string) => void;
}

const LastBillsStateContext = createContext<LastBillsStateValue | null>(null);

export function LastBillsStateProvider({ children }: { children: ReactNode }) {
  const [lastBillsState, setLastBillsStateInner] = useState<string | null>(null);

  useEffect(() => {
    void readLastBillsState().then(setLastBillsStateInner);
  }, []);

  const setLastBillsState = useCallback((abbr: string) => {
    const normalized = abbr.trim().toUpperCase();
    if (!STATES[normalized]) return;
    setLastBillsStateInner(normalized);
    void writeLastBillsState(normalized);
  }, []);

  const value = useMemo(
    () => ({ lastBillsState, setLastBillsState }),
    [lastBillsState, setLastBillsState]
  );

  return (
    <LastBillsStateContext.Provider value={value}>{children}</LastBillsStateContext.Provider>
  );
}

export function useLastBillsState(): LastBillsStateValue {
  const ctx = useContext(LastBillsStateContext);
  if (!ctx) {
    throw new Error('useLastBillsState must be used within LastBillsStateProvider');
  }
  return ctx;
}
