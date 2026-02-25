import { Text, View } from 'react-native';

import { STATUS_STYLES } from '../static/states';
import type { LegislativeStatus } from '../static/states';

export function StatusBadge({ status }: { status: LegislativeStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <View
      className="flex-row items-center gap-1.5 rounded px-2.5 py-0.5"
      style={{ backgroundColor: s.bg }}
      accessible
      accessibilityLabel={`Legislative climate: ${s.label}`}
      accessibilityRole="text">
      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
      <Text
        className="font-sans-semibold text-xs uppercase tracking-wide"
        style={{ color: s.color }}>
        {s.label}
      </Text>
    </View>
  );
}
