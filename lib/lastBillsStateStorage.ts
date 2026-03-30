import AsyncStorage from '@react-native-async-storage/async-storage';

import { STATES } from '@/static/states';

const STORAGE_KEY = 'arc_last_bills_state';

export async function readLastBillsState(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const abbr = raw.trim().toUpperCase();
    return STATES[abbr] ? abbr : null;
  } catch {
    return null;
  }
}

export async function writeLastBillsState(abbr: string): Promise<void> {
  const normalized = abbr.trim().toUpperCase();
  if (!STATES[normalized]) return;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, normalized);
  } catch {
    /* ignore */
  }
}
