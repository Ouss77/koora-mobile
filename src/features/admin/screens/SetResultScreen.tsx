// features/admin/screens/SetResultScreen.tsx
import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { useAdminMatches } from "../hooks/useAdminMatches";
import { useSetResult } from "../hooks/useSetResult";
import { ResultSelector } from "../components/ResultSelector";
import type { MatchResultValue } from "../types/admin.types";

export function SetResultScreen() {
  const router = useRouter();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { data: matches, isLoading } = useAdminMatches();
  const setResultMutation = useSetResult();
  const [selectedResult, setSelectedResult] = useState<MatchResultValue | null>(null);

  const match = matches?.find((m) => m.id === matchId);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50" style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#047857" />
        </View>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50" style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-poppins-semibold text-base text-zinc-800">
            Match introuvable.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (!selectedResult) {
      Alert.alert("Erreur", "Sélectionne un résultat.");
      return;
    }

    try {
      await setResultMutation.mutateAsync({ match, result: selectedResult });
      Alert.alert(
        "Succès",
        match.result ? "Résultat corrigé avec succès." : "Résultat enregistré avec succès.",
        [{ text: "OK", onPress: () => router.push("/admin/match-management") }],
      );
    } catch (err) {
      Alert.alert(
        "Erreur",
        err instanceof Error ? err.message : "Impossible d'enregistrer le résultat.",
      );
    }
  };

  const resultLabel =
    match.result === "team1"
      ? match.team1
      : match.result === "team2"
        ? match.team2
        : match.result === "draw"
          ? "Match nul"
          : null;

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" style={{ flex: 1 }}>
      <View className="border-b border-zinc-200 bg-white px-4 py-3">
        <Text className="font-poppins-black text-lg text-zinc-900">
          {match.result ? "Corriger le résultat" : "Enregistrer le résultat"}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Infos match */}
        <View className="gap-4 px-4 py-6">
          <View className="rounded-xl bg-white p-4">
            <Text className="font-poppins-black text-base text-zinc-900">
              {match.team1} vs {match.team2}
            </Text>
            <Text className="mt-2 font-poppins-semibold text-xs uppercase text-zinc-500">
              {format(match.kickoffAt, "EEE d MMM · HH:mm", { locale: fr })}
            </Text>
          </View>

          {/* Résultat actuel */}
          {resultLabel && (
            <View className="rounded-lg bg-green-50 px-3 py-2">
              <Text className="font-poppins-bold text-[10px] uppercase text-green-700">
                Résultat actuel
              </Text>
              <Text className="mt-1 font-poppins-black text-sm text-green-800">{resultLabel}</Text>
            </View>
          )}

          {/* Sélecteur */}
          <ResultSelector
            team1={match.team1}
            team2={match.team2}
            onSelect={setSelectedResult}
            disabled={setResultMutation.isPending}
          />

          {/* Résultat sélectionné */}
          {selectedResult && (
            <View className="rounded-lg bg-blue-50 px-3 py-2">
              <Text className="font-poppins-bold text-[10px] uppercase text-blue-700">
                Nouveau résultat
              </Text>
              <Text className="mt-1 font-poppins-black text-sm text-blue-800">
                {selectedResult === "team1"
                  ? match.team1
                  : selectedResult === "team2"
                    ? match.team2
                    : "Match nul"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Boutons */}
      <View className="border-t border-zinc-200 bg-white px-4 py-4">
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => router.back()}
            disabled={setResultMutation.isPending}
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3"
          >
            <Text className="text-center font-poppins-black text-sm text-zinc-800">Annuler</Text>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            disabled={setResultMutation.isPending || !selectedResult}
            className={`flex-1 rounded-lg px-4 py-3 ${
              setResultMutation.isPending || !selectedResult
                ? "bg-zinc-300"
                : "bg-green-700"
            }`}
          >
            {setResultMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-center font-poppins-black text-sm text-white">
                {match.result ? "Corriger" : "Enregistrer"}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}