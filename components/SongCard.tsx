// components/SongCard.tsx
import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SafeImage from "./SafeImage";
import { toggleFavorite } from "../lib/db.favorites";
import { usePlayback } from "../contexts/PlaybackContext";
import { streamUrlFor as _streamUrlFor } from "../lib/audius";

export type SongCardTrack = {
  id: string;
  title: string;
  user?: { name?: string | null } | null;
  artwork?: string | { [k: string]: string } | null;
};

const resolveArt = (art?: string | Record<string, string> | null) => {
  if (!art) return null;
  if (typeof art === "string") return art;
  return art["1000x1000"] || art["480x480"] || art["150x150"] || null;
};
const streamFor = (id: string) => {
  try {
    const fn = _streamUrlFor as unknown as (x: string) => string;
    if (typeof fn === "function") return String(fn(id));
  } catch {}
  return `https://discoveryprovider.audius.co/v1/tracks/${id}/stream?app_name=sonara`;
};

export default function SongCard({
  track,
  onPress,
  onAdd,
  showHeart = true,
  // NEW: when provided, we’ll start playback with the whole list
  list,
  index,
}: {
  track: SongCardTrack;
  onPress?: () => void;
  onAdd?: () => void;
  showHeart?: boolean;
  list?: SongCardTrack[];
  index?: number;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const pb = usePlayback();

  const artwork = useMemo(() => resolveArt(track.artwork), [track?.artwork]);
  const artistName = useMemo(
    () => (track?.user?.name ? String(track.user.name) : "Unknown"),
    [track?.user?.name]
  );

  const startPlayback = async () => {
    // If a list + index is supplied (e.g., Home grid), play with a queue
    if (list && typeof index === "number") {
      const mapped = list.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.user?.name || "Unknown",
        artwork: resolveArt(t.artwork),
        streamUrl: streamFor(t.id),
      }));
      await pb.playFromList(mapped, Math.max(0, Math.min(mapped.length - 1, index)), true);
      return;
    }

    // Fallback: single
    await pb.playSingle(
      {
        id: track.id,
        title: track.title,
        artist: artistName,
        artwork: artwork || null,
        streamUrl: streamFor(track.id),
      },
      true
    );
  };

  const handleCardPress = async () => {
    if (onPress) return onPress();
    try {
      await startPlayback();
    } catch {}
    router.push({
      pathname: "/player",
      params: {
        id: track.id,
        title: encodeURIComponent(track.title),
        artist: encodeURIComponent(artistName),
        artwork: encodeURIComponent(artwork || ""),
      },
    });
  };

  const onToggleHeart = async (e?: any) => {
    e?.stopPropagation?.();
    try {
      const next = await toggleFavorite({
        id: track.id,
        title: track.title,
        user: { name: artistName },
        artwork,
      });
      setLiked(next);
    } catch {}
  };

  return (
    <Pressable
      onPress={handleCardPress}
      style={{
        width: 160,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
      }}
    >
      <View style={{ position: "relative" }}>
        <SafeImage uri={artwork} style={{ width: "100%", height: 120 }} contentFit="cover" />
        {showHeart && (
          <Pressable
            onPress={onToggleHeart}
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              backgroundColor: "rgba(0,0,0,0.45)",
              borderRadius: 999,
              padding: 6,
            }}
          >
            <Ionicons name={liked ? "heart" : "heart-outline"} size={18} color="#FF7B93" />
          </Pressable>
        )}
      </View>

      <View style={{ padding: 10, gap: 4 }}>
        <Text style={{ color: "#fff", fontWeight: "900" }} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={{ color: "#A4A8B8", fontSize: 12 }} numberOfLines={1}>
          {artistName}
        </Text>

        {onAdd ? (
          <Pressable
            onPress={(e: any) => {
              e?.stopPropagation?.();
              onAdd();
            }}
            style={{
              alignSelf: "flex-start",
              marginTop: 6,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: "#8E59FF",
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Ionicons name="add" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>Add</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}
