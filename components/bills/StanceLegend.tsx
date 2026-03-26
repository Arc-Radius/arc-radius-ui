import { Text, View } from 'react-native';

import { STANCE_DOT, STANCE_LABEL } from '@/static/billConstants';
import type { LegislativeStatus } from '@/static/states';

const STANCES: LegislativeStatus[] = ['supportive', 'harmful', 'mixed'];

export function StanceLegend() {
  return (
    <View
      className="flex-row items-center gap-3.5 px-0 py-2.5"
      style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(212,212,216,0.6)' }}>
      {/* <Text className="font-sans-semibold text-[10px] uppercase tracking-widest text-zinc-500">
        Stance
      </Text> */}
      {STANCES.map((s) => (
        <View key={s} className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: STANCE_DOT[s] }} />
          <Text className="font-sans text-[11px] text-zinc-500">{STANCE_LABEL[s]}</Text>
        </View>
      ))}
    </View>
  );
}
