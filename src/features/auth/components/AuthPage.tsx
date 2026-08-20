import { ReactNode } from "react";
import { View } from "react-native";
import { BackgroundImage } from "@/shared/ui/BackgroundImage";
import { Screen } from "@/shared/ui/Screen";

type AuthPageProps = {
  children: ReactNode;
};

export function AuthPage({ children }: AuthPageProps) {
  return (
    <Screen className="bg-black" contentClassName="px-0 py-0">
      <BackgroundImage>
        <View className="flex-1 px-5 py-6">{children}</View>
      </BackgroundImage>
    </Screen>
  );
}
