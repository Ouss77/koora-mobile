import { PropsWithChildren } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = PropsWithChildren<{
  className?: string;
  contentClassName?: string;
}>;

export function Screen({ children, className, contentClassName }: ScreenProps) {
  return (
    <SafeAreaView className={`flex-1 bg-white ${className ?? ""}`}>
      <View className={`flex-1 px-5 py-6 ${contentClassName ?? ""}`}>
        {children}
      </View>
    </SafeAreaView>
  );
}
