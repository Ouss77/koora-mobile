import { useEffect, useRef } from "react";
import { Redirect, Tabs, type Href } from "expo-router";
import { ActivityIndicator, Animated, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Home,
  BarChart3,
  Flag,
  User,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react-native";
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";
import { useSession } from "@/features/auth/hooks/useSession";

const ACTIVE_COLOR = "#16A34A";
const INACTIVE_COLOR = "#6B7280";
const ICON_SIZE = 24;
const TRANSITION_MS = 220;

function TabIcon({
  Icon,
  focused,
  color,
}: {
  Icon: LucideIcon;
  focused: boolean;
  color: string;
}) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.92)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: focused ? 1 : 0.92,
      duration: TRANSITION_MS,
      useNativeDriver: true,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon color={color} size={ICON_SIZE} strokeWidth={focused ? 2.5 : 2} />
    </Animated.View>
  );
}

function TabLabel({
  label,
  focused,
  color,
}: {
  label: string;
  focused: boolean;
  color: string;
}) {
  const opacity = useRef(new Animated.Value(focused ? 1 : 0.85)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: focused ? 1 : 0.85,
      duration: TRANSITION_MS,
      useNativeDriver: true,
    }).start();
  }, [focused, opacity]);

  return (
    <Animated.Text
      style={{
        opacity,
        color,
        marginTop: 4,
        fontSize: 12,
        fontFamily: focused ? "Poppins_600SemiBold" : "Poppins_500Medium",
      }}
    >
      {label}
    </Animated.Text>
  );
}

export default function TabsLayout() {
  const { isLoading, shouldRedirect, redirectTo } = useAuthGuard("requireAuth");
  const { data: session } = useSession();
  const isAdmin = session?.user?.user_metadata?.role === "admin";
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (shouldRedirect) {
    return <Redirect href={redirectTo as Href} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 72 + insets.bottom,
          paddingTop: 10,
          paddingBottom: insets.bottom + 10,
          paddingHorizontal: 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          ...Platform.select({
            ios: {
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
            },
            android: { elevation: 12 },
          }),
        },
        tabBarItemStyle: {
          minHeight: 48,
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Pronostics",
          tabBarIcon: ({ focused, color }) => <TabIcon Icon={Home} focused={focused} color={color} />,
          tabBarLabel: ({ focused, color, children }) => (
            <TabLabel label={children} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: "Classement",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon Icon={BarChart3} focused={focused} color={color} />
          ),
          tabBarLabel: ({ focused, color, children }) => (
            <TabLabel label={children} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: "Résultats",
          tabBarIcon: ({ focused, color }) => <TabIcon Icon={Flag} focused={focused} color={color} />,
          tabBarLabel: ({ focused, color, children }) => (
            <TabLabel label={children} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused, color }) => <TabIcon Icon={User} focused={focused} color={color} />,
          tabBarLabel: ({ focused, color, children }) => (
            <TabLabel label={children} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          href: isAdmin ? undefined : null,
          title: "Admin",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon Icon={ShieldCheck} focused={focused} color={color} />
          ),
          tabBarLabel: ({ focused, color, children }) => (
            <TabLabel label={children} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
