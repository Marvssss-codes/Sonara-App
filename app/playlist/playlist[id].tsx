import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, Pressable, Alert, TextInput, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supa } from "../../lib/supabase";
import { getPlaylistItems, removeItem, renamePlaylist, deletePlaylist } from "../../lib/db.playlists";

type Item = {
  id: string; track_id: string; title: string; artist?: string | null; artwork_url?: string | null; duration?: number | null;
};

export default function PlaylistDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState<string>("Playlist");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [renameOpen, setRenameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const load = async () => {
    setLoading(true);
    // get title
    const { data: pl } = await supa.from("playlists").select("name").eq("id", id).single();
    if (pl?.name) setName(pl.name);
    // get items
    const list = await getPlaylistItems(String(id));
    setItems(list as any);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  // realtime on items
  useEffect(() => {
    if (!id) return;
    const channel = supa
      .channel("pl_items_" + id)
      .on("postgres_changes", { event: "*", schema: "public", table: "playlist_items", filter: `playlist_id=eq.${id}` }, load)
      .subscribe();
    return () => { supa.removeChannel(channel); };
  }, [id]);

  const askDelete = () => {
    Alert.alert("Delete playlist?", "This will remove all items.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deletePlaylist(String(id)); router.back(); } }
    ]);
  };

  const doRename = async () => {
    if (!nameDraft.trim()) { setRenameOpen(false); return; }
    await renamePlaylist(String(id), nameDraft.trim());
    setRenameOpen(false);
    setName(nameDraft.trim());
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0E17" }}>
      {/* header */}
      <View style={{ paddingTop: 14, paddingHorizontal: 16, paddingBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}><Ionicons name="chevron-back" size={22} color="#fff" /></Pressable>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }} numberOfLines={1}>{name}</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable onPress={() => { setNameDraft(name); setRenameOpen(true); }} style={{ padding: 8 }}>
            <Ionicons name="pencil" size={18} color="#C07CFF" />
          </Pressable>
          <Pressable onPress={askDelete} style={{ padding: 8 }}>
            <Ionicons name="trash" size={18} color="#FF7B93" />
          </Pressable>
        </View>
      </View>

      {/* list */}
      {loading ? (
        <Text style={{ color: "#B7BCD3", padding: 16 }}>Loading…</Text>
      ) : items.length === 0 ? (
        <Text style={{ color: "#B7BCD3", padding: 16 }}>No songs here yet.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <View style={{
              flexDirection: "row", alignItems: "center", borderRadius: 14,
              borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
              backgroundColor: "rgba(255,255,255,0.06)"
            }}>
              <Image source={{ uri: item.artwork_url || "https://placehold.co/80x80/1a1f2e/FFFFFF?text=♪" }} style={{ width: 64, height: 64, borderTopLeftRadius: 14, borderBottomLeftRadius: 14 }} />
              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={{ color: "#fff", fontWeight: "900" }} numberOfLines={1}>{item.title}</Text>
                <Text style={{ color: "#B7BCD3", fontSize: 12 }} numberOfLines={1}>{item.artist || "Unknown"}</Text>
              </View>
              <Pressable onPress={() => removeItem(item.id)} style={{ padding: 12 }}>
                <Ionicons name="close" size={18} color="#FF7B93" />
              </Pressable>
            </View>
          )}
        />
      )}

      {/* rename modal */}
      <Modal visible={renameOpen} transparent animationType="fade" onRequestClose={() => setRenameOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={() => setRenameOpen(false)} />
        <View style={{ position: "absolute", left: 16, right: 16, top: "35%", borderRadius: 16, overflow: "hidden", backgroundColor: "#151827", padding: 16 }}>
          <Text style={{ color: "#fff", fontWeight: "900", marginBottom: 8 }}>Rename playlist</Text>
          <TextInput value={nameDraft} onChangeText={setNameDraft} placeholder="Name" placeholderTextColor="#778"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }} />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <DialogBtn title="Cancel" onPress={() => setRenameOpen(false)} />
            <DialogBtn title="Save" filled onPress={doRename} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DialogBtn({ title, onPress, filled }: { title: string; onPress: () => void; filled?: boolean }) {
  return (
    <Pressable onPress={onPress}
      style={{
        flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 12,
        backgroundColor: filled ? "#8E59FF" : "transparent",
        borderWidth: 1, borderColor: filled ? "transparent" : "rgba(255,255,255,0.2)"
      }}>
      <Text style={{ color: "#fff", fontWeight: "800" }}>{title}</Text>
    </Pressable>
  );
}
