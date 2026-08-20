// features/admin/components/AdminMatchCard.tsx
import { memo } from "react";
import { View, Text, Pressable, Alert, Platform } from "react-native";
import { Edit2, Trash2, Target } from "lucide-react-native";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import type { AdminMatch } from "@/features/admin/types/admin.types";
import { TeamLogo } from "@/shared/components/TeamLogo";

type AdminMatchCardProps = {
  match: AdminMatch;
  onEdit: (match: AdminMatch) => void;
  onDelete: (match: AdminMatch) => void;
  onSetResult: (match: AdminMatch) => void;
  canEdit: boolean;
  canDelete: boolean;
  canSetResult: boolean;
};

/**
 * Badge du statut : colore selon upcoming/locked/finished
 */
function StatusBadge({ status }: { status: AdminMatch["status"] }) {
  const bgColor =
    status === "upcoming"
      ? "bg-blue-100"
      : status === "locked"
        ? "bg-amber-100"
        : "bg-green-100";

  const textColor =
    status === "upcoming"
      ? "text-blue-700"
      : status === "locked"
        ? "text-amber-700"
        : "text-green-700";

  const label = status === "upcoming" ? "À venir" : status === "locked" ? "Verrouillé" : "Terminé";

  return (
    <View className={`rounded-full px-2.5 py-1 ${bgColor}`}>
      <Text className={`font-poppins-semibold text-xs ${textColor}`}>{label}</Text>
    </View>
  );
}

/**
 * Bouton d'action : grisé si disabled
 */
function ActionButton({
  Icon,
  onPress,
  disabled,
}: {
  Icon: typeof Edit2;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        if (disabled) {
          // Alert.alert n'affiche rien sur react-native-web.
          if (Platform.OS === "web") {
            window.alert("Action indisponible : ce bouton est désactivé pour ce match.");
          } else {
            Alert.alert("Action indisponible", "Ce bouton est désactivé pour ce match.");
          }
        } else {
          onPress();
        }
      }}
      className={`h-9 w-9 items-center justify-center rounded-lg ${
        disabled ? "bg-zinc-100" : "bg-green-100"
      }`}
    >
      <Icon size={18} color={disabled ? "#D4D4D8" : "#047857"} strokeWidth={2} />
    </Pressable>
  );
}

function AdminMatchCardComponent({
  match,
  onEdit,
  onDelete,
  onSetResult,
  canEdit,
  canDelete,
  canSetResult,
}: AdminMatchCardProps) {
  return (
    <View className="rounded-xl border border-zinc-200 bg-white p-4">
      {/* En-tête : équipes + statut */}
      <View className="flex-row items-start justify-between gap-3 mb-3">
        <View className="flex-1 min-w-0">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1 items-center">
              <TeamLogo logoUrl={match.team1Logo} teamName={match.team1} size="lg" />
              <Text className="mt-2 text-center font-poppins-black text-sm text-zinc-900" numberOfLines={1}>
              {match.team1}
              </Text>
            </View>
            <Text className="mt-4 font-poppins-semibold text-sm text-zinc-400">vs</Text>
            <View className="min-w-0 flex-1 items-center">
              <TeamLogo logoUrl={match.team2Logo} teamName={match.team2} size="lg" />
              <Text className="mt-2 text-center font-poppins-black text-sm text-zinc-900" numberOfLines={1}>
              {match.team2}
              </Text>
            </View>
          </View>
          <Text className="mt-1 font-poppins-semibold text-xs uppercase text-zinc-500">
            {format(match.kickoffAt, "EEE d MMM · HH:mm", { locale: fr })}
          </Text>
        </View>
        <StatusBadge status={match.status} />
      </View>

      {/* Résultat si terminé */}
      {match.result && (
        <View className="mb-3 rounded-lg bg-green-50 px-3 py-2">
          <Text className="font-poppins-bold text-[10px] uppercase text-green-600">Résultat</Text>
          <Text className="font-poppins-black text-sm text-green-700">
            {match.result === "team1" ? match.team1 : match.result === "team2" ? match.team2 : "Match nul"}
          </Text>
        </View>
      )}

      {/* Compteur de pronostics */}
      <View className="mb-4 flex-row items-center gap-2">
        <View className="h-6 w-6 items-center justify-center rounded-full bg-blue-100">
          <Text className="font-poppins-black text-xs text-blue-700">{match.predictionsCount}</Text>
        </View>
        <Text className="font-poppins-semibold text-xs text-zinc-600">
          {match.predictionsCount === 0
            ? "Aucun pronostic"
            : match.predictionsCount === 1
              ? "1 pronostic"
              : `${match.predictionsCount} pronostics`}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row gap-2">
        <ActionButton Icon={Edit2} onPress={() => onEdit(match)} disabled={!canEdit} />
        <ActionButton Icon={Trash2} onPress={() => onDelete(match)} disabled={!canDelete} />
        <ActionButton Icon={Target} onPress={() => onSetResult(match)} disabled={!canSetResult} />
      </View>
    </View>
  );
}

export const AdminMatchCard = memo(AdminMatchCardComponent);
