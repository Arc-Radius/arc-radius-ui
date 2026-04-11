import { Link, usePathname } from 'expo-router';
import { Linking, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Compass } from 'lucide-react-native';
import { twMerge } from 'tailwind-merge';

import ArcRadiusLogo from '@/components/ui/ArcRadiusLogo';
import { screenGutterClass } from '@/components/ui/screen-layout';
import { STATES } from '@/static/states';

// ── Extract state abbr from pathname ─────────────
function getStateFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/state\/([A-Za-z]{2})/);
  return match ? match[1].toUpperCase() : undefined;
}

// ── Contextual status text ───────────────────────
function useStatusText(): { label: string; dot?: string } {
  const pathname = usePathname();
  const p = pathname.split('?')[0] ?? '';

  if (p === '/state') {
    return { label: 'Select a state' };
  }

  // State / bills page
  if (p.startsWith('/state/')) {
    const abbr = getStateFromPath(p);
    if (abbr) {
      const info = STATES[abbr];
      if (info) {
        const dot =
          info.status === 'supportive'
            ? '#3b82f6'
            : info.status === 'harmful'
              ? '#f97316'
              : '#a1a1aa';
        return { label: `${abbr} · ${info.name}`, dot };
      }
    }
    return { label: 'Browse bills' };
  }

  // Ask page
  if (p.startsWith('/ask')) return { label: 'Bills Q & A' };

  // Crisis
  if (p.startsWith('/crisis')) return { label: 'Help & Support', dot: '#f97316' };

  // Home / default
  return { label: '50 states tracked' };
}

// ── Header ───────────────────────────────────────
export function Header() {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const status = useStatusText();

  return (
    <View
      className={twMerge(
        'flex-row items-center justify-between border-b border-zinc-200/80 bg-app-bg py-2.5',
        screenGutterClass
      )}>
      {/* Left: logo + contextual status */}
      <View className="flex-row items-center gap-2.5">
        <Link href="/" asChild>
          <Pressable className="flex-row items-center gap-2.5 active:opacity-80">
            <ArcRadiusLogo size={30} />
            <Text className="font-sans-bold text-[15px] text-zinc-800">Arc Radius</Text>
          </Pressable>
        </Link>

        {/* Divider + status */}
        <View className="h-4 w-px bg-zinc-200" />
        <View className="flex-row items-center gap-1.5">
          {status.dot && (
            <View className="h-[6px] w-[6px] rounded-sm" style={{ backgroundColor: status.dot }} />
          )}
          <Text className="font-sans text-[12px] text-zinc-600">{status.label}</Text>
        </View>
      </View>
      {/* Right: About us */}
      <Pressable
        onPress={() => Linking.openURL('https://ambroquach29.github.io/spring26-mids-capstone/#about')}
        className="flex-row items-center gap-1 rounded-lg active:opacity-70"
        style={{
          paddingHorizontal: isCompact ? 8 : 12,
          paddingVertical: isCompact ? 4 : 6,
          borderWidth: 1,
          borderColor: 'rgba(59,130,246,0.25)',
        }}>
        <Compass size={isCompact ? 11 : 13} color="#3b82f6" />
        <Text
          className="font-sans-medium"
          style={{ color: '#3b82f6', fontSize: isCompact ? 10 : 12 }}>
          About
        </Text>
      </Pressable>
    </View>
  );
}
