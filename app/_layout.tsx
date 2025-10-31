// app/_layout.tsx
import "react-native-url-polyfill/auto";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { PlaybackProvider } from "../contexts/PlaybackContext";
import MiniPlayer from "../components/MiniPlayer";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  const onLayoutRootView = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } finally {
      setReady(true);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: "#0B0E17" }} onLayout={onLayoutRootView}>
        <StatusBar style="light" />
        {ready ? (
          // IMPORTANT: Provider lives ONLY here (single instance)
          <PlaybackProvider>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0B0E17" } }} />
            {/* Persistent mini player on every screen */}
            <MiniPlayer />
          </PlaybackProvider>
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff" }}>Loading…</Text>
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}
