import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer } from './Footer';
import { Header } from './Header';
import { PrivacyBanner } from './PrivacyBanner';
import { StateBillCard } from './StateBillCard';
import { StateDropdown } from './StateDropdown';
import { Button } from './ui/Button';
import type { BillItem } from './StateBillCard';
import type { LegislativeStatus } from '../static/states';

interface StateBillsPageProps {
  stateAbbr: string;
  stateName: string;
  status?: LegislativeStatus;
  onSelectState?: (stateAbbr: string) => void;
  onBrowseMap?: () => void;
  onBillPress?: (billId: string) => void;
}

const statusCopy: Record<LegislativeStatus, string> = {
  supportive: 'Supportive',
  mixed: 'Mixed',
  harmful: 'High Risk',
};

function getMockBills(stateName: string, status: LegislativeStatus): BillItem[] {
  const riskLabel = statusCopy[status];

  return [
    {
      id: 'bill-1',
      title: `${stateName} Bill 1`,
      summary: `${riskLabel} policy update focused on youth protections, school policy, and legal access.`,
      tags: ['Education', 'Safety'],
      status,
    },
    {
      id: 'bill-2',
      title: `${stateName} Bill 2`,
      summary: 'Proposed changes affecting healthcare access and parental consent requirements.',
      tags: ['Healthcare', 'Identity Documents'],
      status: status === 'supportive' ? 'mixed' : status,
    },
    {
      id: 'bill-3',
      title: `${stateName} Bill 3`,
      summary: 'Regulation changes tied to youth participation in school and public programs.',
      tags: ['Sports', 'Education'],
      status: status === 'harmful' ? 'mixed' : status,
    },
  ];
}

export function StateBillsPage({
  stateAbbr,
  stateName,
  status = 'mixed',
  onSelectState,
  onBrowseMap,
  onBillPress,
}: StateBillsPageProps) {
  const bills = useMemo(() => getMockBills(stateName, status), [stateName, status]);

  return (
    <SafeAreaView className="flex-1 bg-arc-cream">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="w-full max-w-[880px] self-center px-6">
          <Header />

          <View className="items-center pt-8">
            <View className="w-full max-w-96 gap-2.5">
              <Text className="font-sans-semibold text-xs uppercase leading-5 tracking-wide text-stone-500">
                Find a different state
              </Text>

              <View className="max-w-96">
                <StateDropdown
                  value={stateAbbr}
                  onChange={onSelectState ?? (() => {})}
                  placeholder="Select state"
                />
              </View>

              <View className="flex-row items-center gap-3 py-1">
                <View className="h-px flex-1 bg-stone-300" />
                <Text className="font-sans text-xs leading-5 text-stone-500">or</Text>
                <View className="h-px flex-1 bg-stone-300" />
              </View>

              <Button label="Browse interactive map" variant="outline" onPress={onBrowseMap} />
            </View>
          </View>

          <View className="pt-10">
            <Text className="font-serif-bold text-xl leading-7 text-stone-900">{stateName.toUpperCase()}</Text>
            <Text className="mt-1 font-sans text-sm text-stone-500">
              {stateAbbr} • {statusCopy[status]}
            </Text>
          </View>

          {bills[0] ? (
            <View className="pt-6">
              <StateBillCard bill={bills[0]} onPress={onBillPress} />
            </View>
          ) : null}

          <View className="flex-row flex-wrap gap-4 pt-4">
            {bills.slice(1).map((bill) => (
              <StateBillCard key={bill.id} bill={bill} onPress={onBillPress} />
            ))}
          </View>

          <View className="pt-8">
            <PrivacyBanner />
          </View>

          <View className="pt-10">
            <Footer />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
