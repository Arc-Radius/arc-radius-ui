import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer } from './Footer';
import { Header } from './Header';
import { StateBillCard } from './StateBillCard';
import { Card } from './ui/Card';
import type { BillDetail } from '../static/bills';

interface BillDetailPageProps {
  stateName: string;
  bill: BillDetail;
  relatedBills: BillDetail[];
}

export function BillDetailPage({ stateName, bill, relatedBills }: BillDetailPageProps) {
  return (
    <SafeAreaView className="flex-1 bg-arc-cream">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="w-full max-w-[880px] self-center px-6">
          <Header />

          <View className="pt-10">
            <Text className="font-serif-bold text-xl leading-7 text-stone-900">{bill.title.toUpperCase()}</Text>
            <Text className="mt-1 font-sans text-sm text-stone-500">{stateName}</Text>
          </View>

          <View className="pt-5">
            <Card className="min-w-60 gap-3.5">
              <Text className="font-serif-bold text-base leading-7 text-stone-800">What it means</Text>
              <Text className="font-sans text-sm leading-6 text-stone-500">{bill.whatItMeans}</Text>
            </Card>
          </View>

          <View className="pt-4">
            <Card className="min-w-60 gap-3.5">
              <Text className="font-serif-bold text-base leading-7 text-stone-800">Why it matters</Text>
              <Text className="font-sans text-sm leading-6 text-stone-500">{bill.whyItMatters}</Text>
            </Card>
          </View>

          <View className="pt-4">
            <Card className="min-w-60 gap-3.5 p-7">
              <Text className="font-serif-bold text-base leading-7 text-stone-800">{bill.takeActionTitle}</Text>
              <Text className="font-sans text-sm leading-6 text-stone-500">{bill.takeActionBody}</Text>
              <View className="pt-3.5">
                <Pressable
                  className="flex-row items-center justify-between rounded-lg border border-stone-300 px-4 py-3 active:opacity-80"
                  onPress={() => Alert.alert('Coming soon', 'Action tooling is not wired yet.')}
                  accessibilityRole="button"
                  accessibilityLabel={bill.actionItem.title}
                  accessibilityHint={bill.actionItem.subtitle}
                >
                  <View className="gap-0.5">
                    <Text className="font-sans-semibold text-sm text-stone-900">{bill.actionItem.title}</Text>
                    <Text className="font-sans text-xs text-stone-500">{bill.actionItem.subtitle}</Text>
                  </View>
                  <Text className="font-sans-semibold text-sm text-stone-500">→</Text>
                </Pressable>
              </View>
            </Card>
          </View>

          <View className="pt-10">
            <Text className="font-serif-bold text-xl leading-7 text-stone-900">RELATED BILLS</Text>
          </View>

          {relatedBills[0] ? (
            <View className="pt-6">
              <StateBillCard bill={relatedBills[0]} />
            </View>
          ) : null}

          <View className="flex-row flex-wrap gap-4 pt-4">
            {relatedBills.slice(1).map((relatedBill) => (
              <StateBillCard key={relatedBill.id} bill={relatedBill} />
            ))}
          </View>

          <View className="pt-10">
            <Footer />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
