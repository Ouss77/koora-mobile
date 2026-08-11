import { View, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";

type StatCardProps = {
  Icon: LucideIcon;
  label: string;
  value: string | number;
};

export function StatCard({ Icon, label, value }: StatCardProps) {
  return (
    <View className="flex-1 gap-2 rounded-2xl border border-zinc-100 bg-white px-3 py-4">
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-green-50">
        <Icon size={16} color="#047857" strokeWidth={2.5} />
      </View>
      <Text className="font-poppins-black text-xl text-zinc-950">{value}</Text>
      <Text
        className="font-poppins-semibold text-[11px] uppercase tracking-wide text-zinc-400"
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}
