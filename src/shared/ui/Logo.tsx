import { Text, View } from "react-native";

type LogoProps = {
  subtitle?: string;
};

export function Logo({ subtitle }: LogoProps) {
  return (
    <View className="items-center gap-2">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-green-600">
        <Text className="text-2xl font-black text-white">K</Text>
      </View>

      <Text className="text-4xl font-black tracking-normal text-zinc-950">
        KOORA
      </Text>

      {subtitle ? (
        <Text className="text-center text-base text-zinc-600">{subtitle}</Text>
      ) : null}
    </View>
  );
}
