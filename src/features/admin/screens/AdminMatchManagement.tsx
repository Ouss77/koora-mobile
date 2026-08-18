// features/admin/screens/AdminMatchManagement.tsx
import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

import { useAdminMatches } from "../hooks/useAdminMatches";
import { AdminMatchCard } from "../components/AdminMatchCard";
import { adminService } from "../services/adminService";
import type { AdminMatch } from "../types/admin.types";

// Alert.alert n'affiche rien sur react-native-web : on bascule sur window.alert/confirm.
function showAlert(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

function showConfirmAlert(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void,
) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n${message}`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: "Annuler", onPress: () => {} },
    { text: confirmLabel, onPress: onConfirm, style: "destructive" },
  ]);
}

export function AdminMatchManagement() {
  const router = useRouter();
  const { data: matches, isLoading, isError, refetch } = useAdminMatches();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleEdit = (match: AdminMatch) => {
    if (!adminService.canEditMatch(match)) {
      showAlert(
        "Modification impossible",
        `Ce match a ${match.predictionsCount} pronostic(s). Seul le résultat peut être modifié.`,
      );
      return;
    }
    // Navigation vers le formulaire d'édition (à implémenter au Sprint 8)
    router.push({
      pathname: "/admin/edit-match",
      params: { matchId: match.id },
    });
  };

  const handleDelete = (match: AdminMatch) => {
    if (!adminService.canDeleteMatch(match)) {
      showAlert(
        "Suppression impossible",
        `Ce match a ${match.predictionsCount} pronostic(s) et ne peut pas être supprimé.`,
      );
      return;
    }
    showConfirmAlert(
      "Supprimer ce match ?",
      "Cette action est irréversible.",
      "Supprimer",
      async () => {
        setDeleting(match.id);
        try {
          await adminService.deleteMatch(match);
          await refetch();
        } catch (err) {
          showAlert(
            "Erreur",
            err instanceof Error ? err.message : "Impossible de supprimer le match.",
          );
        } finally {
          setDeleting(null);
        }
      },
    );
  };

  const handleSetResult = (match: AdminMatch) => {
    if (!adminService.canSetResult(match)) {
      Alert.alert(
        "Résultat impossible",
        "Le coup d'envoi du match n'a pas encore eu lieu.",
      );
      return;
    }
    router.push({
      pathname: "/admin/set-result",
      params: { matchId: match.id },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#047857" />
          <Text className="mt-3 font-poppins-semibold text-sm text-zinc-500">
            Chargement des matchs...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-4 text-center font-poppins-semibold text-base text-zinc-800">
            Impossible de charger les matchs.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => refetch()}
            className="rounded-lg bg-green-700 px-5 py-3"
          >
            <Text className="font-poppins-black text-sm text-white">Réessayer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const matchList = matches ?? [];

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" style={{ flex: 1 }}>
      <View className="flex-row items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour au tableau de bord"
          onPress={() => router.replace("/admin")}
          className="rounded-lg bg-zinc-100 px-3 py-2"
        >
          <Text className="font-poppins-bold text-sm text-zinc-800">← Tableau de bord</Text>
        </Pressable>
        <Text className="font-poppins-black text-lg text-zinc-900">Matchs</Text>
      </View>
      <View className="flex-1" style={{ flex: 1 }}>
        {matchList.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center font-poppins-semibold text-base text-zinc-800">
              Aucun match pour l'instant.
            </Text>
            <Text className="mt-2 text-center font-poppins-medium text-sm text-zinc-600">
              Crée le premier match depuis le dashboard.
            </Text>
          </View>
        ) : (
          <FlatList
            data={matchList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AdminMatchCard
                match={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetResult={handleSetResult}
                canEdit={adminService.canEditMatch(item)}
                canDelete={adminService.canDeleteMatch(item)}
                canSetResult={adminService.canSetResult(item)}
              />
            )}
            contentContainerClassName="gap-3 px-4 pb-6 pt-4"
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
