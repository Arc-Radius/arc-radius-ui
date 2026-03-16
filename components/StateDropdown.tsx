import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { STATES } from '../static/states';

interface StateDropdownProps {
  value?: string | null;
  onChange: (abbr: string) => void;
  placeholder?: string;
}

export function StateDropdown({
  value,
  onChange,
  placeholder = 'Select a state',
}: StateDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const options = useMemo(
    () =>
      Object.entries(STATES)
        .map(([abbr, info]) => ({ abbr, name: info.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const filteredOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;

    return options.filter(
      (option) =>
        option.name.toLowerCase().includes(needle) || option.abbr.toLowerCase().includes(needle)
    );
  }, [options, query]);

  const selectedLabel = value && STATES[value] ? `${STATES[value].name} (${value})` : placeholder;

  return (
    <View>
      <Pressable
        className="rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 active:opacity-80"
        onPress={() => {
          setQuery('');
          setOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="State selector"
      >
        <View className="flex-row items-center justify-between">
          <Text className={`font-sans text-sm ${value ? 'text-stone-800' : 'text-stone-500'}`}>
            {selectedLabel}
          </Text>
          <Text className="font-sans text-xs text-stone-500">▼</Text>
        </View>
      </Pressable>

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <View className="flex-1 items-center justify-center bg-black/30 px-4">
          <Pressable className="absolute inset-0" onPress={() => setOpen(false)} />
          <View className="max-h-[80%] w-full max-w-md rounded-2xl border border-stone-300 bg-white p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-serif-bold text-base text-stone-800">Choose state</Text>
              <Pressable
                onPress={() => setOpen(false)}
                className="rounded-md px-2 py-1 active:opacity-70"
                accessibilityRole="button"
              >
                <Text className="font-sans-medium text-sm text-stone-500">Close</Text>
              </Pressable>
            </View>

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by state or code"
              placeholderTextColor="#78716c"
              className="mb-3 rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 font-sans text-sm text-stone-800"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search states"
            />

            {filteredOptions.length === 0 ? (
              <View className="items-center py-8">
                <Text className="font-sans text-sm text-stone-500">No states found.</Text>
              </View>
            ) : (
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.abbr}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    className={`mb-1 flex-row items-center justify-between rounded-lg px-3 py-2.5 active:opacity-70 ${
                      value === item.abbr ? 'bg-stone-100' : 'bg-white'
                    }`}
                    onPress={() => {
                      onChange(item.abbr);
                      setOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name}, ${item.abbr}`}
                  >
                    <Text className="font-sans text-sm text-stone-800">
                      {item.name} ({item.abbr})
                    </Text>
                    {value === item.abbr ? (
                      <Text className="font-sans-semibold text-xs text-stone-600">Selected</Text>
                    ) : null}
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
