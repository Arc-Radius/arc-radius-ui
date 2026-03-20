import { Alert, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StateBillCard } from './StateBillCard';
import { Card } from './ui/Card';
import type { BillDetail } from '../static/bills';

interface BillDetailPageProps {
  stateName: string;
  bill: BillDetail;
  relatedBills: BillDetail[];
}

export function BillDetailPage({ stateName, bill, relatedBills }: BillDetailPageProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="w-full max-w-screen-lg self-center px-4 sm:px-6 md:px-8">
          <View className="pt-10">
            <Text className="font-serif-bold text-xl leading-7 text-zinc-900">{bill.title.toUpperCase()}</Text>
            <Text className="mt-1 font-sans text-sm text-zinc-500">{stateName}</Text>
          </View>

          <View className="pt-5">
            <Card className="min-w-0 gap-3.5">
              <Text className="font-serif-bold text-base leading-7 text-zinc-800">What it means</Text>
              <Text className="font-sans text-sm leading-6 text-zinc-500">{bill.whatItMeans}</Text>
            </Card>
          </View>

          <View className="pt-4">
            <Card className="min-w-0 gap-3.5">
              <Text className="font-serif-bold text-base leading-7 text-zinc-800">Why it matters</Text>
              <Text className="font-sans text-sm leading-6 text-zinc-500">{bill.whyItMatters}</Text>
            </Card>
          </View>

          <View className="pt-4">
            <Card className="min-w-0 gap-3.5 p-7">
              <Text className="font-serif-bold text-base leading-7 text-zinc-800">{bill.takeActionTitle}</Text>
              <Text className="font-sans text-sm leading-6 text-zinc-500">{bill.takeActionBody}</Text>
              <View className="pt-3.5">
                <Pressable
                  className="flex-row items-center justify-between rounded-lg border border-zinc-300 px-4 py-3 active:opacity-80"
                  onPress={() => Alert.alert('Coming soon', 'Action tooling is not wired yet.')}
                  accessibilityRole="button"
                  accessibilityLabel={bill.actionItem.title}
                  accessibilityHint={bill.actionItem.subtitle}
                >
                  <View className="gap-0.5">
                    <Text className="font-sans-semibold text-sm text-zinc-900">{bill.actionItem.title}</Text>
                    <Text className="font-sans text-xs text-zinc-500">{bill.actionItem.subtitle}</Text>
                  </View>
                  <Text className="font-sans-semibold text-sm text-zinc-500">→</Text>
                </Pressable>
              </View>
            </Card>
          </View>

          <View className="pt-10">
            <Text className="font-serif-bold text-xl leading-7 text-zinc-900">RELATED BILLS</Text>
          </View>

          {relatedBills[0] ? (
            <View className="pt-6">
              <StateBillCard bill={relatedBills[0]} />
            </View>
          ) : null}

          <View className={[isCompact ? 'gap-4 pt-4' : 'flex-row flex-wrap gap-4 pt-4'].join(' ')}>
            {relatedBills.slice(1).map((relatedBill) => (
              <StateBillCard key={relatedBill.id} bill={relatedBill} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
