import { useCallback, useState } from 'react';
import { AccessibilityInfo, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeatureCard } from './FeatureCard';
import { HeroSection } from './HeroSection';
import { PrivacyBanner } from './PrivacyBanner';
import { StateSearch } from './StateSearch';
import { TakeAction } from './TakeAction';
import { STATES, STATUS_STYLES } from '../static/states';

interface HomeScreenProps {
  onNavigateToState?: (stateAbbr: string) => void;
}

export function HomeScreen({ onNavigateToState }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  const [selected, setSelected] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  const selectedInfo = selected ? STATES[selected] : null;

  const handleStateSelect = useCallback((abbr: string) => {
    setSelected(abbr);
    const info = STATES[abbr];
    if (info) {
      AccessibilityInfo.announceForAccessibility(
        `Selected ${info.name}, legislative climate: ${STATUS_STYLES[info.status].label}`
      );
    }
  }, []);

  const toggleMap = useCallback(() => setShowMap((v) => !v), []);
  const handleNavigateToState = useCallback(() => {
    if (!selected || !onNavigateToState) return;
    onNavigateToState(selected);
  }, [selected, onNavigateToState]);

  return (
    <ScrollView className="flex-1 bg-arc-cream" style={{ paddingTop: insets.top }}>
      <View className="w-full max-w-3xl self-center px-6 pb-10">
        <View className="mt-4">
          <HeroSection />
        </View>

        <View className="mt-12">
          <StateSearch
            showMap={showMap}
            onToggleMap={toggleMap}
            selected={selected}
            selectedInfo={selectedInfo}
            onStateSelect={handleStateSelect}
          />
        </View>

        <View className={[isCompact ? 'mt-10 gap-4' : 'mt-10 flex-row flex-wrap gap-4'].join(' ')}>
          <FeatureCard
            title="Policy Overview"
            description={
              selectedInfo
                ? `Current LGBTQ+ protections and legal landscape in ${selectedInfo.name}.`
                : 'Select a state to view current LGBTQ+ protections and legal landscape.'
            }
            buttonLabel="View Policies →"
            status={selectedInfo?.status}
            onPress={selected ? handleNavigateToState : undefined}
          />
          <FeatureCard
            title="Proposed Bills"
            description={
              selectedInfo
                ? `Active legislation that may affect LGBTQ+ youth in ${selectedInfo.name}.`
                : 'Select a state to track active legislation affecting LGBTQ+ youth.'
            }
            buttonLabel="View Bills →"
            status={selectedInfo?.status}
            onPress={selected ? handleNavigateToState : undefined}
          />
        </View>

        <View className="mt-4">
          <TakeAction />
        </View>

        <View className="mt-4">
          <PrivacyBanner />
        </View>
      </View>
    </ScrollView>
  );
}
