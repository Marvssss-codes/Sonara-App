// app/playlist/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, Pressable } from "react-native";
import { listPlaylistItems, removeFromPlaylist, deletePlaylist } from "../../lib/db";

type PItem = {
  playlist_id: string;
  track_id: string;
  title: string | null;
  artist: string | null;
  artwork_url: string | null;
  added_at: string;
};

export default function PlaylistDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [items, setItems] = useState<PItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    const { data, error } = await listPlaylistItems(id as string);
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setItems((data as PItem[]) || []);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleRemove(trackId: string) {
    const { error } = await removeFromPlaylist(id as string, trackId);
    if (error) return Alert.alert("Error", error.message);
    load();
  }

  async function handleDeletePlaylist() {
    Alert.alert("Delete playlist", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await deletePlaylist(id as string);
          if (error) return Alert.alert("Error", error.message);
          router.back();
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, paddingTop: 32 }}>
      <View style={{ paddingHorizontal: 16, marginBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Playlist</Text>
        <Pressable onPress={handleDeletePlaylist} style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8 }}>
          <Text>Delete</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => it.track_id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee", gap: 4 }}>
            <Text style={{ fontWeight: "700" }}>{item.title || "Untitled"}</Text>
            <Text style={{ color: "#666" }}>{item.artist || "Unknown"}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <Pressable
                onPress={() => handleRemove(item.track_id)}
                style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8 }}
              >
                <Text>Remove</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: "#666", marginTop: 24 }}>{loading ? "Loading..." : "No items yet."}</Text>}
      />
    </View>
  );
}
