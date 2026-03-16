import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname, useSegments } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { APP_TABS, getCurrentStateAbbr } from './tab-config';

interface AppTabsProps {
  position: 'top' | 'bottom' | 'header';
}

export default function AppTabs({ position }: AppTabsProps) {
  const pathname = usePathname();
  const segments = useSegments();
  const stateAbbr = getCurrentStateAbbr(segments);
  const isBottom = position === 'bottom';
  const isHeader = position === 'header';

  return (
    <View
      className={[
        'w-full bg-arc-cream',
        isBottom
          ? 'flex-row border-t border-stone-300 px-2 pb-2 pt-1'
          : isHeader
            ? 'flex-row flex-wrap items-center justify-end gap-1.5 bg-transparent md:flex-nowrap'
            : 'flex-row flex-wrap items-center gap-2 rounded-lg border border-stone-300 bg-white p-2 md:flex-nowrap',
      ].join(' ')}
    >
      {APP_TABS.map((tab) => {
        const active = tab.matchesPath(pathname);
        const iconColor = active ? '#1C1917' : tab.id === 'crisis' ? '#B45309' : '#57534E';
        const href = tab.getHref({ stateAbbr });
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
                    ? active
                      ? 'bg-stone-700'
                      : 'bg-stone-900'
                    : active
                      ? 'bg-stone-100'
                      : ''
                  : active
                    ? 'bg-stone-100'
                    : '',
              ].join(' ')}
              accessibilityRole="link"
              accessibilityState={{ selected: active }}
            >
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
                      ? 'text-white'
                      : active
                        ? 'text-stone-900'
                        : 'text-stone-500'
                    : active
                      ? 'text-stone-900'
                      : tab.id === 'crisis'
                        ? 'text-amber-700'
                        : 'text-stone-600',
                ].join(' ')}
              >
                {label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}
