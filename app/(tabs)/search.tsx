// app/(tabs)/search.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { searchTracks, AudiusTrack } from "../../lib/audius";
import { getMyPlaylists, addItemToPlaylist, createPlaylist, Playlist } from "../../lib/db.playlists";
import { useRouter } from "expo-router";

export default function Search() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [workingQ, setWorkingQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AudiusTrack[]>([]);

  // add-to-playlist modal
  const [pickerOpen, setPickerOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<AudiusTrack | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // fetch playlists once (for picker)
  useEffect(() => {
    (async () => {
      const pls = await getMyPlaylists();
      setPlaylists(pls);
    })();
  }, []);

  // debounce search as user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const term = q.trim();
      setWorkingQ(term);
      if (!term) {
        setResults([]);
        return;
      }
      try {
        setLoading(true);
        const data = await searchTracks(term, 40);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  const headerLabel = useMemo(() => {
    if (!workingQ) return "Browse & Search";
    return `Results for “${workingQ}”`;
  }, [workingQ]);

  const openPicker = (track: AudiusTrack) => {
    setSelectedTrack(track);
    setPickerOpen(true);
    Keyboard.dismiss();
  };

  const addTo = async (playlistId: string) => {
    if (!selectedTrack) return;
    try {
      await addItemToPlaylist(playlistId, {
        track_id: selectedTrack.id,
        title: selectedTrack.title,
        artist: selectedTrack.user?.name || "Unknown",
        artwork_url: selectedTrack.artwork || null,
        duration: selectedTrack.duration || null,
      });
      setPickerOpen(false);
      setSelectedTrack(null);
      Alert.alert("Added", "Song added to playlist.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not add to playlist.");
    }
  };

  const quickCreate = async () => {
    if (!newName.trim()) return;
    try {
      setCreating(true);
      const p = await createPlaylist(newName.trim());
      // refresh local playlists
      const pls = await getMyPlaylists();
      setPlaylists(pls);
      setNewName("");
      setCreating(false);
      // Add immediately to the just-created playlist if a track is selected
      if (selectedTrack) {
        await addTo(p.id);
      }
    } catch (e: any) {
      setCreating(false);
      Alert.alert("Error", e?.message ?? "Could not create playlist.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0E17" }}>
      {/* Header */}
      <LinearGradient
        colors={["#3a2666", "#0B0E17"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          paddingTop: insets.top + 14,
          paddingBottom: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <Pressable onPress={() => router.back()} style={{ paddingRight: 8, paddingVertical: 6 }}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 20 }}>{headerLabel}</Text>
        </View>

        {/* Search input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: 12,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          <Ionicons name="search" size={18} color="#B7BCD3" />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search songs, artists..."
            placeholderTextColor="#8b8ea3"
            style={{ flex: 1, paddingVertical: 10, color: "#fff", marginLeft: 8 }}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => setQ(q)} // re-trigger debounce
          />
          {q.length > 0 && (
            <Pressable onPress={() => { setQ(""); setResults([]); }}>
              <Ionicons name="close-circle" size={18} color="#8b8ea3" />
            </Pressable>
          )}
        </View>
      </LinearGradient>

      {/* Results */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ color: "#B7BCD3", marginTop: 8 }}>Searching…</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18, textAlign: "center" }}>
            {workingQ ? "No results" : "Search for any song"}
          </Text>
          <Text style={{ color: "#B7BCD3", textAlign: "center", marginTop: 6 }}>
            Try “Afrobeats”, “Burna Boy”, “lofi”…
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              <Image
                source={{ uri: item.artwork || "https://placehold.co/80x80/1a1f2e/FFFFFF?text=♪" }}
                style={{ width: 64, height: 64 }}
              />
              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={{ color: "#fff", fontWeight: "900" }} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={{ color: "#B7BCD3", fontSize: 12 }} numberOfLines={1}>
                  {item.user?.name || "Unknown"}
                </Text>
              </View>
              <Pressable
                onPress={() => openPicker(item)}
                style={{ paddingHorizontal: 12, paddingVertical: 10 }}
              >
                <Ionicons name="add-circle" size={22} color="#C07CFF" />
              </Pressable>
            </View>
          )}
        />
      )}

      {/* Add to playlist modal */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={() => setPickerOpen(false)} />
        <View
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            top: "20%",
            backgroundColor: "#151827",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16, marginBottom: 10 }}>
            Add to playlist
          </Text>
          {playlists.length === 0 ? (
            <Text style={{ color: "#B7BCD3", marginBottom: 10 }}>
              You have no playlists yet. Create one below.
            </Text>
          ) : (
            <FlatList
              data={playlists}
              keyExtractor={(p) => p.id}
              style={{ maxHeight: 240 }}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => addTo(item.id)}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.12)",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "800" }}>{item.name}</Text>
                </Pressable>
              )}
            />
          )}

          {/* Quick create */}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="New playlist name"
              placeholderTextColor="#778"
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.06)",
                color: "#fff",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
              }}
            />
            <Pressable
              onPress={quickCreate}
              disabled={creating || !newName.trim()}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: creating || !newName.trim() ? "rgba(255,255,255,0.1)" : "#8E59FF",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>
                {creating ? "…" : "Create"}
              </Text>
            </Pressable>
          </View>

          <Pressable onPress={() => setPickerOpen(false)} style={{ alignSelf: "flex-end", marginTop: 12 }}>
            <Text style={{ color: "#B7BCD3" }}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
