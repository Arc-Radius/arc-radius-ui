import { Text, View } from 'react-native';

import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface FeatureCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  onPress?: () => void;
}

export function FeatureCard({ title, description, buttonLabel, onPress }: FeatureCardProps) {
  return (
    <Card className="min-w-[240px] flex-1 gap-3.5">
      <Text className="text-base font-serif-bold leading-7 text-stone-800">{title}</Text>
      <View className="pb-1.5">
        <Text className="text-sm font-sans leading-6 text-stone-500">{description}</Text>
      </View>
      <Button label={buttonLabel} variant="outline" onPress={onPress} />
    </Card>
  );
}
