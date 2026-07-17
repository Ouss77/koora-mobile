import { View, Text } from "react-native";
import { Button } from "@/shared/ui/Button";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useSession } from "@/features/auth/hooks/useSession";
import { usePredictions } from "@/features/predictions/hooks/usepredictions";
import { usePrediction } from "@/features/predictions/hooks/useprediction";
 
const UPCOMING_MATCH_ID = "dba227d6-f3e8-4500-b803-3d5af4790acc";
export default function Home() {
  const { mutate: logout, isPending } = useLogout();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: predictions, isLoading } = usePredictions(userId);
  const { data: one } = usePrediction(userId, UPCOMING_MATCH_ID); 

  console.log("TEST —", { userId, isLoading, predictions, one });
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
