import { View, Text } from 'react-native';
import { Mail, CalendarDays, ShieldCheck } from 'lucide-react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ProfileAvatar } from './ProfileAvatar';
import type { Profile } from '../types/profile';

export function ProfileHeader({ profile }: { profile: Profile }) {
  const memberSince = format(new Date(profile.createdAt), 'MMMM yyyy', { locale: fr });

  return (
    <View
      className="items-center gap-3 rounded-3xl border border-zinc-100 bg-white px-6 pb-6 pt-8"
      style={{
        elevation: 2,
        shadowColor: '#0f172a',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <ProfileAvatar username={profile.username} />

      <View className="items-center gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="font-poppins-black text-2xl text-zinc-950">
            {profile.username}
          </Text>
          {profile.role === 'admin' ? (
            <View className="flex-row items-center gap-1 rounded-full bg-green-700 px-2.5 py-1">
              <ShieldCheck size={12} color="#ffffff" strokeWidth={2.5} />
              <Text className="font-poppins-bold text-[10px] uppercase text-white">
                Admin
              </Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row items-center gap-1.5">
          <Mail size={13} color="#a1a1aa" />
          <Text className="font-poppins-medium text-sm text-zinc-400">
            {profile.email}
          </Text>
        </View>
      </View>

      <View className="mt-1 flex-row items-center gap-1.5 rounded-full bg-zinc-50 px-3 py-1.5">
        <CalendarDays size={13} color="#71717a" />
        <Text className="font-poppins-semibold text-xs text-zinc-500">
          Membre depuis {memberSince}
        </Text>
      </View>
    </View>
  );
}
