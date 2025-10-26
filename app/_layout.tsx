import "react-native-url-polyfill/auto";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useState } from "react";
import { View, Text } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  // This runs when the root view lays out the first time.
  const onLayoutRootView = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } finally {
      setReady(true);
    }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0E17" }} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      {ready ? (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0B0E17" } }} />
      ) : (
        // Fallback UI while we hide the splash (will be very brief)
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff" }}>Loading…</Text>
        </View>
      )}
    </View>
  );
}
