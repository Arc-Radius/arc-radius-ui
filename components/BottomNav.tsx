import { useRouter, usePathname, useSegments } from 'expo-router';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FileText as FileTextIcon,
  Home as HomeIcon,
  MessageCircleMore as AskIcon,
  Phone as PhoneIcon,
} from 'lucide-react-native';

import { DEFAULT_STATE, getCurrentStateAbbr } from './navigation/tab-config';

type Tab = 'home' | 'bills' | 'resources' | 'crisis';

interface BottomNavProps {
  activeTab?: Tab;
  onTabPress?: (tab: Tab) => void;
}

const ICON_SIZE = 20;

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
      return <HomeIcon size={ICON_SIZE} color={color} strokeWidth={1.4} />;
    case 'bills':
      return <FileTextIcon size={ICON_SIZE} color={color} strokeWidth={1.4} />;
    case 'resources':
      return <AskIcon size={ICON_SIZE} color={color} strokeWidth={1.8} />;
    case 'crisis':
      return <PhoneIcon size={ICON_SIZE} color={color} strokeWidth={1.4} />;
    default:
      return null;
  }
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'bills', label: 'Bills' },
  { key: 'resources', label: 'Ask' },
  { key: 'crisis', label: 'Crisis' },
];

function activeTabFromPathname(pathname: string): Tab {
  const p = pathname.split('?')[0] ?? '';
  if (p === '/' || p === '') return 'home';
  if (p.startsWith('/state/')) return 'bills';
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
        ...(Platform.OS === 'web' && {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }),
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
