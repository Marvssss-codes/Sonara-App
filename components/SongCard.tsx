// components/SongCard.tsx
import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SafeImage from "./SafeImage";
import { toggleFavorite } from "../lib/db.favorites";
import { usePlayer } from "./PlayerContext";
import { getStreamUrl } from "../lib/audius";

export type SongCardTrack = {
  id: string;
  title: string;
  user?: { name?: string | null } | null;
  artwork?: string | { [k: string]: string } | null;
};

export default function SongCard({
  track,
  onPress,          // optional custom press handler
  onAdd,            // optional "Add" action (e.g., add to playlist)
  showHeart = true, // show/hide heart button
}: {
  track: SongCardTrack;
  onPress?: () => void;
  onAdd?: () => void;
  showHeart?: boolean;
}) {
  const { playTrack, setPlayerExpanded } = usePlayer();
  const [liked, setLiked] = useState(false);

  // Normalize artwork once
  const artwork = useMemo(() => {
    if (!track?.artwork) return null;
    if (typeof track.artwork === "string") return track.artwork;
    return (
      (track.artwork["150x150"] as string) ||
      (track.artwork["480x480"] as string) ||
      (track.artwork["1000x1000"] as string) ||
      null
    );
  }, [track?.artwork]);

  const artistName = useMemo(
    () => (track?.user?.name ? String(track.user.name) : "Unknown"),
    [track?.user?.name]
  );

  const handleCardPress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    // Map Audius track -> internal Player Track and start playback
    const mapped = {
      id: track.id,
      title: track.title,
      artist: artistName,
      artworkUri: artwork || undefined,
      source: { uri: getStreamUrl(track.id) },
    } as const;

    await playTrack(mapped as any);
    setPlayerExpanded(true);
  };

  const onToggleHeart = async () => {
    try {
      const next = await toggleFavorite({
        id: track.id,
        title: track.title,
        user: { name: artistName },
        artwork,
      });
      setLiked(next);
    } catch (e) {
      console.log("favorite toggle failed", e);
    }
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
            onPress={(e: any) => {
              e?.stopPropagation?.();
              onToggleHeart();
            }}
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
