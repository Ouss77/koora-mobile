import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { type Team, useTeamSuggestions } from "../hooks/useTeamSuggestions";

type TeamAutocompleteProps = {
  value: Team | null;
  onChange: (team: Team | null) => void;
  placeholder?: string;
};

export function TeamAutocomplete({
  value,
  onChange,
  placeholder = "Cherche une équipe...",
}: TeamAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState(value?.name ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const { suggestions, isLoading } = useTeamSuggestions(searchQuery);

  useEffect(() => {
    if (value) {
      setInputValue(value.name);
      setSearchQuery("");
    }
  }, [value]);

  const showDropdown = isOpen && searchQuery.length >= 2;

  return (
    <View className="relative">
      <TextInput
        value={inputValue}
        onChangeText={(text) => {
          setInputValue(text);
          setSearchQuery(text.toLowerCase());
          setIsOpen(true);
          if (value) onChange(null);
        }}
        placeholder={placeholder}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-3 font-poppins-medium text-base text-zinc-900"
        placeholderTextColor="#9CA3AF"
      />

      {showDropdown ? (
        <View className="absolute left-0 right-0 top-14 z-50 max-h-[300px] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
          {isLoading && suggestions.length === 0 ? (
            <View className="flex-row items-center gap-2 px-3 py-3">
              <ActivityIndicator size="small" color="#047857" />
              <Text className="font-poppins-medium text-sm text-zinc-500">Recherche...</Text>
            </View>
          ) : suggestions.length === 0 ? (
            <Text className="px-3 py-3 font-poppins-medium text-sm text-zinc-500">
              Aucune équipe trouvée
            </Text>
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(team) => team.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item: team }) => (
                <Pressable
                  onPress={() => {
                    onChange(team);
                    setInputValue(team.name);
                    setSearchQuery("");
                    setIsOpen(false);
                  }}
                  className="h-12 flex-row items-center gap-3 border-b border-zinc-100 px-3 active:bg-zinc-50"
                >
                  {team.logo_url ? (
                    <Image
                      source={{ uri: team.logo_url }}
                      className="h-6 w-6 rounded"
                      accessibilityLabel={`Logo ${team.name}`}
                    />
                  ) : (
                    <View className="h-6 w-6 rounded bg-zinc-100" />
                  )}
                  <View className="min-w-0 flex-1">
                    <Text className="text-[13px] font-poppins-semibold text-zinc-900" numberOfLines={1}>
                      {team.name}
                    </Text>
                    <Text className="text-[13px] font-poppins-medium text-zinc-400" numberOfLines={1}>
                      {team.country ?? team.league ?? ""}
                    </Text>
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>
      ) : null}
    </View>
  );
}
