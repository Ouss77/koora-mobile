import { View, Text } from "react-native";
import { Calendar } from "lucide-react-native";

export function RankingHeader() {
  return (
    <View className="flex-row items-start justify-between pb-2">
      <View>
        <Text className="font-poppins-black text-xs uppercase tracking-wide text-green-700">
          Classement général
        </Text>
        <Text className="mt-1 font-poppins-black text-2xl text-zinc-950">
          Classement
        </Text>
      </View>

      <View className="flex-row items-center gap-1 rounded-full bg-green-50 px-3 py-2">
        <Calendar size={14} color="#047857" />
        <Text className="font-poppins-bold text-xs text-green-800">
          Cette saison
        </Text>
      </View>
    </View>
  );
}
