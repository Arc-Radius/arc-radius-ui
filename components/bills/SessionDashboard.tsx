import { Text, View } from 'react-native';
import {
  SESSION_CALENDAR,
  getSessionStatus,
  formatSessionDate,
} from '@/static/sessionCalendar';

const STATUS_STYLES = {
  in_session: { label: 'In Session', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
  not_started: { label: 'Not Started', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  adjourned: { label: 'Adjourned', color: '#71717a', bg: 'rgba(113,113,122,0.1)' },
  no_session: { label: 'No Session', color: '#a1a1aa', bg: 'rgba(161,161,170,0.1)' },
};

export function SessionDashboard({ stateAbbr }: { stateAbbr: string }) {
  const info = SESSION_CALENDAR[stateAbbr];
  if (!info) return null;

  const status = getSessionStatus(info);
  const style = STATUS_STYLES[status];

  return (
    <View className="rounded-xl border border-zinc-200 bg-white p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-sans-semibold text-sm text-zinc-800">
          Legislative Session
        </Text>
        <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: style.bg }}>
          <Text className="font-sans-semibold text-[11px]" style={{ color: style.color }}>
            {style.label}
          </Text>
        </View>
      </View>

      <View className="gap-2">
        <View className="flex-row items-baseline justify-between">
          <Text className="font-sans text-xs text-zinc-500">Session</Text>
          <Text className="font-sans-medium text-xs text-zinc-800">{info.session}</Text>
        </View>

        {status !== 'no_session' && (
          <>
            <View className="flex-row items-baseline justify-between">
              <Text className="font-sans text-xs text-zinc-500">Convenes</Text>
              <Text className="font-sans-medium text-xs text-zinc-800">
                {formatSessionDate(info.convenes)}
              </Text>
            </View>
            <View className="flex-row items-baseline justify-between">
              <Text className="font-sans text-xs text-zinc-500">Adjourns</Text>
              <Text className="font-sans-medium text-xs text-zinc-800">
                {formatSessionDate(info.adjourns)}
              </Text>
            </View>
          </>
        )}

        {info.notes && (
          <View className="flex-row items-baseline justify-between">
            <Text className="font-sans text-xs text-zinc-500">Notes</Text>
            <Text className="font-sans-medium text-xs text-amber-600">{info.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
