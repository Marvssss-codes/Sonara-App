import "react-native-url-polyfill/auto";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { View } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const onLayoutRootView = useCallback(async () => {
    try { await SplashScreen.hideAsync(); } catch {}
  }, []);

  return (
    <View className="flex-1 bg-bg" onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0B0E17" } }} />
    </View>
  );
}
