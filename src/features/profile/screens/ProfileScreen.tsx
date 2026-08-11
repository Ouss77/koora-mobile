import { View, Text, ActivityIndicator, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useProfile } from '../hooks/useProfile';
import { useProfileStats } from '../hooks/useProfileStats';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileStatsSection } from '../components/ProfileStatsSection';
import { ProfileMenu } from '../components/ProfileMenu';

export default function ProfileScreen() {
  const profileQuery = useProfile();
  const statsQuery = useProfileStats();

  // On bloque l'écran seulement sur l'identité : c'est le cœur de la page.
  if (profileQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50" style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#047857" />
          <Text className="mt-3 font-poppins-semibold text-sm text-zinc-500">
            Chargement du profil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50" style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-4 text-center font-poppins-semibold text-base text-zinc-800">
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
      </SafeAreaView>
    );
  }

  const profile = profileQuery.data;
  const avatarLabel = profile.username.trim().charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" style={{ flex: 1 }}>
      <View className="flex-row items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
        <View className="h-11 w-11 items-center justify-center rounded-full border border-green-600 bg-green-50">
          <Text className="font-poppins-black text-base text-green-800">
            {avatarLabel}
          </Text>
        </View>

        <View className="items-center">
          <Text className="font-poppins-black text-xl text-green-700">
            KOORA
          </Text>
          <Text className="font-poppins-semibold text-[11px] uppercase text-zinc-400">
            Profil
          </Text>
        </View>

        <View className="h-11 w-11 items-center justify-center rounded-full bg-zinc-100">
          <Settings size={22} color="#047857" strokeWidth={2.5} />
        </View>
      </View>

      <View className="flex-1" style={{ flex: 1 }}>
        <ProfileMenu />
        <ScrollView
          className="flex-1"
          style={{ flex: 1 }}
          contentContainerClassName="gap-6 px-4 pb-10 pt-5"
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader profile={profile} />
          <ProfileStatsSection stats={statsQuery.data} isLoading={statsQuery.isLoading} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
