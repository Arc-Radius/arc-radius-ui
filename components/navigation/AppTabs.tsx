import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname, useSegments } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { APP_TABS, getCurrentStateAbbr } from './tab-config';

interface AppTabsProps {
  position: 'top' | 'bottom';
}

export default function AppTabs({ position }: AppTabsProps) {
  const pathname = usePathname();
  const segments = useSegments();
  const stateAbbr = getCurrentStateAbbr(segments);
  const isBottom = position === 'bottom';

  return (
    <View
      className={[
        'w-full bg-arc-cream',
        isBottom
          ? 'flex-row border-t border-stone-300 px-2 pb-2 pt-1'
          : 'flex-row items-center gap-2 rounded-lg border border-stone-300 bg-white p-2',
      ].join(' ')}
    >
      {APP_TABS.map((tab) => {
        const active = tab.matchesPath(pathname);
        const iconColor = active ? '#1C1917' : tab.id === 'crisis' ? '#B45309' : '#57534E';
        const href = tab.getHref({ stateAbbr });

        return (
          <Link key={tab.id} href={href} asChild>
            <Pressable
              className={[
                'min-h-11 min-w-11 rounded-md',
                isBottom ? 'flex-1 items-center justify-center gap-1.5 py-2' : 'px-3 py-2',
                active ? 'bg-stone-100' : '',
              ].join(' ')}
              accessibilityRole="link"
              accessibilityState={{ selected: active }}
            >
              <Ionicons name={tab.icon} size={20} color={iconColor} />
              <Text
                className={[
                  'font-sans-medium text-xs',
                  active ? 'text-stone-900' : tab.id === 'crisis' ? 'text-amber-700' : 'text-stone-600',
                ].join(' ')}
              >
                {tab.label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}
