import { Link, usePathname } from 'expo-router';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

import ArcRadiusLogo from '@/components/ui/ArcRadiusLogo';
import { APP_TABS, DEFAULT_STATE } from '@/components/shell/navigation/tab-config';
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
  if (p.startsWith('/ask')) return { label: 'Ask a question' };

  // Crisis
  if (p.startsWith('/crisis')) return { label: 'Crisis resources', dot: '#f97316' };

  // Home / default
  return { label: '50 states tracked' };
}

// ── Nav link (bordered blue when active) ─────────
function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} asChild>
      <Pressable
        className="rounded-lg px-3.5 py-[7px] active:opacity-70"
        style={{
          borderWidth: 1,
          borderColor: active ? 'rgba(59,130,246,0.35)' : 'transparent',
        }}
        accessibilityRole="link">
        <Text
          className={`text-[13px] ${active ? 'font-sans-semibold' : 'font-sans'}`}
          style={{ color: active ? '#3b82f6' : '#71717a' }}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

// ── Crisis link (always orange border + dot) ─────
function CrisisLink({ active }: { active: boolean }) {
  return (
    <Link href="/crisis" asChild>
      <Pressable
        className="rounded-lg px-3.5 py-[7px] active:opacity-70"
        style={{
          borderWidth: 1,
          borderColor: active ? 'rgba(249,115,22,0.4)' : 'rgba(249,115,22,0.25)',
        }}
        accessibilityRole="link"
        accessibilityLabel="Crisis help">
        <View className="flex-row items-center gap-1.5">
          <View className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: '#f97316' }} />
          <Text className="font-sans-semibold text-[13px]" style={{ color: '#9a3412' }}>
            Crisis
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

// ── Header ───────────────────────────────────────
export function Header() {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const pathname = usePathname();

  // Use APP_TABS matchesPath for active state
  const activeTab = APP_TABS.find((t) => t.matchesPath(pathname))?.id ?? 'home';
  const status = useStatusText();

  // Get current state abbr for Bills href
  const stateAbbr = getStateFromPath(pathname) ?? DEFAULT_STATE;

  return (
    <View className="flex-row items-center justify-between border-b border-zinc-200/80 bg-app-bg px-4 py-2.5 sm:px-6 md:px-8">
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
    </View>
  );
}
