import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname, useSegments } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useLastBillsState } from '@/contexts/LastBillsStateContext';

import { APP_TABS, getCurrentStateAbbr } from './tab-config';

interface AppTabsProps {
  position: 'top' | 'bottom' | 'header';
}

export default function AppTabs({ position }: AppTabsProps) {
  const pathname = usePathname();
  const segments = useSegments();
  const stateAbbrFromPath = getCurrentStateAbbr(segments as string[]);
  const { lastBillsState } = useLastBillsState();
  const isBottom = position === 'bottom';
  const isHeader = position === 'header';

  return (
    <View
      className={[
        'w-full bg-app-bg',
        isBottom
          ? 'flex-row border-t border-zinc-300 px-2 pb-2 pt-1'
          : isHeader
            ? 'flex-row flex-wrap items-center justify-end gap-1.5 bg-transparent md:flex-nowrap'
            : 'flex-row flex-wrap items-center gap-2 rounded-lg border border-zinc-200/90 bg-white p-2 shadow-sm md:flex-nowrap',
      ].join(' ')}>
      {APP_TABS.map((tab) => {
        const active = tab.matchesPath(pathname);
        const iconColor = active ? '#1C1917' : tab.id === 'crisis' ? '#B45309' : '#57534E';
        const href = tab.getHref({ stateAbbrFromPath, lastBillsState });
        const showIcons = !isHeader;
        const label = isHeader && tab.id === 'crisis' ? 'Crisis Help' : tab.label;
        const isCrisisButton = isHeader && tab.id === 'crisis';

        return (
          <Link key={tab.id} href={href} asChild>
            <Pressable
              className={[
                'min-h-11 min-w-11 rounded-md',
                isBottom
                  ? 'flex-1 items-center justify-center gap-1.5 py-2'
                  : isHeader
                    ? isCrisisButton
                      ? 'px-3.5 py-2.5'
                      : 'px-3.5 py-2.5'
                    : 'min-w-[88px] items-center justify-center gap-1.5 px-3 py-2 md:min-w-[104px]',
                isHeader
                  ? isCrisisButton
                    ? 'bg-[rgba(249,115,22,0.1)]'
                    : active
                      ? 'bg-zinc-700'
                      : ''
                  : active
                    ? 'bg-zinc-100'
                    : '',
              ].join(' ')}
              accessibilityRole="link"
              accessibilityState={{ selected: active }}>
              {showIcons ? <Ionicons name={tab.icon} size={20} color={iconColor} /> : null}
              <Text
                className={[
                  isBottom
                    ? 'font-sans-medium text-xs'
                    : isHeader
                      ? 'font-sans-medium text-sm'
                      : 'font-sans-medium text-[11px] md:text-xs',
                  isHeader
                    ? isCrisisButton
                      ? 'text-[#fdba74]'
                      : active
                        ? 'text-[#fafafa]'
                        : 'text-[#a1a1aa]'
                    : active
                      ? 'text-zinc-900'
                      : tab.id === 'crisis'
                        ? 'text-orange-600'
                        : 'text-zinc-600',
                ].join(' ')}>
                {label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}
