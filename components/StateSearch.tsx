import { Text, TextInput, View } from 'react-native';

import { Button } from './ui/Button';

export function StateSearch() {
  return (
    <View className="gap-2.5 pt-2">
      <Text className="text-xs font-sans-semibold uppercase leading-5 tracking-wide text-stone-500">
        Find your state
      </Text>

      <View className="max-w-96 flex-row items-start gap-2">
        <TextInput
          className="flex-1 rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-sans text-stone-800"
          placeholder="Enter ZIP code"
          placeholderTextColor="#78716c"
          keyboardType="number-pad"
        />
        <Button label="Search" className="py-3" />
      </View>

      <View className="max-w-96 flex-row items-center gap-3 py-1">
        <View className="h-px flex-1 bg-stone-300" />
        <Text className="text-xs font-sans leading-5 text-stone-500">or</Text>
        <View className="h-px flex-1 bg-stone-300" />
      </View>

      <Button label="Browse interactive map" variant="outline" className="max-w-96" />
    </View>
  );
}
