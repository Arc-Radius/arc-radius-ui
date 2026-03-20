import { useCallback, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeroSection } from './HeroSection';
import { PrivacyBanner } from './PrivacyBanner';
import { StateSearch } from './StateSearch';
import { TakeAction } from './TakeAction';
import ArcRadiusLogo from './ui/ArcRadiusLogo';
import { STATES, STATUS_STYLES } from '../static/states';

interface HomeScreenProps {
  onNavigateToState?: (stateAbbr: string) => void;
}

export function HomeScreen({ onNavigateToState }: HomeScreenProps) {
  const insets = useSafeAreaInsets();

  const scrollViewRef = useRef<ScrollView>(null);
  const mapOffsetY = useRef(0);

  const [selected, setSelected] = useState<string | null>(null);

  const selectedInfo = selected ? STATES[selected] : null;

  const handleFindState = useCallback(() => {
    scrollViewRef.current?.scrollTo({
      y: mapOffsetY.current - 16,
      animated: true,
    });
  }, []);

  const handleStateSelect = useCallback((abbr: string) => {
    setSelected(abbr);
    const info = STATES[abbr];
    if (info) {
      AccessibilityInfo.announceForAccessibility(
        `Selected ${info.name}, legislative climate: ${STATUS_STYLES[info.status].label}`
      );
    }
  }, []);

  const handleNavigateToState = useCallback(() => {
    if (!selected || !onNavigateToState) return;
    onNavigateToState(selected);
  }, [selected, onNavigateToState]);

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 bg-zinc-50"
      style={{ paddingTop: Platform.OS === 'web' ? 0 : insets.top }}>
      <View className="w-full max-w-screen-lg self-center px-4 pb-10 sm:px-6 md:px-8">
        {Platform.OS !== 'web' ? (
          <View className="mt-2 flex-row items-center gap-2.5">
            <ArcRadiusLogo size={32} />
            <Text className="font-serif-bold text-xl leading-8 text-zinc-800">Arc Radius</Text>
          </View>
        ) : null}

        <View className="mt-4">
          <HeroSection onFindState={handleFindState} />
        </View>

        <View
          className="mt-12"
          onLayout={(e) => {
            mapOffsetY.current = e.nativeEvent.layout.y;
          }}>
          <StateSearch
            selected={selected}
            selectedInfo={selectedInfo}
            onStateSelect={handleStateSelect}
            onNavigateToState={handleNavigateToState}
            scrollViewRef={scrollViewRef}
          />
        </View>

        <View className="mt-10">
          <TakeAction />
        </View>

        <View className="mt-4">
          <PrivacyBanner />
        </View>
      </View>
    </ScrollView>
  );
}
