import { useMemo, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';

import { STATES } from '@/static/states';

interface StateDropdownProps {
  value?: string | null;
  onChange: (abbr: string) => void;
  placeholder?: string;
  compactDisplay?: boolean;
  /** When set (non-empty), replaces static `STATES` for the option list (e.g. GET /states). */
  stateOptions?: { abbr: string; name: string }[];
}

function SearchIcon() {
  return <Search size={16} color="#71717a" />;
}

export function StateDropdown({
  value,
  onChange,
  placeholder = 'Search state...',
  compactDisplay,
  stateOptions,
}: StateDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const options = useMemo(() => {
    if (stateOptions && stateOptions.length > 0) {
      return [...stateOptions].sort((a, b) => a.name.localeCompare(b.name));
    }
    return Object.entries(STATES)
      .map(([abbr, info]) => ({ abbr, name: info.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [stateOptions]);

  const filteredOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;

    return options.filter(
      (option) =>
        option.name.toLowerCase().includes(needle) || option.abbr.toLowerCase().includes(needle)
    );
  }, [options, query]);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const fromApi = stateOptions?.find((o) => o.abbr === value);
    if (fromApi) return `${fromApi.name} (${value})`;
    if (STATES[value]) return `${STATES[value].name} (${value})`;
    return null;
  }, [value, stateOptions]);

  return (
    <View>
      {/* Trigger */}
      {compactDisplay && value ? (
        /* Compact pill with arrow */
        <Pressable
          className="flex-row items-center gap-2 self-start rounded-full active:opacity-80"
          style={{
            paddingVertical: 8,
            paddingLeft: 12,
            paddingRight: 12,
            borderWidth: 0.5,
            borderColor: '#d4d4d8',
            backgroundColor: '#fff',
          }}
          onPress={() => {
            setQuery('');
            setOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Change state">
          <Text className="font-sans-semibold text-xs" style={{ color: '#71717a' }}>
            {value}
          </Text>
          <Text className="font-sans text-xs" style={{ color: '#a1a1aa' }}>
            Change
          </Text>
          <View
            style={{
              width: 6,
              height: 6,
              borderRightWidth: 1.2,
              borderBottomWidth: 1.2,
              borderColor: '#a1a1aa',
              transform: [{ rotate: '45deg' }],
              marginTop: -2,
            }}
          />
        </Pressable>
      ) : (
        /* Full search bar — frosted blue-tinted glass for light blue section, contrasts with dark map */
        <Pressable
          className="flex-row items-center gap-2 overflow-hidden rounded-xl px-3.5 py-3 active:opacity-80"
          style={[
            {
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderWidth: 1,
              borderColor: 'rgba(59,130,246,0.2)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            },
            Platform.OS === 'web' ? ({ backdropFilter: 'blur(12px)' } as object) : null,
          ]}
          onPress={() => {
            setQuery('');
            setOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Search for a state">
          <SearchIcon />
          <Text
            className={`flex-1 font-sans text-[13px] ${selectedLabel ? 'font-sans-semibold text-zinc-800' : 'text-zinc-500'}`}>
            {selectedLabel ?? placeholder}
          </Text>
          {selectedLabel && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="h-5 w-5 items-center justify-center rounded-full bg-zinc-300"
              accessibilityRole="button"
              accessibilityLabel="Clear selection">
              <Text className="text-[10px] text-white">✕</Text>
            </Pressable>
          )}
        </Pressable>
      )}

      {/* Modal — unchanged */}
      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <View className="flex-1 items-center justify-center bg-black/20 px-4">
          <Pressable className="absolute inset-0" onPress={() => setOpen(false)} />
          <View className="max-h-[80%] w-full max-w-md rounded-2xl bg-white p-5">
            {/* Header */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-sans-bold text-base text-zinc-800">Find your state</Text>
              <Pressable
                onPress={() => setOpen(false)}
                className="rounded-md px-2 py-1 active:opacity-70"
                accessibilityRole="button">
                <Text className="font-sans-medium text-sm text-zinc-400">Close</Text>
              </Pressable>
            </View>

            {/* Search input */}
            <View className="mb-3 flex-row items-center gap-2 rounded-xl bg-zinc-100 px-3.5 py-2.5">
              <SearchIcon />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name or abbreviation"
                placeholderTextColor="#B4B2A9"
                className="flex-1 font-sans text-[13px] text-zinc-800"
                style={Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : undefined}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Search states"
              />
            </View>

            {/* Results */}
            {filteredOptions.length === 0 ? (
              <View className="items-center py-8">
                <Text className="font-sans text-sm text-zinc-400">No states found.</Text>
              </View>
            ) : (
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.abbr}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    className={`mb-0.5 flex-row items-center justify-between rounded-lg px-3 py-3 active:opacity-70 ${
                      value === item.abbr ? 'bg-zinc-100' : 'bg-white'
                    }`}
                    onPress={() => {
                      onChange(item.abbr);
                      setOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name}, ${item.abbr}`}>
                    <Text className="font-sans text-sm text-zinc-800">{item.name}</Text>
                    <Text className="font-sans text-xs text-zinc-400">{item.abbr}</Text>
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
