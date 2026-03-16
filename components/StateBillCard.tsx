import { Text, View } from 'react-native';

import { Button } from './ui/Button';
import { Card } from './ui/Card';
import type { LegislativeStatus } from '../static/states';
import type { BillItem } from '../static/bills';

const statusCopy: Record<LegislativeStatus, string> = {
  supportive: 'Supportive',
  mixed: 'Mixed',
  harmful: 'High Risk',
};

interface StateBillCardProps {
  bill: BillItem;
  onPress?: (billId: string) => void;
}

export function StateBillCard({ bill, onPress }: StateBillCardProps) {
  return (
    <Card className="min-w-[260px] flex-1 gap-3.5">
      <View className="flex-row items-start justify-between gap-2">
        <Text className="flex-1 font-serif-bold text-base leading-7 text-stone-800">{bill.title}</Text>
        <View className="rounded-md bg-stone-100 px-2 py-1">
          <Text className="font-sans-semibold text-[11px] uppercase tracking-wide text-stone-600">
            {statusCopy[bill.status]}
          </Text>
        </View>
      </View>

      <Text className="font-sans text-sm leading-6 text-stone-500">{bill.summary}</Text>

      <View className="flex-row flex-wrap gap-2">
        {bill.tags.map((tag) => (
          <View key={tag} className="rounded-md bg-stone-100 px-2 py-1">
            <Text className="font-sans-medium text-xs text-stone-600">{tag}</Text>
          </View>
        ))}
      </View>

      <Button
        label="More Details →"
        variant="outline"
        onPress={onPress ? () => onPress(bill.id) : undefined}
      />
    </Card>
  );
}
