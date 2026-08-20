import { ReactNode } from "react";
import { ImageBackground, View } from "react-native";

type BackgroundImageProps = {
  children: ReactNode;
  overlayClassName?: string;
};

export function BackgroundImage({
  children,
  overlayClassName = "bg-slate-950/35",
}: BackgroundImageProps) {
  return (
    <View className="flex-1">
      <ImageBackground
        source={require("../../../assets/images/login-bg.png")}
        resizeMode="cover"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className={`flex-1 ${overlayClassName}`}>{children}</View>
    </View>
  );
}
