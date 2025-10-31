// app/liked.tsx
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SafeImage from "../components/SafeImage";
import { getMyFavorites, FavoriteRow, removeFavorite } from "../lib/db.favorites";
import { usePlayback } from "../contexts/PlaybackContext";
// import as optional and guard at runtime
import { streamUrlFor as _streamUrlFor } from "../lib/audius";

const BG = "#0B0E17";
const CARD = "rgba(255,255,255,0.06)";
const STROKE = "rgba(255,255,255,0.10)";
const SUBTLE = "#B7BCD3";
const ACCENT = "#8E59FF";

// Safe resolver: use lib fn if it exists, else build URL
const resolveStreamUrl = (id: string) => {
  try {
    const fn = _streamUrlFor as unknown as (x: string) => string;
    if (typeof fn === "function") return String(fn(id));
  } catch {}
  return `https://discoveryprovider.audius.co/v1/tracks/${id}/stream?app_name=sonara`;
};

export default function LikedSongs() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pb = usePlayback();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [list, setList] = useState<FavoriteRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await getMyFavorites();
      setList(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => { load(); }, [load]);

  // Build queue for playback
  const playable = useMemo(
    () =>
      list.map((i) => ({
        id: i.track_id,
        title: i.title,
        artist: i.artist || "Unknown",
        artwork: i.artwork_url || null,
        streamUrl: resolveStreamUrl(i.track_id),
      })),
    [list]
  );

  const first4 = list.slice(0, 4).map((i) => i.artwork_url).filter(Boolean) as string[];

  async function onUnlike(item: FavoriteRow) {
    // optimistic UI
    setList((prev) => prev.filter((x) => !(x.user_id === item.user_id && x.track_id === item.track_id)));
    try {
      await removeFavorite(item.track_id);
    } catch (e: any) {
      await refresh(); // rollback
      Alert.alert("Error", e?.message ?? "Could not remove from likes.");
    }
  }

  const playAll = () => {
    if (!playable.length) return;
    pb.playFromList(playable, 0, true);
  };
  const shufflePlay = () => {
    if (!playable.length) return;
    const start = Math.floor(Math.random() * playable.length);
    pb.playFromList(playable, start, true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top + 8 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>Liked Songs</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Mosaic + actions */}
      <View style={{ paddingHorizontal: 16 }}>
        <View
          style={{
            height: 160, borderRadius: 16, overflow: "hidden",
            backgroundColor: CARD, borderWidth: 1, borderColor: STROKE, flexDirection: "row",
          }}
        >
          {first4.length ? (
            <>
              <View style={{ flex: 1 }}><SafeImage uri={first4[0]} style={{ flex: 1 }} contentFit="cover" /></View>
              <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}><SafeImage uri={first4[1] ?? first4[0]} style={{ flex: 1 }} contentFit="cover" /></View>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <View style={{ flex: 1 }}><SafeImage uri={first4[2] ?? first4[0]} style={{ flex: 1 }} contentFit="cover" /></View>
                  <View style={{ flex: 1 }}><SafeImage uri={first4[3] ?? first4[0]} style={{ flex: 1 }} contentFit="cover" /></View>
                </View>
              </View>
            </>
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="heart-outline" size={40} color={SUBTLE} />
              <Text style={{ color: SUBTLE, marginTop: 4 }}>No likes yet</Text>
            </View>
          )}
        </View>

        <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18 }}>Your Favorites</Text>
            <Text style={{ color: SUBTLE }}>{list.length} song{list.length === 1 ? "" : "s"}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable onPress={shufflePlay} style={{ padding: 8, borderRadius: 10, borderWidth: 1, borderColor: STROKE, backgroundColor: "rgba(255,255,255,0.06)" }}>
              <Ionicons name="shuffle" size={18} color="#fff" />
            </Pressable>
            <Pressable onPress={playAll} style={{ padding: 8, borderRadius: 10, backgroundColor: ACCENT }}>
              <Ionicons name="play" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ color: SUBTLE, marginTop: 8 }}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(i) => i.id}
          refreshControl={<RefreshControl tintColor="#fff" refreshing={refreshing} onRefresh={refresh} />}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 24 }}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => pb.playFromList(playable, index, true)}
              style={{
                flexDirection: "row", alignItems: "center",
                borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden",
              }}
            >
              <SafeImage uri={item.artwork_url ?? null} style={{ width: 64, height: 64 }} contentFit="cover" />
              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={{ color: "#fff", fontWeight: "900" }} numberOfLines={1}>{item.title}</Text>
                <Text style={{ color: SUBTLE, fontSize: 12 }} numberOfLines={1}>{item.artist || "Unknown"}</Text>
              </View>
              <Pressable onPress={() => onUnlike(item)} style={{ padding: 12 }}>
                <Ionicons name="heart" size={18} color="#FF7B93" />
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
