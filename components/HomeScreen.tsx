import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeatureCard } from './FeatureCard';
import { Footer } from './Footer';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { PrivacyBanner } from './PrivacyBanner';
import { StateSearch } from './StateSearch';
import { TakeAction } from './TakeAction';

export function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView className="flex-1 bg-arc-cream" style={{ paddingTop: insets.top }}>
      <View className="w-full max-w-3xl self-center px-6 pb-10">
        <Header />

        <View className="mt-10">
          <HeroSection />
        </View>

        <View className="mt-12">
          <StateSearch />
        </View>

        <View className="mt-10 flex-row flex-wrap gap-4">
          <FeatureCard
            title="Policy Overview"
            description="Select a state to view current LGBTQ+ protections and legal landscape."
            buttonLabel="View Policies →"
          />
          <FeatureCard
            title="Proposed Bills"
            description="Select a state to track active legislation affecting LGBTQ+ youth."
            buttonLabel="View Bills →"
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
