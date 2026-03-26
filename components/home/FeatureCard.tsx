import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from './StatusBadge';
import type { LegislativeStatus } from '@/static/states';

interface FeatureCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  status?: LegislativeStatus | null;
  onPress?: () => void;
}

export function FeatureCard({
  title,
  description,
  buttonLabel,
  status,
  onPress,
}: FeatureCardProps) {
  return (
    <Card className="min-w-0 flex-1 gap-3.5">
      <View className="flex-row items-start justify-between">
        <Text className="flex-1 font-sans-bold text-base leading-7 text-zinc-800">{title}</Text>
        {status && <StatusBadge status={status} />}
      </View>
      <View className="pb-1.5">
        <Text className="font-sans text-sm leading-6 text-zinc-500">{description}</Text>
      </View>
      <Button label={buttonLabel} variant="outline" onPress={onPress} />
    </Card>
  );
}
