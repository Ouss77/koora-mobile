import { View, Text } from "react-native";
import { Crown } from "lucide-react-native";

import { RankingUser } from "../types/ranking-user";

interface RankingPodiumProps {
  topThree: RankingUser[];
}

interface Tier {
  avatarSize: number;
  badgeSize: number;
  ringColor: string;
  badgeColor: string;
  badgeTextColor: string;
  glowColor: string;
}

/**
 * Colors here are plain hex, not Tailwind classes: NativeWind needs a class
 * string it can statically resolve, and interpolating one from this lookup
 * (`bg-${tier.badgeColor}`) silently drops the style at runtime.
 */
const TIERS: Record<number, Tier> = {
  1: {
    avatarSize: 108,
    badgeSize: 40,
    ringColor: "#fbbf24",
    badgeColor: "#f59e0b",
    badgeTextColor: "#451a03",
    glowColor: "#f59e0b",
  },
  2: {
    avatarSize: 84,
    badgeSize: 36,
    ringColor: "#cbd5e1",
    badgeColor: "#64748b",
    badgeTextColor: "#ffffff",
    glowColor: "#94a3b8",
  },
  3: {
    avatarSize: 84,
    badgeSize: 36,
    ringColor: "#fdba74",
    badgeColor: "#ea580c",
    badgeTextColor: "#ffffff",
    glowColor: "#f97316",
  },
};

function PodiumSlot({ user }: { user: RankingUser }) {
  const tier = TIERS[user.rank] ?? TIERS[3];
  const isLeader = user.rank === 1;

  return (
    <View className="items-center" style={{ width: 110 }}>
      <View style={{ height: 26 }} className="items-center justify-end">
        {isLeader ? <Crown size={24} color="#d97706" fill="#fbbf24" /> : null}
      </View>

      {/* Single solid badge, floating clearly above the avatar with its own
          gap — no overlap, no nested circles, no reliance on faint fills. */}
      <View
        className="z-10 items-center justify-center rounded-full border-[3px] border-white"
        style={{
          width: tier.badgeSize,
          height: tier.badgeSize,
          marginTop: 4,
          marginBottom: 10,
          backgroundColor: tier.badgeColor,
          elevation: 6,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text
          className="font-poppins-black"
          style={{ color: tier.badgeTextColor, fontSize: 16 }}
        >
          {user.rank}
        </Text>
      </View>

      <View
        className="items-center justify-center rounded-full bg-sky-50"
        style={{
          width: tier.avatarSize,
          height: tier.avatarSize,
          borderWidth: 4,
          borderColor: tier.ringColor,
          elevation: 6,
          shadowColor: tier.glowColor,
          shadowOpacity: 0.35,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Text className="font-poppins-black text-2xl text-green-700">
          {user.username.trim().charAt(0).toUpperCase()}
        </Text>
      </View>

      {isLeader ? (
        <View className="mt-1.5 rounded-full bg-amber-400 px-2.5 py-0.5">
          <Text className="font-poppins-extrabold text-[10px] uppercase text-amber-950">
            Leader
          </Text>
        </View>
      ) : null}

      <Text
        className="mt-2 text-center font-poppins-bold text-sm text-zinc-900"
        numberOfLines={1}
      >
        {user.username}
      </Text>
      <Text className="font-poppins-bold text-xs text-green-700">
        {user.points.toLocaleString("en-US")} pts
      </Text>
    </View>
  );
}

export function RankingPodium({ topThree }: RankingPodiumProps) {
  if (topThree.length === 0) {
    return null;
  }

  const [first, second, third] = topThree;
  const ordered = [second, first, third].filter(
    (user): user is RankingUser => !!user,
  );

  return (
    <View className="flex-row items-end justify-center gap-3 py-4">
      {ordered.map((user) => (
        <PodiumSlot key={user.id} user={user} />
      ))}
    </View>
  );
}
