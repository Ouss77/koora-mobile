import { BackgroundImage } from "@/shared/ui/BackgroundImage";
import { Settings } from "lucide-react-native";
import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    View,
} from "react-native";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileStatsSection } from "../components/ProfileStatsSection";
import { useLogoutFlow } from "../hooks/useLogoutFlow";
import { useProfile } from "../hooks/useProfile";
import { useProfileStats } from "../hooks/useProfileStats";

export default function ProfileScreen() {
  const profileQuery = useProfile();
  const statsQuery = useProfileStats();
  const { confirmLogout, isPending } = useLogoutFlow();

  // On bloque l'écran seulement sur l'identité : c'est le cœur de la page.
  if (profileQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ flex: 1 }}>
        <BackgroundImage overlayClassName="bg-slate-950/70">
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#047857" />
            <Text className="mt-3 font-poppins-semibold text-sm text-zinc-100">
              Chargement du profil...
            </Text>
          </View>
        </BackgroundImage>
      </SafeAreaView>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <SafeAreaView className="flex-1" style={{ flex: 1 }}>
        <BackgroundImage overlayClassName="bg-slate-950/70">
          <View className="flex-1 items-center justify-center px-6">
            <Text className="mb-4 text-center font-poppins-semibold text-base text-zinc-100">
              Impossible de charger le profil.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => profileQuery.refetch()}
              className="rounded-lg bg-green-700 px-5 py-3"
            >
              <Text className="font-poppins-black text-sm text-white">
                Réessayer
              </Text>
            </Pressable>
          </View>
        </BackgroundImage>
      </SafeAreaView>
    );
  }

  const profile = profileQuery.data;
  const avatarLabel = profile.username.trim().charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1" style={{ flex: 1 }}>
      <BackgroundImage overlayClassName="bg-slate-950/70">
        <View className="flex-row items-center justify-between px-4 py-3 bg-transparent">
          <View className="h-11 w-11 items-center justify-center rounded-full border border-green-600 bg-green-50">
            <Text className="font-poppins-black text-base text-green-800">
              {avatarLabel}
            </Text>
          </View>

          <View className="items-center">
            <Text className="font-poppins-black text-xl text-zinc-100">
              KOORA
            </Text>
            <Text className="font-poppins-semibold text-[11px] uppercase text-zinc-200">
              Profil
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => confirmLogout()}
            disabled={isPending}
            className="h-11 w-11 items-center justify-center rounded-full bg-zinc-800/20"
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Settings size={22} color="#ffffff" strokeWidth={2.5} />
            )}
          </Pressable>
        </View>

        <View className="flex-1" style={{ flex: 1 }}>
          <ScrollView
            className="flex-1"
            style={{ flex: 1 }}
            contentContainerClassName="gap-6 px-4 pb-10 pt-4"
            showsVerticalScrollIndicator={false}
          >
            <ProfileHeader profile={profile} />
            <ProfileStatsSection
              stats={statsQuery.data}
              isLoading={statsQuery.isLoading}
            />

            <View className="h-6" />
          </ScrollView>
        </View>
      </BackgroundImage>
    </SafeAreaView>
  );
}
