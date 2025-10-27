// app/playlist/[id].tsx
import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { supa } from "../../lib/supabase";
import {
  getPlaylistItems,
  removeItem,
  renamePlaylist,
  deletePlaylist,
  getPlaylistMeta,
  updatePlaylistCover,
} from "../../lib/db.playlists";

type Item = {
  id: string;
  track_id: string;
  title: string;
  artist?: string | null;
  artwork_url?: string | null;
  duration?: number | null;
};

const BG = "#0B0E17";
const CARD = "rgba(255,255,255,0.06)";
const STROKE = "rgba(255,255,255,0.10)";
const SUBTLE = "#B7BCD3";
const ACCENT = "#8E59FF";

export default function PlaylistDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState<string>("Playlist");
  const [cover, setCover] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [renameOpen, setRenameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [changingCover, setChangingCover] = useState(false);

  const headerRightDisabled = useMemo(() => loading, [loading]);

  const load = async () => {
    setLoading(true);
    if (!id) return;
    try {
      const meta = await getPlaylistMeta(String(id));
      setName(meta.name);
      setCover(meta.cover_url);
      const list = await getPlaylistItems(String(id));
      setItems(list as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  // If/when Realtime becomes available you can add a channel here like we did for Library.

  const askDelete = () => {
    Alert.alert("Delete playlist?", "This will remove all items.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deletePlaylist(String(id));
          router.back();
        },
      },
    ]);
  };

  const doRename = async () => {
    if (!nameDraft.trim()) {
      setRenameOpen(false);
      return;
    }
    await renamePlaylist(String(id), nameDraft.trim());
    setName(nameDraft.trim());
    setRenameOpen(false);
  };

  const pickFromDevice = async () => {
    setChangingCover(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Allow photo access to change cover.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (res.canceled) return;
      const uri = res.assets[0].uri;
      await uploadCover(uri);
    } catch (e: any) {
      Alert.alert("Cover error", e?.message ?? "Could not change cover.");
    } finally {
      setChangingCover(false);
    }
  };

  // Quickly set the cover from a track’s artwork
  const pickFromTrackArtwork = async () => {
    if (items.length === 0) {
      Alert.alert("No items", "Add at least one song first.");
      return;
    }
    const candidate = items.find((i) => i.artwork_url) || items[0];
    if (!candidate.artwork_url) {
      Alert.alert("No artwork", "None of the tracks have artwork to use.");
      return;
    }
    // We’ll store the external URL directly as cover_url (no upload needed).
    await updatePlaylistCover(String(id), candidate.artwork_url);
    setCover(candidate.artwork_url);
    Alert.alert("Done", "Cover set from a track artwork.");
  };

  const uploadCover = async (uri: string) => {
    const ext = (uri.split(".").pop() || "jpg").toLowerCase();
    const mime =
      ext === "png"
        ? "image/png"
        : ext === "webp"
        ? "image/webp"
        : ext === "heic"
        ? "image/heic"
        : ext === "heif"
        ? "image/heif"
        : "image/jpeg";

    // Read file as base64 and upload to storage
    const base64 = await FileSystem.readAsStringAsync(uri, {
      // @ts-ignore use literal for compatibility
      encoding: "base64",
    });
    const arrayBuffer = decode(base64);
    const filename = `covers/${id}.${ext}`;

    const { error: upErr } = await supa
      .storage
      .from("playlist-covers")
      .upload(filename, arrayBuffer, { upsert: true, contentType: mime });

    if (upErr) throw upErr;

    const { data: publicUrl } = supa.storage.from("playlist-covers").getPublicUrl(filename);
    await updatePlaylistCover(String(id), publicUrl.publicUrl);
    setCover(publicUrl.publicUrl);
    Alert.alert("Cover updated", "Your playlist cover has been changed.");
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 14,
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }} numberOfLines={1}>
          {name}
        </Text>
        <View style={{ flexDirection: "row", gap: 6, opacity: headerRightDisabled ? 0.6 : 1 }}>
          <Pressable
            disabled={headerRightDisabled}
            onPress={() => {
              setNameDraft(name);
              setRenameOpen(true);
            }}
            style={{ padding: 8 }}
          >
            <Ionicons name="pencil" size={18} color="#C07CFF" />
          </Pressable>
          <Pressable disabled={headerRightDisabled} onPress={askDelete} style={{ padding: 8 }}>
            <Ionicons name="trash" size={18} color="#FF7B93" />
          </Pressable>
        </View>
      </View>

      {/* Cover + actions */}
      <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
        <View
          style={{
            height: 180,
            borderRadius: 18,
            overflow: "hidden",
            backgroundColor: CARD,
            borderWidth: 1,
            borderColor: STROKE,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {cover ? (
            <Image source={{ uri: cover }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <Text style={{ color: SUBTLE }}>No cover yet</Text>
          )}
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <ActionBtn
            icon="image-outline"
            label={changingCover ? "Changing..." : "Change cover"}
            onPress={pickFromDevice}
            disabled={changingCover}
          />
          <ActionBtn icon="color-palette-outline" label="Use track artwork" onPress={pickFromTrackArtwork} />
        </View>
      </View>

      {/* Items */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ color: SUBTLE, marginTop: 8 }}>Loading…</Text>
        </View>
      ) : items.length === 0 ? (
        <Text style={{ color: SUBTLE, padding: 16 }}>No songs here yet.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
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
                source={{
                  uri:
                    item.artwork_url ||
                    "https://placehold.co/80x80/1a1f2e/FFFFFF?text=%E2%99%AB",
                }}
                style={{ width: 64, height: 64 }}
              />
              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={{ color: "#fff", fontWeight: "900" }} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={{ color: SUBTLE, fontSize: 12 }} numberOfLines={1}>
                  {item.artist || "Unknown"}
                </Text>
              </View>
              <Pressable
                onPress={async () => {
                  await removeItem(item.id);
                  await load(); // immediate refresh
                }}
                style={{ padding: 12 }}
              >
                <Ionicons name="close" size={18} color="#FF7B93" />
              </Pressable>
            </View>
          )}
        />
      )}

      {/* Rename modal */}
      <Modal
        visible={renameOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
          onPress={() => setRenameOpen(false)}
        />
        <View
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            top: "35%",
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: "#151827",
            padding: 16,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", marginBottom: 8 }}>
            Rename playlist
          </Text>
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            placeholder="Name"
            placeholderTextColor="#778"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "#fff",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
            }}
          />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <DialogBtn title="Cancel" onPress={() => setRenameOpen(false)} />
            <DialogBtn title="Save" filled onPress={doRename} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ActionBtn({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Ionicons name={icon} size={18} color={ACCENT} />
      <Text style={{ color: "#fff", fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );
}

function DialogBtn({
  title,
  onPress,
  filled,
}: {
  title: string;
  onPress: () => void;
  filled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: filled ? ACCENT : "transparent",
        borderWidth: 1,
        borderColor: filled ? "transparent" : "rgba(255,255,255,0.2)",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "800" }}>{title}</Text>
    </Pressable>
  );
}
