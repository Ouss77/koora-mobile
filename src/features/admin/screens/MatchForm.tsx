// features/admin/screens/MatchForm.tsx
import { useEffect, useState } from "react";
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
import { TeamAutocomplete } from "../components/TeamAutocomplete";
import { type Team, useTeamSuggestions } from "../hooks/useTeamSuggestions";
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
  const [selectedTeam1, setSelectedTeam1] = useState<Team | null>(() =>
    isEdit && "match" in props
      ? { id: "", name: props.match.team1, logo_url: null, country: null, league: null }
      : null,
  );
  const [selectedTeam2, setSelectedTeam2] = useState<Team | null>(() =>
    isEdit && "match" in props
      ? { id: "", name: props.match.team2, logo_url: null, country: null, league: null }
      : null,
  );
  const { suggestions: initialTeam1Suggestions } = useTeamSuggestions(
    isEdit && "match" in props ? props.match.team1 : "",
  );
  const { suggestions: initialTeam2Suggestions } = useTeamSuggestions(
    isEdit && "match" in props ? props.match.team2 : "",
  );
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MatchFormInput, any, MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues:
      isEdit && "match" in props
        ? {
            team1_id: "",
            team2_id: "",
            dateStr: formatDateToDDMMYYYY(props.match.kickoffAt),
            timeStr: formatTimeToHHmm(props.match.kickoffAt),
          }
        : {
            team1_id: "",
            team2_id: "",
            dateStr: "",
            timeStr: "",
          },
  });

  useEffect(() => {
    if (!isEdit || !("match" in props) || selectedTeam1?.id) return;
    const team = initialTeam1Suggestions.find(
      (item) => item.name.toLowerCase() === props.match.team1.toLowerCase(),
    );
    if (team) {
      setSelectedTeam1(team);
      setValue("team1_id", team.id, { shouldValidate: true });
    }
  }, [initialTeam1Suggestions, isEdit, props, selectedTeam1?.id, setValue]);

  useEffect(() => {
    if (!isEdit || !("match" in props) || selectedTeam2?.id) return;
    const team = initialTeam2Suggestions.find(
      (item) => item.name.toLowerCase() === props.match.team2.toLowerCase(),
    );
    if (team) {
      setSelectedTeam2(team);
      setValue("team2_id", team.id, { shouldValidate: true });
    }
  }, [initialTeam2Suggestions, isEdit, props, selectedTeam2?.id, setValue]);

  const onSubmit = async (data: MatchFormValues) => {
    setSubmitError(null);
    if (!selectedTeam1 || !selectedTeam2 || !selectedTeam1.id || !selectedTeam2.id) {
      setSubmitError("Sélectionne les deux équipes dans les suggestions.");
      return;
    }
    try {
      await props.onSubmit({
        team1: selectedTeam1.name,
        team2: selectedTeam2.name,
        kickoffAt: data.kickoffAt,
      });
      // Succès : formulaire vidé, confirmation affichée, l'utilisateur choisit la suite
      reset();
      setSelectedTeam1(null);
      setSelectedTeam2(null);
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
        <TeamAutocomplete
          value={selectedTeam1}
          onChange={(team) => {
            setSelectedTeam1(team);
            setValue("team1_id", team?.id ?? "", { shouldValidate: true });
          }}
        />
        {errors.team1_id && (
          <Text className="mt-1 font-poppins-medium text-xs text-red-600">{errors.team1_id.message}</Text>
        )}
      </View>

      {/* Team 2 */}
      <View>
        <Text className="mb-2 font-poppins-bold text-sm text-zinc-700">Équipe 2</Text>
        <TeamAutocomplete
          value={selectedTeam2}
          onChange={(team) => {
            setSelectedTeam2(team);
            setValue("team2_id", team?.id ?? "", { shouldValidate: true });
          }}
        />
        {errors.team2_id && (
          <Text className="mt-1 font-poppins-medium text-xs text-red-600">{errors.team2_id.message}</Text>
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
        <Text className="mb-2 font-poppins-bold text-sm text-zinc-700">Heure du coup d&apos;envoi</Text>
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
