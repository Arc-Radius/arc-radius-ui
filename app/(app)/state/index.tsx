import { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { StateDropdown } from '@/components/shared/StateDropdown';
import { ScreenContent } from '@/components/ui/screen-layout';
import { useLastBillsState } from '@/contexts/LastBillsStateContext';

export default function BillsStatePickerRoute() {
  const router = useRouter();
  const { setLastBillsState } = useLastBillsState();

  const handleSelectState = useCallback(
    (abbr: string) => {
      if (!abbr) return;
      setLastBillsState(abbr);
      router.replace({
        pathname: '/state/[stateAbbr]',
        params: { stateAbbr: abbr },
      });
    },
    [router, setLastBillsState]
  );

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={[]}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <ScreenContent className="pt-8">
          <Text className="font-sans-bold text-2xl text-zinc-900">State bills</Text>
          <Text className="mt-1 font-sans text-base leading-7 text-zinc-600">
            Choose a state to see proposed and passed bills tracked in Arc Radius.
          </Text>
          <View className="mt-6 max-w-md">
            <StateDropdown
              value={null}
              onChange={handleSelectState}
              placeholder="Select a state"
            />
          </View>
        </ScreenContent>
      </ScrollView>
    </SafeAreaView>
  );
}
