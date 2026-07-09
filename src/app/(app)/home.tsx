import { View, Text } from "react-native";
import { Button } from "@/shared/ui/Button";
import { useLogout } from "@/features/auth/hooks/useLogout";

export default function Home() {
  const { mutate: logout, isPending } = useLogout();

  return (
    <View className="flex-1 items-center justify-center bg-white gap-6">
      <Text className="text-2xl font-bold">⚽ Home (placeholder)</Text>
      <Text className="text-zinc-500">
        Les écrans Matches / Ranking arriveront dans un prochain sprint.
      </Text>
      <Button
        title={isPending ? "Logging out..." : "Log out"}
        onPress={() => logout()}
        disabled={isPending}
      />
    </View>
  );
}