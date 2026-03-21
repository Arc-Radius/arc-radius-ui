import { useRouter, usePathname, useSegments } from 'expo-router';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg';

import { DEFAULT_STATE, getCurrentStateAbbr } from './navigation/tab-config';

type Tab = 'home' | 'bills' | 'resources' | 'crisis';

interface BottomNavProps {
  activeTab?: Tab;
  onTabPress?: (tab: Tab) => void;
}

const ICON_SIZE = 22;

// Dark nav — matches state map & state overview card + HeroSection glass palette
const PALETTE = {
  active: '#93c5fd', // pastel blue (PolicyIcon)
  inactive: '#a1a1aa', // zinc
  crisis: '#fdba74', // light orange (BillIcon)
  activeBg: 'rgba(59,130,246,0.1)',
  activeBorder: 'rgba(59,130,246,0.25)',
  crisisBg: 'rgba(249,115,22,0.1)',
  crisisBorder: 'rgba(249,115,22,0.25)',
} as const;

function TabIcon({ tab, active }: { tab: Tab; active: boolean }) {
  const color = tab === 'crisis' ? PALETTE.crisis : active ? PALETTE.active : PALETTE.inactive;

  switch (tab) {
    case 'home':
      return (
        <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 20 20" fill="none">
          <Path
            d="M3 10L10 4L17 10"
            stroke={color}
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Rect x={5} y={10} width={10} height={7} rx={1} stroke={color} strokeWidth={1.2} />
        </Svg>
      );
    case 'bills':
      return (
        <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 20 20" fill="none">
          <Rect x={3} y={3} width={14} height={14} rx={2} stroke={color} strokeWidth={1.2} />
          <Line x1={7} y1={7} x2={13} y2={7} stroke={color} strokeWidth={1} strokeLinecap="round" />
          <Line
            x1={7}
            y1={10}
            x2={11}
            y2={10}
            stroke={color}
            strokeWidth={1}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'resources':
      return (
        <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 20 20" fill="none">
          <Circle cx={10} cy={10} r={7} stroke={color} strokeWidth={1.2} />
          <Path
            d="M10 7V10L12 12"
            stroke={color}
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'crisis':
      return (
        <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 20 20" fill="none">
          <Path
            d="M10 4L12 8H17L13 11L14.5 16L10 13L5.5 16L7 11L3 8H8L10 4Z"
            stroke={color}
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        </Svg>
      );
    default:
      return null;
  }
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'bills', label: 'Bills' },
  { key: 'resources', label: 'Resources' },
  { key: 'crisis', label: 'Crisis' },
];

function activeTabFromPathname(pathname: string): Tab {
  const p = pathname.split('?')[0] ?? '';
  if (p === '/' || p === '') return 'home';
  if (p.startsWith('/state/') || p.startsWith('/dashboard/')) return 'bills';
  if (p.startsWith('/ask')) return 'resources';
  if (p.startsWith('/crisis')) return 'crisis';
  return 'home';
}

export function BottomNav({ activeTab: activeTabProp, onTabPress }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  const activeTab = activeTabProp ?? activeTabFromPathname(pathname);

  const handlePress = (tab: Tab) => {
    onTabPress?.(tab);
    if (onTabPress) return;

    const stateAbbr = getCurrentStateAbbr(segments as string[]);
    switch (tab) {
      case 'home':
        router.push('/');
        break;
      case 'bills':
        router.push({
          pathname: '/state/[state]',
          params: { state: stateAbbr ?? DEFAULT_STATE },
        });
        break;
      case 'resources':
        router.push('/ask');
        break;
      case 'crisis':
        router.push('/crisis');
        break;
      default:
        break;
    }
  };

  return (
    <View
      style={{
        paddingBottom:
          Platform.OS === 'web' ? insets.bottom : Math.max(2, insets.bottom * 0.4),
        backgroundColor: '#18181b',
        borderTopWidth: 1,
        borderTopColor: 'rgba(63, 63, 70, 0.6)',
        ...(Platform.OS !== 'web' && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 8,
        }),
      }}>
      <View
        className="flex-row px-2 pt-1"
        style={{ paddingBottom: Platform.OS === 'web' ? 4 : 0 }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const isCrisis = tab.key === 'crisis';

          const labelColor = isCrisis
            ? PALETTE.crisis
            : isActive
              ? PALETTE.active
              : PALETTE.inactive;

          // Glass icon card style — like state overview protections/bills cards
          const iconCardStyle = isActive
            ? isCrisis
              ? {
                  backgroundColor: PALETTE.crisisBg,
                  borderWidth: 0.5,
                  borderColor: PALETTE.crisisBorder,
                }
              : {
                  backgroundColor: PALETTE.activeBg,
                  borderWidth: 0.5,
                  borderColor: PALETTE.activeBorder,
                }
            : { backgroundColor: 'transparent' as const };

          return (
            <Pressable
              key={tab.key}
              onPress={() => handlePress(tab.key)}
              className="flex-1 items-center gap-1 py-1 active:opacity-70"
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}>
              <View
                className="h-7 w-7 items-center justify-center rounded-lg"
                style={iconCardStyle}>
                <TabIcon tab={tab.key} active={isActive} />
              </View>

              <Text
                className="font-sans text-[10px]"
                style={{
                  color: labelColor,
                  fontWeight: isActive || isCrisis ? '500' : '400',
                }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
