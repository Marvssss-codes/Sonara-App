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

const resolveStreamUrl = (id: string) => {
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
}: {
  track: SongCardTrack;
  onPress?: () => void;
  onAdd?: () => void;
  showHeart?: boolean;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const pb = usePlayback();

  const artwork = useMemo(() => {
    if (!track?.artwork) return null;
    if (typeof track.artwork === "string") return track.artwork;
    return (
      (track.artwork["1000x1000"] as string) ||
      (track.artwork["480x480"] as string) ||
      (track.artwork["150x150"] as string) ||
      null
    );
  }, [track?.artwork]);

  const artistName = useMemo(
    () => (track?.user?.name ? String(track.user.name) : "Unknown"),
    [track?.user?.name]
  );

  const startPlayback = async () => {
    const t = {
      id: track.id,
      title: track.title,
      artist: artistName,
      artwork: artwork || null,
      streamUrl: resolveStreamUrl(track.id),
    };

    // Tolerant across context versions
    const anyPb: any = pb;
    if (typeof anyPb.loadAndPlay === "function") return anyPb.loadAndPlay(t);
    if (typeof anyPb.playSingle === "function") return anyPb.playSingle(t, true);
    if (typeof anyPb.playFromList === "function") return anyPb.playFromList([t], 0, true);
    if (typeof anyPb.setTrack === "function" || typeof anyPb.setCurrent === "function") {
      const setFn = (anyPb.setTrack || anyPb.setCurrent).bind(anyPb);
      await setFn(t);
      if (typeof anyPb.play === "function") return anyPb.play();
    }
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
