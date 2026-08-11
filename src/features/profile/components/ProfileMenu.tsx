import { View, Text, Pressable, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useLogout } from '@/features/auth/hooks/useLogout';

export function ProfileMenu() {
  const router = useRouter();
  const logout = useLogout();

  function confirmLogout() {
    // Alert.alert n'affiche pas de boutons interactifs sur react-native-web,
    // donc les callbacks (dont handleLogout) ne se déclenchent jamais sur le web.
    if (Platform.OS === 'web') {
      if (window.confirm('Tu veux vraiment te déconnecter ?')) {
        handleLogout();
      }
      return;
    }

    Alert.alert(
      'Déconnexion',
      'Tu veux vraiment te déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: handleLogout },
      ],
    );
  }

  async function handleLogout() {
    try {
      await logout.mutateAsync();
      router.replace('/login');
    } catch {
      Alert.alert('Erreur', 'La déconnexion a échoué. Réessaie.');
    }
  }

  return (
    <View className="px-6 py-4">
      <Pressable
        onPress={confirmLogout}
        disabled={logout.isPending}
        className="flex-row items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-4 active:opacity-70"
      >
        <LogOut size={18} color="#dc2626" strokeWidth={2.5} />
        <Text className="font-poppins-bold text-base text-red-600">
          {logout.isPending ? 'Déconnexion…' : 'Déconnexion'}
        </Text>
      </Pressable>
    </View>
  );
}