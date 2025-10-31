// app/player.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Dimensions,
  Animated,
  Easing,
  LayoutChangeEvent,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { usePlayback } from "../contexts/PlaybackContext";
import { streamUrlFor as _streamUrlFor } from "../lib/audius";

const BG = "#0B0E17";
const SUB = "#B7BCD3";
const ACCENT = "#8E59FF";
const STROKE = "rgba(255,255,255,0.12)";
const GLOW = "rgba(142, 89, 255, 0.35)";
const { width } = Dimensions.get("window");

const resolveStreamUrl = (id?: string) => {
  if (!id) return "";
  try {
    const fn = _streamUrlFor as unknown as (x: string) => string;
    if (typeof fn === "function") return String(fn(id));
  } catch {}
  return `https://discoveryprovider.audius.co/v1/tracks/${id}/stream?app_name=sonara`;
};

const num = (obj: any, keys: string[], fallback = 0) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
  }
  return fallback;
};
const fn = (obj: any, names: string[]) => {
  for (const n of names) {
    const f = obj?.[n];
    if (typeof f === "function") return f.bind(obj);
  }
  return undefined;
};

export default function Player() {
  const { id, title, artist, artwork } = useLocalSearchParams<{
    id?: string;
    title?: string;
    artist?: string;
    artwork?: string;
  }>();

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pb = usePlayback() as any;

  // tolerant accessors
  const current = pb.current ?? pb.nowPlaying ?? null;
  const isPlaying = pb.isPlaying ?? pb.playing ?? false;
  const durationMs = num(pb, ["durationMs", "duration"]);
  const positionMs = num(pb, ["positionMs", "position"]);
  const play = fn(pb, ["play"]);
  const pause = fn(pb, ["pause"]);
  const seekTo = fn(pb, ["seekTo", "seek"]);
  const startSingle =
    fn(pb, ["loadAndPlay"]) ||
    (async (t: any) => {
      const playSingle = fn(pb, ["playSingle"]);
      if (playSingle) return playSingle(t, true);
      const playFromList = fn(pb, ["playFromList"]);
      if (playFromList) return playFromList([t], 0, true);
      const setTrack = fn(pb, ["setTrack", "setCurrent"]);
      if (setTrack) {
        await setTrack(t);
        return play?.();
      }
    });

  // Load if navigated with params and player has no track / different track
  useEffect(() => {
    if (!id) return;
    if (!current || current.id !== id) {
      const t = {
        id,
        title: decodeURIComponent(title || "Unknown"),
        artist: decodeURIComponent(artist || "Unknown"),
        artwork: artwork ? decodeURIComponent(artwork) : null,
        streamUrl: resolveStreamUrl(id),
      };
      Promise.resolve(startSingle(t)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, current?.id]);

  /* ---------- UI niceties ---------- */

  // Rotating vinyl animation
  const rotation = useRef(new Animated.Value(0)).current;
  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const startSpin = () => {
    rotation.setValue(0);
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };
  const stopSpin = () => rotation.stopAnimation();

  useEffect(() => {
    if (isPlaying) startSpin();
    else stopSpin();
    // cleanup on unmount
    return () => stopSpin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, current?.id]);

  // Shuffle / Repeat (visual only; wire to logic later if desired)
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");
  const cycleRepeat = () =>
    setRepeat((r) => (r === "off" ? "one" : r === "one" ? "all" : "off"));

  // Progress helpers
  const progress = useMemo(
    () => (!durationMs ? 0 : positionMs / durationMs),
    [positionMs, durationMs]
  );
  const pretty = (ms: number) => {
    const s = Math.floor((ms || 0) / 1000);
    const m = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, "0");
    return `${m}:${ss}`;
  };

  // Tap & thumb progress
  const railWidthRef = useRef(width - 32);
  const onRailLayout = (e: LayoutChangeEvent) => {
    railWidthRef.current = e.nativeEvent.layout.width;
  };
  const onSeekAt = (x: number) => {
    const w = railWidthRef.current || 1;
    const pct = Math.min(1, Math.max(0, x / w));
    seekTo?.(Math.floor(pct * (durationMs || 0)));
  };

  const onTogglePlay = async () => {
    try {
      if (isPlaying) await (pause?.() ?? Promise.resolve());
      else await (play?.() ?? Promise.resolve());
    } catch {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Soft gradient background glow */}
      <LinearGradient
        colors={["#120C24", "#0B0E17"]}
        style={{ ...StyleSheet_absFill, opacity: 1 }}
      />
      <View
        style={{
          position: "absolute",
          width: width * 0.9,
          height: width * 0.9,
          borderRadius: 999,
          backgroundColor: GLOW,
          top: -width * 0.3,
          left: -width * 0.2,
          filter: "blur(60px)" as any, // harmless on native
          opacity: 0.35,
        }}
      />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>

        <View style={{ alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
            Now Playing
          </Text>
          {!!current?.artist && (
            <Text style={{ color: SUB, fontSize: 11 }} numberOfLines={1}>
              {current.artist}
            </Text>
          )}
        </View>

        <Pressable onPress={() => {}} style={{ padding: 8, opacity: 0.85 }}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Artwork Vinyl */}
      <View style={{ alignItems: "center", marginTop: 16 }}>
        <Animated.View
          style={{
            width: width * 0.74,
            height: width * 0.74,
            borderRadius: width,
            overflow: "hidden",
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.06)",
            transform: [{ rotate: spin }],
            shadowColor: ACCENT,
            shadowOpacity: 0.4,
            shadowRadius: 24,
          }}
        >
          {current?.artwork ? (
            <Image
              source={{ uri: current.artwork }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <View
              style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="musical-notes" size={40} color={SUB} />
            </View>
          )}

          {/* center label */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: 56,
              height: 56,
              borderRadius: 999,
              backgroundColor: "#0B0E17",
              borderWidth: 2,
              borderColor: STROKE,
              top: "50%",
              left: "50%",
              marginLeft: -28,
              marginTop: -28,
            }}
          />
        </Animated.View>
      </View>

      {/* Title */}
      <View style={{ alignItems: "center", marginTop: 18, paddingHorizontal: 16 }}>
        <Text
          style={{ color: "#fff", fontWeight: "900", fontSize: 22, textAlign: "center" }}
          numberOfLines={2}
        >
          {current?.title || decodeURIComponent(title || "Unknown")}
        </Text>
        <Text style={{ color: SUB, marginTop: 4 }} numberOfLines={1}>
          {current?.artist || decodeURIComponent(artist || "Unknown")}
        </Text>
      </View>

      {/* Progress rail with thumb */}
      <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
        <View
          onLayout={onRailLayout}
          style={{
            height: 8,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.08)",
            justifyContent: "center",
          }}
        >
          {/* fill */}
          <View
            style={{
              width: `${progress * 100}%`,
              height: 8,
              borderRadius: 999,
              backgroundColor: ACCENT,
            }}
          />
          {/* thumb */}
          <View
            style={{
              position: "absolute",
              left: Math.max(0, (progress * (railWidthRef.current || 0)) - 8),
              width: 16,
              height: 16,
              borderRadius: 999,
              backgroundColor: "#fff",
              borderWidth: 2,
              borderColor: ACCENT,
            }}
          />
          {/* transparent interactive layer */}
          <Pressable
            onPress={(e) => onSeekAt((e.nativeEvent as any).locationX as number)}
            style={{ ...StyleSheet_absFill }}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <Text style={{ color: SUB, fontSize: 12 }}>{pretty(positionMs)}</Text>
          <Text style={{ color: SUB, fontSize: 12 }}>{pretty(durationMs)}</Text>
        </View>
      </View>

      {/* Secondary controls */}
      <View
        style={{
          marginTop: 14,
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 48,
        }}
      >
        <ControlIcon
          name="shuffle"
          active={shuffle}
          onPress={() => setShuffle((s) => !s)}
        />
        <ControlIcon
          name={
            repeat === "off"
              ? "repeat"
              : repeat === "one"
              ? "repeat"
              : "repeat"
          }
          onPress={cycleRepeat}
          badge={repeat === "one" ? "1" : repeat === "all" ? "∞" : undefined}
          active={repeat !== "off"}
        />
      </View>

      {/* Transport controls */}
      <View
        style={{
          marginTop: 10,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
        }}
      >
        <IconBtn
          name="play-skip-back"
          onPress={() =>
            seekTo?.(Math.max(0, (positionMs || 0) - 10_000))
          }
        />
        <Pressable
          onPress={onTogglePlay}
          style={{
            width: 70,
            height: 70,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: ACCENT,
            shadowColor: ACCENT,
            shadowOpacity: 0.45,
            shadowRadius: 16,
          }}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={30} color="#fff" />
        </Pressable>
        <IconBtn
          name="play-skip-forward"
          onPress={() =>
            seekTo?.(Math.min((durationMs || 0), (positionMs || 0) + 10_000))
          }
        />
      </View>
    </View>
  );
}

function IconBtn({ name, onPress }: { name: any; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 48,
        height: 48,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
      }}
    >
      <Ionicons name={name} size={22} color="#fff" />
    </Pressable>
  );
}

function ControlIcon({
  name,
  onPress,
  active,
  badge,
}: {
  name: any;
  onPress: () => void;
  active?: boolean;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 10,
        borderRadius: 12,
        backgroundColor: active ? "rgba(142,89,255,0.18)" : "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: STROKE,
        minWidth: 46,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={name} size={18} color={active ? "#fff" : "#EDEFF6"} />
      {badge && (
        <View
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            backgroundColor: ACCENT,
            borderRadius: 999,
            paddingHorizontal: 4,
            paddingVertical: 1,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "900" }}>
            {badge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const StyleSheet_absFill = {
  position: "absolute" as const,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};
