import { useCallback, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenScrollBody } from '@/components/ui/screen-layout';
import { useStatesDerived } from '@/queries/useStatesQuery';
import { STATES, STATUS_STYLES } from '@/static/states';
import type { StateInfoWithCounts } from '@/static/states';

import { HeroSection } from './HeroSection';
import { PrivacyBanner } from './PrivacyBanner';
import { StateSearch } from './StateSearch';
import { TakeAction } from './TakeAction';

interface HomeScreenProps {
  onNavigateToState?: (stateAbbr: string) => void;
}

export function HomeScreen({ onNavigateToState }: HomeScreenProps) {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const mapOffsetY = useRef(0);

  const [selected, setSelected] = useState<string | null>(null);

  const { statesByAbbr, statusCounts, dropdownOptions, isPending, isError, refetch } =
    useStatesDerived();

  const selectedInfo = useMemo((): StateInfoWithCounts | null => {
    if (!selected) return null;
    const row = statesByAbbr?.[selected];
    if (row) {
      return {
        name: row.name,
        status: row.status,
        counts: row.counts,
      };
    }
    const fallback = STATES[selected];
    if (fallback) {
      return { ...fallback, counts: { activeBills: 0, passedBills: 0 } };
    }
    return null;
  }, [selected, statesByAbbr]);

  const handleFindState = useCallback(() => {
    scrollViewRef.current?.scrollTo({
      y: mapOffsetY.current - 16,
      animated: true,
    });
  }, []);

  const handleStateSelect = useCallback(
    (abbr: string) => {
      setSelected(abbr || null);
      if (!abbr) return;
      const row = statesByAbbr?.[abbr];
      const fallback = STATES[abbr];
      const name = row?.name ?? fallback?.name;
      const status = row?.status ?? fallback?.status;
      if (name && status) {
        AccessibilityInfo.announceForAccessibility(
          `Selected ${name}, legislative climate: ${STATUS_STYLES[status].label}`
        );
      }
    },
    [statesByAbbr]
  );

  const handleRetryStates = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleNavigateToState = useCallback(() => {
    if (!selected || !onNavigateToState) return;
    onNavigateToState(selected);
  }, [selected, onNavigateToState]);

  return (
    <ScrollView ref={scrollViewRef} className="flex-1 bg-app-bg" style={{ paddingTop: 0 }}>
      <ScreenScrollBody>
        {/* Hero — unchanged */}
        <View className="mt-0">
          <HeroSection
            onFindState={handleFindState}
            statusCounts={statusCounts}
            heroStatsLoading={isPending}
          />
        </View>

        {/* State search — blue glass */}
        <View
          className="mt-8 overflow-hidden rounded-2xl pt-0"
          style={{
            backgroundColor: 'rgba(59,130,246,0.05)',
            borderWidth: 1,
            borderColor: 'rgba(59,130,246,0.1)',
          }}
          onLayout={(e) => {
            mapOffsetY.current = e.nativeEvent.layout.y;
          }}>
          <View className="px-4 pb-5 pt-5 sm:px-5">
            <StateSearch
              selected={selected}
              selectedInfo={selectedInfo}
              statesByAbbr={statesByAbbr}
              statesLoading={isPending}
              statesError={isError}
              onRetryStates={handleRetryStates}
              stateDropdownOptions={dropdownOptions ?? undefined}
              onStateSelect={handleStateSelect}
              onNavigateToState={handleNavigateToState}
              scrollViewRef={scrollViewRef}
              containerY={mapOffsetY}
            />
          </View>
        </View>

        {/* Take action — amber glass */}
        <View
          className="mt-4 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: 'rgba(249,115,22,0.04)',
            borderWidth: 1,
            borderColor: 'rgba(249,115,22,0.08)',
          }}>
          <View className="px-4 py-5 sm:px-5">
            <TakeAction onCrisisResources={() => router.push('/crisis' as any)} />
          </View>
        </View>

        {/* Privacy — subtle neutral glass */}
        <View
          className="mt-4 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: 'rgba(161,161,170,0.06)',
            borderWidth: 1,
            borderColor: 'rgba(161,161,170,0.12)',
          }}>
          <View className="px-4 py-4 sm:px-5">
            <PrivacyBanner />
          </View>
        </View>
      </ScreenScrollBody>
    </ScrollView>
  );
}
