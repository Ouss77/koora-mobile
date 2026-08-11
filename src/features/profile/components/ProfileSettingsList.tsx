import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useLogout } from '@/features/auth/hooks/useLogout';

export function ProfileSettingsList() {
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Es-tu sûr de vouloir te déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View className="gap-5">
      <Pressable
        accessibilityRole="button"
        onPress={handleLogout}
        disabled={isPending}
        className="flex-row items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 active:bg-red-100"
      >
        {isPending ? (
          <ActivityIndicator size="small" color="#dc2626" />
        ) : (
          <>
            <LogOut size={18} color="#dc2626" strokeWidth={2.5} />
            <Text className="font-poppins-bold text-sm text-red-600">
              Déconnexion
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
