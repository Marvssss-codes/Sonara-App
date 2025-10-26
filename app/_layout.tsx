import "react-native-url-polyfill/auto";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-url-polyfill/auto";
import "react-native-get-random-values";


SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  const onLayoutRootView = useCallback(async () => {
    try { await SplashScreen.hideAsync(); } finally { setReady(true); }
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: "#0B0E17" }} onLayout={onLayoutRootView}>
        <StatusBar style="light" />
        {ready ? (
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0B0E17" } }} />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff" }}>Loading…</Text>
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}
