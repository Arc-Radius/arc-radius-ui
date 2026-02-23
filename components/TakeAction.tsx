import { Pressable, Text, View } from 'react-native';

import { Card } from './ui/Card';

const actions = [
  {
    title: 'Contact your representatives',
    subtitle: 'Send a message to your elected officials',
  },
  {
    title: 'Find legal aid',
    subtitle: 'Connect with LGBTQ+-affirming legal services',
  },
  {
    title: 'Join a campaign',
    subtitle: 'Support ongoing advocacy and awareness efforts',
  },
];

function ActionRow({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Pressable className="flex-row items-center rounded-lg border border-stone-300 px-4 py-3">
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-sans-semibold text-stone-900">{title}</Text>
        <Text className="text-xs font-sans text-stone-500">{subtitle}</Text>
      </View>
      <Text className="text-sm font-sans-semibold text-stone-500">→</Text>
    </Pressable>
  );
}

export function TakeAction() {
  return (
    <Card className="p-7 gap-1.5">
      <Text className="text-base font-serif-bold leading-7 text-stone-800">Take Action</Text>
      <Text className="text-sm font-sans leading-6 text-stone-500">
        Make your voice heard. Here's how you can create meaningful change.
      </Text>
      <View className="gap-2 pt-3.5">
        {actions.map((action) => (
          <ActionRow key={action.title} title={action.title} subtitle={action.subtitle} />
        ))}
      </View>
    </Card>
  );
}
