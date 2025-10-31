// components/MiniPlayer.tsx
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import SafeImage from "./SafeImage";
import { useRouter } from "expo-router";
import { usePlayback } from "../contexts/PlaybackContext";

const STROKE = "rgba(255,255,255,0.12)";

export default function MiniPlayer() {
  const pb = usePlayback();
  const router = useRouter();

  if (!pb.current) return null;

  const canPrev = pb.queue.length > 1 || pb.repeatMode === "all";
  const canNext = pb.queue.length > 1 || pb.repeatMode === "all";

  return (
    <Pressable
      onPress={() => router.push("/player")}
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 78, // keep above TabBar
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <LinearGradient
        colors={["#1b1530", "#0B0E17"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: STROKE,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <SafeImage
            uri={pb.current.artwork ?? null}
            style={{ width: 44, height: 44, borderRadius: 8 }}
            contentFit="cover"
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontWeight: "900" }} numberOfLines={1}>
              {pb.current.title}
            </Text>
            <Text style={{ color: "#B7BCD3", fontSize: 12 }} numberOfLines={1}>
              {pb.current.artist || "Unknown"}
            </Text>
          </View>

          {/* Prev */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              if (canPrev) pb.prev();
            }}
            style={{ padding: 8, opacity: canPrev ? 1 : 0.5 }}
          >
            <Ionicons name="play-skip-back" size={20} color="#fff" />
          </Pressable>

          {/* Toggle */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              pb.toggle();
            }}
            style={{ padding: 8 }}
          >
            <Ionicons name={pb.isPlaying ? "pause" : "play"} size={20} color="#fff" />
          </Pressable>

          {/* Next */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              if (canNext) pb.next();
            }}
            style={{ padding: 8, opacity: canNext ? 1 : 0.5 }}
          >
            <Ionicons name="play-skip-forward" size={20} color="#fff" />
          </Pressable>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
