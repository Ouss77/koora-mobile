// features/admin/screens/MatchForm.tsx
import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";

import {
  matchFormSchema,
  type MatchFormInput,
  type MatchFormValues,
  formatDateToDDMMYYYY,
  formatTimeToHHmm,
} from "../schemas/match.schema";
import type { AdminMatch } from "../types/admin.types";

type MatchFormProps = {
  /** L'admin crée un nouveau match */
  mode: "create";
  onSubmit: (payload: { team1: string; team2: string; kickoffAt: Date }) => Promise<void>;
} | {
  /** L'admin édite un match existant */
  mode: "edit";
  match: AdminMatch;
  onSubmit: (payload: { team1: string; team2: string; kickoffAt: Date }) => Promise<void>;
};

export function MatchForm(props: MatchFormProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MatchFormInput, any, MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues:
      isEdit && "match" in props
        ? {
            team1: props.match.team1,
            team2: props.match.team2,
            dateStr: formatDateToDDMMYYYY(props.match.kickoffAt),
            timeStr: formatTimeToHHmm(props.match.kickoffAt),
          }
        : {
            team1: "",
            team2: "",
            dateStr: "",
            timeStr: "",
          },
  });

  const onSubmit = async (data: MatchFormValues) => {
    setSubmitError(null);
    try {
      await props.onSubmit({
        team1: data.team1,
        team2: data.team2,
        kickoffAt: data.kickoffAt,
      });
      // Succès : formulaire vidé, confirmation affichée, l'utilisateur choisit la suite
      reset();
      setSuccessMessage(isEdit ? "Match modifié avec succès !" : "Match créé avec succès !");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Une erreur s'est produite.");
    }
  };

  return (
    <View className="gap-5 px-4 py-6">
      {successMessage && (
        <View className="gap-3 rounded-lg border border-green-300 bg-green-50 p-4">
          <Text className="font-poppins-bold text-sm text-green-800">{successMessage}</Text>
          <Pressable
            onPress={() => router.push("/admin/match-management")}
            className="rounded-lg bg-green-700 px-4 py-3"
          >
            <Text className="text-center font-poppins-black text-sm text-white">
              Voir les matchs
            </Text>
          </Pressable>
        </View>
      )}

      {submitError && (
        <View className="rounded-lg border border-red-300 bg-red-50 p-4">
          <Text className="font-poppins-medium text-sm text-red-700">{submitError}</Text>
        </View>
      )}

      {/* Team 1 */}
      <View>
        <Text className="mb-2 font-poppins-bold text-sm text-zinc-700">Équipe 1</Text>
        <Controller
          control={control}
          name="team1"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Ex: Real Madrid"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-3 font-poppins-medium text-base text-zinc-900"
              placeholderTextColor="#9CA3AF"
            />
          )}
        />
        {errors.team1 && (
          <Text className="mt-1 font-poppins-medium text-xs text-red-600">{errors.team1.message}</Text>
        )}
      </View>

      {/* Team 2 */}
      <View>
        <Text className="mb-2 font-poppins-bold text-sm text-zinc-700">Équipe 2</Text>
        <Controller
          control={control}
          name="team2"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Ex: Barcelona"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-3 font-poppins-medium text-base text-zinc-900"
              placeholderTextColor="#9CA3AF"
            />
          )}
        />
        {errors.team2 && (
          <Text className="mt-1 font-poppins-medium text-xs text-red-600">{errors.team2.message}</Text>
        )}
      </View>

      {/* Date */}
      <View>
        <Text className="mb-2 font-poppins-bold text-sm text-zinc-700">Date du match</Text>
        <Controller
          control={control}
          name="dateStr"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="DD/MM/YYYY"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-3 font-poppins-medium text-base text-zinc-900"
              placeholderTextColor="#9CA3AF"
            />
          )}
        />
        {errors.dateStr && (
          <Text className="mt-1 font-poppins-medium text-xs text-red-600">{errors.dateStr.message}</Text>
        )}
      </View>

      {/* Time */}
      <View>
        <Text className="mb-2 font-poppins-bold text-sm text-zinc-700">Heure du coup d'envoi</Text>
        <Controller
          control={control}
          name="timeStr"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="HH:mm"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-3 font-poppins-medium text-base text-zinc-900"
              placeholderTextColor="#9CA3AF"
            />
          )}
        />
        {errors.timeStr && (
          <Text className="mt-1 font-poppins-medium text-xs text-red-600">{errors.timeStr.message}</Text>
        )}
      </View>

      {/* Boutons */}
      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={() => router.back()}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3"
        >
          <Text className="text-center font-poppins-black text-sm text-zinc-800">Annuler</Text>
        </Pressable>

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={`flex-1 rounded-lg bg-green-700 px-4 py-3 ${isSubmitting ? "opacity-60" : ""}`}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-center font-poppins-black text-sm text-white">
              {isEdit ? "Modifier" : "Créer"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
