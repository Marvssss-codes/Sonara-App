// app/(tabs)/library.tsx
import { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, TextInput, Pressable } from "react-native";
import { supa } from "../../lib/supabase";
import { listFavorites, listPlaylists, createPlaylist } from "../../lib/db";
import { Link, useRouter } from "expo-router";

type Fav = {
  user_id: string;
  track_id: string;
  title: string;
  artist: string | null;
  artwork_url: string | null;
  created_at: string;
};

type Playlist = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export default function Library() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Fav[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supa.auth.getUser();
      const id = data.user?.id || null;
      setUid(id);
      if (!id) return;

      const [favRes, plRes] = await Promise.all([listFavorites(id), listPlaylists(id)]);
      if (favRes.error) Alert.alert("Favorites error", favRes.error.message);
      else setFavorites((favRes.data as Fav[]) || []);
      if (plRes.error) Alert.alert("Playlists error", plRes.error.message);
      else setPlaylists((plRes.data as Playlist[]) || []);
    })();
  }, []);

  async function handleCreate() {
    try {
      if (!uid) return Alert.alert("Not signed in", "Please log in again.");
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

  return (
    <View style={{ flex: 1, paddingTop: 32 }}>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>Favorites</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(it) => it.track_id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
            <Text style={{ fontWeight: "700" }}>{item.title}</Text>
            <Text style={{ color: "#666" }}>{item.artist || "Unknown"}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: "#666" }}>No favorites yet.</Text>}
      />

      <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>Playlists</Text>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
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
      </View>

      <FlatList
        data={playlists}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/playlist/${item.id}`)}
            style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" }}
          >
            <Text style={{ fontWeight: "700" }}>{item.name}</Text>
            <Text style={{ color: "#666" }}>{new Date(item.created_at).toLocaleString()}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: "#666", marginTop: 8 }}>No playlists yet.</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
