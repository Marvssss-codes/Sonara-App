// app/player.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import SafeImage from "../components/SafeImage";
import { Player, NowPlaying } from "../lib/player";

const ACCENT = "#8E59FF";
const BG_TOP = "#181224";
const BG_BOTTOM = "#0B0E17";
const TEXT_SUB = "#B7BCD3";

export default function PlayerScreen() {
  const { id, title, artist, artwork } = useLocalSearchParams<{
    id: string;
    title: string;
    artist?: string;
    artwork?: string;
  }>();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tick, setTick] = useState(0);

  const track: NowPlaying = useMemo(
    () => ({
      id: String(id),
      title: decodeURIComponent(title || ""),
      artist: artist ? decodeURIComponent(artist) : "Unknown",
      artwork: artwork ? decodeURIComponent(artwork) : null,
    }),
    [id, title, artist, artwork]
  );

  useEffect(() => {
    let mounted = true;

    const update = () => {
      if (!mounted) return;
      setPos(Player.position);
      setDur(Player.duration);
      setPlaying(Player.isPlaying);
      setTick((x) => x + 1);
    };
    Player.onUpdate = update;

    (async () => {
      try {
        await Player.load(track, true);
      } catch (e: any) {
        console.log("Playback error", e);
      }
    })();

    const interval = setInterval(update, 300);

    return () => {
      mounted = false;
      Player.onUpdate = undefined;
      clearInterval(interval);
      Player.dispose().catch(() => {});
    };
  }, [id]);

  const fmt = (ms: number) => {
    const s = Math.floor((ms || 0) / 1000);
    const m = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, "0");
    return `${m}:${ss}`;
  };

  return (
    <LinearGradient
      colors={[BG_TOP, BG_BOTTOM]}
      style={{ flex: 1, paddingTop: insets.top + 16 }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <View style={{ flexDirection: "row", gap: 18 }}>
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
        </View>
      </View>

      {/* Artwork */}
      <View
        style={{
          alignItems: "center",
          marginTop: 36,
          shadowColor: "#000",
          shadowOpacity: 0.5,
          shadowRadius: 20,
        }}
      >
        <View
          style={{
            width: 220,
            height: 220,
            borderRadius: 999,
            overflow: "hidden",
            borderWidth: 3,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <SafeImage
            uri={track.artwork ?? null}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </View>
      </View>

      {/* Title & artist */}
      <View
        style={{
          alignItems: "center",
          marginTop: 28,
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 22,
            fontWeight: "900",
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text
          style={{ color: TEXT_SUB, fontSize: 14, marginTop: 6 }}
          numberOfLines={1}
        >
          {track.artist || "Unknown"}
        </Text>
      </View>

      {/* Slider */}
      <View style={{ paddingHorizontal: 24, marginTop: 36 }}>
        <Slider
          value={pos}
          minimumValue={0}
          maximumValue={dur || 1}
          onSlidingComplete={(v) =>
            Player.seek(Array.isArray(v) ? v[0] : v)
          }
          thumbTintColor="#fff"
          minimumTrackTintColor={ACCENT}
          maximumTrackTintColor="rgba(255,255,255,0.3)"
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <Text style={{ color: TEXT_SUB, fontSize: 12 }}>{fmt(pos)}</Text>
          <Text style={{ color: TEXT_SUB, fontSize: 12 }}>{fmt(dur)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 30,
          gap: 24,
        }}
      >
        <IconBtn name="repeat" />
        <IconBtn name="play-skip-back" />
        <Pressable
          onPress={() => Player.toggle()}
          style={{
            width: 78,
            height: 78,
            borderRadius: 999,
            backgroundColor: ACCENT,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: ACCENT,
            shadowOpacity: 0.6,
            shadowRadius: 14,
          }}
        >
          <Ionicons
            name={playing ? "pause" : "play"}
            size={34}
            color="#fff"
            style={{ marginLeft: playing ? 0 : 3 }}
          />
        </Pressable>
        <IconBtn name="play-skip-forward" />
        <IconBtn name="shuffle" />
      </View>

      {/* Bottom lyric section */}
      <View
        style={{
          alignItems: "center",
          marginTop: 40,
        }}
      >
        <Text style={{ color: TEXT_SUB, fontSize: 13 }}>Lyric</Text>
        <View
          style={{
            width: 40,
            height: 3,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.3)",
            marginTop: 6,
          }}
        />
      </View>
    </LinearGradient>
  );
}

function IconBtn({ name }: { name: any }) {
  return (
    <Pressable
      style={{
        width: 48,
        height: 48,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={name} size={22} color="#fff" />
    </Pressable>
  );
}
