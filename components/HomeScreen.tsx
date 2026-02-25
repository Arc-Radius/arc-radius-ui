import { useCallback, useState } from 'react';
import { AccessibilityInfo, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeatureCard } from './FeatureCard';
import { Footer } from './Footer';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { PrivacyBanner } from './PrivacyBanner';
import { StateSearch } from './StateSearch';
import { TakeAction } from './TakeAction';
import { STATES, STATUS_STYLES } from '../static/states';

export function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [zip, setZip] = useState('');
  const [zipError, setZipError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  const isZipValid = zip.length === 5;

  const selectedInfo = selected ? STATES[selected] : null;

  const handleZipChange = useCallback((text: string) => {
    setZip(text.replace(/\D/g, '').slice(0, 5));
    setZipError(null); // clear error on edit
  }, []);

  const handleSearch = useCallback(async () => {
    if (!isZipValid) return;

    setZipError(null);
    AccessibilityInfo.announceForAccessibility(`Searching for ZIP code ${zip}`);

    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (!res.ok) {
        setZipError('ZIP code not found. Please try again.');
        AccessibilityInfo.announceForAccessibility('ZIP code not found. Please try again.');
        return;
      }

      const data = await res.json();
      const abbr = data?.places?.[0]?.['state abbreviation'];

      if (abbr && STATES[abbr]) {
        setSelected(abbr);
        setShowMap(true);
        AccessibilityInfo.announceForAccessibility(
          `Found ${STATES[abbr].name}, legislative climate: ${STATUS_STYLES[STATES[abbr].status].label}`
        );
      }
    } catch {
      setZipError('Search failed. Please check your connection.');
      AccessibilityInfo.announceForAccessibility('Search failed. Please check your connection.');
    }
  }, [zip, isZipValid]);

  const handleStateSelect = useCallback((abbr: string) => {
    setSelected((prev) => (prev === abbr ? null : abbr));
    const info = STATES[abbr];
    if (info) {
      AccessibilityInfo.announceForAccessibility(
        `Selected ${info.name}, legislative climate: ${STATUS_STYLES[info.status].label}`
      );
    }
  }, []);

  const toggleMap = useCallback(() => setShowMap((v) => !v), []);

  return (
    <ScrollView className="flex-1 bg-arc-cream" style={{ paddingTop: insets.top }}>
      <View className="w-full max-w-3xl self-center px-6 pb-10">
        <Header />

        <View className="mt-10">
          <HeroSection />
        </View>

        <View className="mt-12">
          <StateSearch
            zip={zip}
            zipError={zipError}
            onZipChange={handleZipChange}
            onSearch={handleSearch}
            isSearchEnabled={isZipValid}
            showMap={showMap}
            onToggleMap={toggleMap}
            selected={selected}
            selectedInfo={selectedInfo}
            onStateSelect={handleStateSelect}
          />
        </View>

        <View className="mt-10 flex-row flex-wrap gap-4">
          <FeatureCard
            title="Policy Overview"
            description={
              selectedInfo
                ? `Current LGBTQ+ protections and legal landscape in ${selectedInfo.name}.`
                : 'Select a state to view current LGBTQ+ protections and legal landscape.'
            }
            buttonLabel="View Policies →"
            status={selectedInfo?.status}
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
          />
        </View>

        <View className="mt-4">
          <TakeAction />
        </View>

        <View className="mt-4">
          <PrivacyBanner />
        </View>

        <View className="mt-10">
          <Footer />
        </View>
      </View>
    </ScrollView>
  );
}
