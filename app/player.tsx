// app/player.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import SafeImage from "../components/SafeImage";
import { Player, NowPlaying } from "../lib/player";

const ACCENT = "#8E59FF"; // main purple accent color
const TEXT_SUB = "#B7BCD3"; // secondary gray text
const BG_TOP = "#181224";
const BG_BOTTOM = "#0B0E17";

export default function PlayerScreen() {
  // get song info from route parameters
  const { id, title, artist, artwork } = useLocalSearchParams<{
    id: string;
    title: string;
    artist?: string;
    artwork?: string;
  }>();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  // playback states
  const [pos, setPos] = useState(0); // current position
  const [dur, setDur] = useState(0); // total duration
  const [playing, setPlaying] = useState(false);
  const [tick, setTick] = useState(0);

  // memoized track info
  const track: NowPlaying = useMemo(
    () => ({
      id: String(id),
      title: decodeURIComponent(title || ""),
      artist: artist ? decodeURIComponent(artist) : "Unknown",
      artwork: artwork ? decodeURIComponent(artwork) : null,
    }),
    [id, title, artist, artwork]
  );

  // load the track & update progress every 300ms
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
        await Player.load(track, true); // auto play when opened
      } catch (e) {
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

  // format time mm:ss
  const fmt = (ms: number) => {
    const s = Math.floor((ms || 0) / 1000);
    const m = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, "0");
    return `${m}:${ss}`;
  };

  return (
    <LinearGradient
      colors={[BG_TOP, BG_BOTTOM]}
      style={{ flex: 1, paddingTop: insets.top + 10 }}
    >
      {/* === Header === */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 18,
          paddingBottom: 4,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-down" size={22} color="#fff" />
        </Pressable>

        <View style={{ alignItems: "center" }}>
          <Text style={{ color: TEXT_SUB, fontSize: 12 }}>PLAYING FROM YOUR LIBRARY</Text>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700", marginTop: 2 }}>
            Liked Songs
          </Text>
        </View>

        <Ionicons name="ellipsis-horizontal" size={22} color="#fff" />
      </View>

      {/* === Artwork === */}
      <View style={{ alignItems: "center", marginTop: 40 }}>
        <View
          style={{
            width: 280,
            height: 280,
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        >
          <SafeImage
            uri={track.artwork ?? null}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </View>
      </View>

      {/* === Title & Artist === */}
      <View
        style={{
          marginTop: 36,
          paddingHorizontal: 28,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 24,
            fontWeight: "800",
          }}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text
          style={{
            color: TEXT_SUB,
            fontSize: 15,
            marginTop: 4,
          }}
          numberOfLines={1}
        >
          {track.artist}
        </Text>
      </View>

      {/* === Progress Bar === */}
      <View style={{ paddingHorizontal: 28, marginTop: 34 }}>
        <Slider
          value={pos}
          minimumValue={0}
          maximumValue={dur || 1}
          onSlidingComplete={(v) => Player.seek(Array.isArray(v) ? v[0] : v)}
          thumbTintColor="#fff"
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="rgba(255,255,255,0.3)"
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <Text style={{ color: TEXT_SUB, fontSize: 12 }}>{fmt(pos)}</Text>
          <Text style={{ color: TEXT_SUB, fontSize: 12 }}>{fmt(dur)}</Text>
        </View>
      </View>

      {/* === Control Buttons === */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 28,
          gap: 28,
        }}
      >
        <IconBtn name="shuffle" />
        <IconBtn name="play-skip-back" />
        <Pressable
          onPress={() => Player.toggle()}
          style={{
            width: 78,
            height: 78,
            borderRadius: 999,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={playing ? "pause" : "play"}
            size={36}
            color="#000"
            style={{ marginLeft: playing ? 0 : 4 }}
          />
        </Pressable>
        <IconBtn name="play-skip-forward" />
        <IconBtn name="repeat" />
      </View>

      {/* === Bottom "Lyrics preview" section === */}
      <View
        style={{
          marginTop: 48,
          alignItems: "center",
          paddingBottom: 40,
        }}
      >
        <Text style={{ color: TEXT_SUB, fontSize: 13 }}>Lyrics preview</Text>
        <View
          style={{
            width: 45,
            height: 4,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.3)",
            marginTop: 8,
          }}
        />
      </View>
    </LinearGradient>
  );
}

// === Reusable button for small controls ===
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
