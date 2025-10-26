// app/(tabs)/library.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, FlatList, Image, Alert, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supa } from "../../lib/supabase";
import { Playlist, getMyPlaylists, createPlaylist, deletePlaylist, renamePlaylist } from "../../lib/db.playlists";

const FILTERS = ["All", "Liked Songs", "Playlists", "Downloads"];

export default function Library() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [filter, setFilter] = useState("Playlists");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  // create/rename modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const load = async () => {
    setLoading(true);
    const list = await getMyPlaylists();
    setPlaylists(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // realtime: listen to any change on my playlists
  useEffect(() => {
    let channel: any;
    (async () => {
      const { data } = await supa.auth.getSession();
      const uid = data.session?.user?.id;
      if (!uid) return;
      channel = supa
        .channel("lib_playlists")
        .on("postgres_changes",
          { event: "*", schema: "public", table: "playlists", filter: `user_id=eq.${uid}` },
          load
        )
        .subscribe();
    })();
    return () => { if (channel) supa.removeChannel(channel); };
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setModalOpen(true);
  };
  const openRename = (id: string, current: string) => {
    setEditingId(id);
    setName(current);
    setModalOpen(true);
  };

  const saveModal = async () => {
    if (!name.trim()) return;
    try {
      if (editingId) await renamePlaylist(editingId, name.trim());
      else await createPlaylist(name.trim());
      setModalOpen(false);
      setName("");
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Could not save");
    }
  };

  const remove = (id: string) => {
    Alert.alert("Delete playlist?", "This can’t be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { try { await deletePlaylist(id); } catch (e: any) { Alert.alert("Error", e.message ?? "Failed"); } } },
    ]);
  };

  const headerTitle = useMemo(() => {
    switch (filter) {
      case "Liked Songs": return "Liked songs";
      case "Downloads": return "Downloads";
      case "All": return "Your library";
      default: return "Your playlists";
    }
  }, [filter]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0E17" }}>
      {/* Purple header */}
      <LinearGradient
        colors={["#3a2666", "#0B0E17"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ paddingTop: insets.top + 14, paddingBottom: 12, paddingHorizontal: 16 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: "#fff", fontSize: 26, fontWeight: "900" }}>{headerTitle}</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <CircleBtn icon="search" onPress={() => router.push("/search")} />
            <CircleBtn icon="notifications-outline" onPress={() => Alert.alert("Heads up", "Notifications coming soon")} />
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 14 }}>
          {FILTERS.map(f => (
            <Pressable key={f} onPress={() => setFilter(f)}
              style={{
                paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
                backgroundColor: filter === f ? "#C07CFF" : "rgba(255,255,255,0.08)",
                borderWidth: 1, borderColor: "rgba(255,255,255,0.12)"
              }}>
              <Text style={{ color: filter === f ? "#fff" : "#B7BCD3", fontWeight: "800" }}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {filter !== "Playlists" ? (
          <EmptyBlock label="Coming soon" hint="This section will be ready after we wire Favorites & Downloads." />
        ) : loading ? (
          <EmptyBlock label="Loading playlists..." />
        ) : playlists.length === 0 ? (
          <EmptyBlock
            label="No playlists yet"
            hint="Create your first playlist to get started."
            actionLabel="Create playlist"
            onAction={openCreate}
          />
        ) : (
          <FlatList
            data={playlists}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(`/playlist/${item.id}`)}
                style={{
                  height: 72, borderRadius: 16, overflow: "hidden",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
                  flexDirection: "row", alignItems: "center", paddingRight: 10
                }}
              >
                <Image
                  source={{ uri: item.cover_url || "https://placehold.co/128x128/1a1f2e/FFFFFF?text=PL" }}
                  style={{ width: 72, height: "100%" }}
                />
                <View style={{ flex: 1, paddingHorizontal: 12 }}>
                  <Text style={{ color: "#fff", fontWeight: "900" }} numberOfLines={1}>{item.name}</Text>
                  <Text style={{ color: "#B7BCD3", fontSize: 12 }} numberOfLines={1}>Tap to open</Text>
                </View>
                <Pressable onPress={() => openRename(item.id, item.name)} style={{ padding: 8 }}>
                  <Ionicons name="pencil" size={18} color="#C07CFF" />
                </Pressable>
                <Pressable onPress={() => remove(item.id)} style={{ padding: 8 }}>
                  <Ionicons name="trash" size={18} color="#FF7B93" />
                </Pressable>
              </Pressable>
            )}
          />
        )}
      </View>

      {/* FAB */}
      {filter === "Playlists" && (
        <Pressable
          onPress={openCreate}
          style={{
            position: "absolute", right: 18, bottom: insets.bottom + 24,
            width: 56, height: 56, borderRadius: 999,
            backgroundColor: "#8E59FF", alignItems: "center", justifyContent: "center",
            shadowColor: "#8E59FF", shadowOpacity: 0.5, shadowRadius: 10
          }}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </Pressable>
      )}

      {/* Create/Rename modal */}
      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={() => setModalOpen(false)} />
        <View style={{ position: "absolute", left: 16, right: 16, top: "35%", borderRadius: 16, overflow: "hidden" }}>
          <LinearGradient colors={["#1b1530", "#0B0E17"]} style={{ padding: 16 }}>
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16, marginBottom: 10 }}>
              {editingId ? "Rename playlist" : "New playlist"}
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Playlist name"
              placeholderTextColor="#778"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)", color: "#fff", borderRadius: 12,
                paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)"
              }}
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <DialogBtn title="Cancel" onPress={() => setModalOpen(false)} />
              <DialogBtn title="Save" filled onPress={saveModal} />
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}

function CircleBtn({ icon, onPress }: { icon: any; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}
      style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.10)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }}>
      <Ionicons name={icon} size={18} color="#fff" />
    </Pressable>
  );
}

function EmptyBlock({ label, hint, actionLabel, onAction }: { label: string; hint?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18, marginBottom: 6 }}>{label}</Text>
      {hint ? <Text style={{ color: "#B7BCD3", textAlign: "center", marginBottom: 14 }}>{hint}</Text> : null}
      {actionLabel ? (
        <Pressable onPress={onAction} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, backgroundColor: "#8E59FF" }}>
          <Text style={{ color: "#fff", fontWeight: "800" }}>{actionLabel}</Text>
        </Pressable>
      ) : null}
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
