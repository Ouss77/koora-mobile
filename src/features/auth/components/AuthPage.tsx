import { ReactNode } from "react";
import { ImageBackground, View } from "react-native";
import { Screen } from "@/shared/ui/Screen";

type AuthPageProps = {
  children: ReactNode;
};

export function AuthPage({ children }: AuthPageProps) {
  return (
    <Screen className="bg-black" contentClassName="px-0 py-0">
      <View className="flex-1">
        <ImageBackground
          source={require("../../../../assets/images/login-bg.png")}
          resizeMode="cover"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View className="flex-1 bg-slate-950/35 px-5 py-6">{children}</View>
      </View>
    </Screen>
  );
}