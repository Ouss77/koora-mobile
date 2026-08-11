import { View, Text } from 'react-native';
import { Trophy, Target, CheckCircle2, Percent } from 'lucide-react-native';
import { StatCard } from '@/shared/ui/StatCard';
import type { ProfileStats } from '../types/profile';

function StatsSkeleton() {
  return (
    <View className="gap-3">
      <View className="h-28 rounded-2xl bg-zinc-100" />
      <View className="flex-row gap-3">
        <View className="h-24 flex-1 rounded-2xl bg-zinc-100" />
        <View className="h-24 flex-1 rounded-2xl bg-zinc-100" />
        <View className="h-24 flex-1 rounded-2xl bg-zinc-100" />
      </View>
    </View>
  );
}

export function ProfileStatsSection({
  stats,
  isLoading,
}: {
  stats: ProfileStats | undefined;
  isLoading: boolean;
}) {
  if (isLoading || !stats) {
    return <StatsSkeleton />;
  }

  return (
    <View className="gap-3">
      <View
        className="overflow-hidden rounded-2xl bg-green-800 px-5 py-5"
        style={{
          elevation: 3,
          shadowColor: '#065f46',
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <View className="absolute -right-6 -top-6 h-24 w-24 rounded-full border-[14px] border-green-600/30" />

        <View className="flex-row items-start justify-between">
          <View>
            <Text className="font-poppins-bold text-xs uppercase tracking-wide text-green-200">
              Total des points
            </Text>
            <Text className="mt-2 font-poppins-black text-4xl text-white">
              {stats.points.toLocaleString('fr-FR')}
            </Text>
          </View>

          <View className="flex-row items-center gap-1 rounded-full bg-green-700 px-3 py-1.5">
            <Trophy size={13} color="#fde68a" />
            <Text className="font-poppins-black text-xs text-white">
              #{stats.rank}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row gap-3">
        <StatCard Icon={Target} label="Pronostics" value={stats.matchesPlayed} />
        <StatCard Icon={CheckCircle2} label="Corrects" value={stats.correctPredictions} />
        <StatCard Icon={Percent} label="Précision" value={`${stats.accuracy}%`} />
      </View>
    </View>
  );
}
