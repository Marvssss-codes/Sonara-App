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
  Share,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { usePlayback } from "../contexts/PlaybackContext";
import { streamUrlFor as _streamUrlFor } from "../lib/audius";
import { toggleFavorite } from "../lib/db.favorites";

const BG = "#0B0E17";
const SUB = "#B7BCD3";
const ACCENT = "#8E59FF";
const STROKE = "rgba(255,255,255,0.12)";
const GLOW = "rgba(142, 89, 255, 0.35)";
const { width, height } = Dimensions.get("window");

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

const StyleSheet_absFill = {
  position: "absolute" as const,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
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
  const pb: any = usePlayback();

  const current = pb.current;
  const isPlaying = !!pb.isPlaying;
  const durationMs = num(pb, ["durationMs"]);
  const positionMs = num(pb, ["positionMs"]);
  const queue: any[] = Array.isArray(pb.queue) ? pb.queue : [];
  const index: number = typeof pb.index === "number" ? pb.index : 0;

  // Load from route params ONLY if no active queue (prevents next/prev from being overridden)
  useEffect(() => {
    if (!id) return;
    const hasQueue = queue.length > 0;
    if (!current || (current.id !== id && !hasQueue)) {
      const t = {
        id,
        title: decodeURIComponent(title || "Unknown"),
        artist: decodeURIComponent(artist || "Unknown"),
        artwork: artwork ? decodeURIComponent(artwork) : null,
        streamUrl: resolveStreamUrl(id),
      };
      pb.playSingle(t, true).catch(() => {});
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
    return () => stopSpin();
  }, [isPlaying, current?.id]);

  // Repeat (bound to context that exposes repeatMode & setRepeatMode)
  const cycleRepeat = () =>
    pb.setRepeatMode(pb.repeatMode === "off" ? "one" : pb.repeatMode === "one" ? "all" : "off");
  const repeatBadge = pb.repeatMode === "one" ? "1" : pb.repeatMode === "all" ? "∞" : undefined;

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
    pb.seekTo(Math.floor(pct * (durationMs || 0)));
  };

  const onTogglePlay = async () => {
    try {
      if (isPlaying) await pb.pause();
      else await pb.play();
    } catch {}
  };

  // Like state (optimistic)
  const [liked, setLiked] = useState(false);
  useEffect(() => {
    // reset liked indicator on track change; true source of truth is DB
    setLiked(false);
  }, [current?.id]);

  const onToggleLike = async () => {
    if (!current?.id) return;
    try {
      const next = await toggleFavorite({
        id: current.id,
        title: current.title,
        user: { name: current.artist || "Unknown" },
        artwork: current.artwork || null,
      });
      setLiked(next);
    } catch {}
  };

  const onShare = () => {
    if (!current) return;
    Share.share({
      title: current.title,
      message: `${current.title} — ${current.artist || "Unknown"}\n\nListen: ${current.streamUrl}`,
    }).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Blurred/dimmed artwork backdrop */}
      {current?.artwork ? (
        <Animated.Image
          source={{ uri: current.artwork }}
          blurRadius={30}
          style={[StyleSheet_absFill as any, { opacity: 0.25 }]}
          resizeMode="cover"
        />
      ) : null}
      {/* Soft gradient overlay */}
      <LinearGradient
        colors={["rgba(11,14,23,0.85)", "#0B0E17"]}
        style={{ ...StyleSheet_absFill, opacity: 1 }}
      />
      {/* Accent glow */}
      <View
        style={{
          position: "absolute",
          width: width * 0.9,
          height: width * 0.9,
          borderRadius: 999,
          backgroundColor: GLOW,
          top: -width * 0.3,
          left: -width * 0.2,
          opacity: 0.25,
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

        <View style={{ alignItems: "center", maxWidth: width * 0.5 }}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }} numberOfLines={1}>
            Now Playing
          </Text>
          {!!current?.artist && (
            <Text style={{ color: SUB, fontSize: 11 }} numberOfLines={1}>
              {current.artist}
            </Text>
          )}
        </View>

        <Pressable onPress={onShare} style={{ padding: 8 }}>
          <Ionicons name="share-social-outline" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Artwork Vinyl */}
      <View style={{ alignItems: "center", marginTop: 6 }}>
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
            <Image source={{ uri: current.artwork }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
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

      {/* Actions row */}
      <View
        style={{
          marginTop: 12,
          paddingHorizontal: 28,
          flexDirection: "row",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <PillIcon
          icon={liked ? "heart" : "heart-outline"}
          color={liked ? "#FF7B93" : "#FFFFFF"}
          label={liked ? "Liked" : "Like"}
          onPress={onToggleLike}
          active={liked}
        />
        <PillIcon
          icon="repeat"
          label={pb.repeatMode === "one" ? "Repeat 1" : pb.repeatMode === "all" ? "Repeat" : "Repeat"}
          onPress={cycleRepeat}
          badge={repeatBadge}
          active={pb.repeatMode !== "off"}
        />
        <PillIcon icon="share-outline" label="Share" onPress={onShare} />
      </View>

      {/* Progress rail with thumb */}
      <View style={{ marginTop: 18, paddingHorizontal: 16 }}>
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
              left: Math.max(0, progress * (railWidthRef.current || 0) - 8),
              width: 16,
              height: 16,
              borderRadius: 999,
              backgroundColor: "#fff",
              borderWidth: 2,
              borderColor: ACCENT,
            }}
          />
          {/* interactive layer */}
          <Pressable
            onPress={(e) => onSeekAt((e.nativeEvent as any).locationX as number)}
            style={{ ...StyleSheet_absFill }}
          />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
          <Text style={{ color: SUB, fontSize: 12 }}>{pretty(positionMs)}</Text>
          <Text style={{ color: SUB, fontSize: 12 }}>{pretty(durationMs)}</Text>
        </View>
      </View>

      {/* Queue strip (jump to any item) */}
      {queue.length > 1 && (
        <View style={{ marginTop: 14 }}>
          <FlatList
            horizontal
            data={queue}
            keyExtractor={(t, i) => (t.id ? `${t.id}-${i}` : String(i))}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            renderItem={({ item, index: i }) => {
              const active = i === index;
              return (
                <Pressable
                  onPress={() => pb.playFromList(queue, i, true)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: active ? "rgba(142,89,255,0.22)" : "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: STROKE,
                    maxWidth: width * 0.6,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: active ? "900" as any : "700" as any }}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  {!!item.artist && (
                    <Text style={{ color: SUB, fontSize: 11 }} numberOfLines={1}>
                      {item.artist}
                    </Text>
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {/* Transport controls */}
      <View
        style={{
          marginTop: 16,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
        }}
      >
        <IconBtn name="play-skip-back" onPress={() => pb.prev()} />
        <Pressable
          onPress={onTogglePlay}
          style={{
            width: 74,
            height: 74,
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
        <IconBtn name="play-skip-forward" onPress={() => pb.next()} />
      </View>

      {/* Bottom safe area spacer */}
      <View style={{ height: insets.bottom + 10 }} />
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

function PillIcon({
  icon,
  label,
  onPress,
  active,
  badge,
  color = "#FFFFFF",
}: {
  icon: any;
  label: string;
  onPress: () => void;
  active?: boolean;
  badge?: string;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: active ? "rgba(142,89,255,0.18)" : "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: STROKE,
      }}
    >
      <View style={{ position: "relative" }}>
        <Ionicons name={icon} size={16} color={active ? "#fff" : color} />
        {badge && (
          <View
            style={{
              position: "absolute",
              top: -6,
              right: -8,
              backgroundColor: ACCENT,
              borderRadius: 999,
              paddingHorizontal: 4,
              paddingVertical: 1,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "900" }}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}
