// app/_layout.tsx
import "react-native-url-polyfill/auto";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import MiniPlayer from "../components/MiniPlayer";
import FullPlayer from "../components/FullPlayer";
import { PlayerProvider, usePlayer } from "../components/PlayerContext";
import { PlaylistProvider } from "../components/PlaylistContext";

// Prevent splash from hiding automatically
SplashScreen.preventAutoHideAsync().catch(() => {});

// Wrap the modal logic in a separate component
function RootView() {
  const { playerExpanded, setPlayerExpanded } = usePlayer();
  const [ready, setReady] = useState(false);

  const onLayoutRootView = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(timeout);
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0B0E17",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>Loading…</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <MiniPlayer onExpand={() => setPlayerExpanded(true)} />
      <View
        style={{ flex: 1, backgroundColor: "#0B0E17" }}
        onLayout={onLayoutRootView}
      >
        {/* Main navigation stack */}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0B0E17" },
          }}
        />

        {/* Full-screen player */}
        <FullPlayer />

        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <PlayerProvider>
      <PlaylistProvider>
        <RootView />
      </PlaylistProvider>
    </PlayerProvider>
  );
}
