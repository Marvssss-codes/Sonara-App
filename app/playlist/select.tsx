import { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supa } from "../../lib/supabase";
import { listPlaylists, createPlaylist, addToPlaylist } from "../../lib/db";

type Playlist = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export default function SelectPlaylist() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    trackId?: string;
    title?: string;
    artist?: string;
    artwork?: string;
  }>();

  const [uid, setUid] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supa.auth.getUser();
      const id = data.user?.id || null;
      setUid(id);
      if (!id) return;
      const { data: pls, error } = await listPlaylists(id);
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
      setPlaylists((pls as Playlist[]) || []);
    })();
  }, []);

  async function handleCreate() {
    try {
      if (!uid) return Alert.alert("Not signed in", "Please log in.");
      const name = newName.trim();
      if (!name) return Alert.alert("Name required", "Please type a playlist name.");
      setBusy(true);
      const { data, error } = await createPlaylist(uid, name);
      setBusy(false);
      if (error) return Alert.alert("Error", error.message);
      setNewName("");
      setPlaylists((prev) => [data as Playlist, ...prev]);
    } catch (e: any) {
      setBusy(false);
      Alert.alert("Error", e?.message ?? "Could not create playlist");
    }
  }

  async function handleAdd(playlistId: string) {
    try {
      if (!params.trackId) return Alert.alert("Missing track", "No track info provided.");
      const { error } = await addToPlaylist(playlistId, {
        id: String(params.trackId),
        title: String(params.title || "Untitled"),
        artist: String(params.artist || ""),
        artwork_url: String(params.artwork || ""),
      });
      if (error) return Alert.alert("Error", error.message);
      Alert.alert("Added", "Track added to playlist.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not add to playlist");
    }
  }

  return (
    <View style={{ flex: 1, paddingTop: 32 }}>
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Select a playlist</Text>
        <Text style={{ color: "#666" }} numberOfLines={2}>
          {params.title ? `Track: ${params.title}` : ""}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 8, marginBottom: 12, flexDirection: "row", gap: 8 }}>
        <TextInput
          placeholder="New playlist name"
          value={newName}
          onChangeText={setNewName}
          style={{ flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
        />
        <Pressable
          onPress={handleCreate}
          disabled={busy}
          style={{ paddingHorizontal: 16, borderWidth: 1, borderRadius: 10, justifyContent: "center" }}
        >
          <Text>{busy ? "..." : "Create"}</Text>
        </Pressable>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleAdd(item.id)}
            style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" }}
          >
            <Text style={{ fontWeight: "700" }}>{item.name}</Text>
            <Text style={{ color: "#666" }}>{new Date(item.created_at).toLocaleString()}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: "#666", marginTop: 12 }}>No playlists yet.</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
