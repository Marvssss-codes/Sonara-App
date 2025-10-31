// app/playlist/[id].tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, Alert, TextInput, Modal, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as FS from "expo-file-system/legacy";
import { decode as decodeBase64 } from "base64-arraybuffer";
import { supa } from "../../lib/supabase";
import {
  getPlaylistItems,
  removeItem,
  renamePlaylist,
  deletePlaylist,
  getPlaylistMeta,
  updatePlaylistCover,
} from "../../lib/db.playlists";
import SafeImage from "../../components/SafeImage";
import { usePlayback } from "../../contexts/PlaybackContext";
import { streamUrlFor as _streamUrlFor } from "../../lib/audius";

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

// Safe resolver
const resolveStreamUrl = (id: string) => {
  try {
    const fn = _streamUrlFor as unknown as (x: string) => string;
    if (typeof fn === "function") return String(fn(id));
  } catch {}
  return `https://discoveryprovider.audius.co/v1/tracks/${id}/stream?app_name=sonara`;
};

export default function PlaylistDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pb = usePlayback();

  const [name, setName] = useState("Playlist");
  const [cover, setCover] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [renameOpen, setRenameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [changingCover, setChangingCover] = useState(false);

  const headerRightDisabled = useMemo(() => loading, [loading]);

  const load = async () => {
    setLoading(true);
    try {
      const meta = await getPlaylistMeta(String(id));
      setName(meta.name);
      setCover(meta.cover_url ?? null);
      const list = await getPlaylistItems(String(id));
      setItems(list as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) load(); }, [id]);

  // Playback queue
  const playable = useMemo(
    () =>
      items.map((it) => ({
        id: it.track_id,
        title: it.title,
        artist: it.artist || "Unknown",
        artwork: it.artwork_url || null,
        streamUrl: resolveStreamUrl(it.track_id),
      })),
    [items]
  );

  const askDelete = () => {
    Alert.alert("Delete playlist?", "This will remove all items.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deletePlaylist(String(id)); router.back(); } },
    ]);
  };

  const doRename = async () => {
    if (!nameDraft.trim()) return setRenameOpen(false);
    await renamePlaylist(String(id), nameDraft.trim());
    setName(nameDraft.trim());
    setRenameOpen(false);
  };

  async function resolveUploadFilePathFromAsset(assetId?: string, fallbackUri?: string) {
    try {
      if (assetId) {
        const perm = await MediaLibrary.requestPermissionsAsync();
        if (!perm.granted) return fallbackUri ?? null;
        const info = await MediaLibrary.getAssetInfoAsync(assetId);
        if (info.localUri) return info.localUri;
        if (info.uri) {
          const dest = `${FS.cacheDirectory}pl-cover-${assetId}.${(info.filename || "jpg").split(".").pop()}`;
          await FS.copyAsync({ from: info.uri, to: dest });
          return dest;
        }
      }
    } catch {}
    return fallbackUri ?? null;
  }

  const pickFromDevice = async () => {
    setChangingCover(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return Alert.alert("Permission needed", "Allow photo access to change cover.");
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.9 });
      if (res.canceled) return;
      const asset = res.assets[0];
      const uploadUri = await resolveUploadFilePathFromAsset(asset?.assetId, asset?.uri);
      if (!uploadUri) throw new Error("Invalid image URI");
      await uploadCover(uploadUri);
    } catch (e: any) {
      Alert.alert("Cover error", e?.message ?? "Could not change cover.");
    } finally {
      setChangingCover(false);
    }
  };

  const pickFromTrackArtwork = async () => {
    if (items.length === 0) return Alert.alert("No items", "Add at least one song first.");
    const withArt = items.find(i => !!i.artwork_url) || items[0];
    if (!withArt.artwork_url) return Alert.alert("No artwork", "None of the tracks have artwork to use.");
    await updatePlaylistCover(String(id), withArt.artwork_url);
    setCover(withArt.artwork_url);
    Alert.alert("Done", "Cover set from a track artwork.");
  };

  const uploadCover = async (uri: string) => {
    const ext = (uri.split(".").pop() || "jpg").toLowerCase();
    const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "heic" ? "image/heic" : ext === "heif" ? "image/heif" : "image/jpeg";
    const normalized = uri.startsWith("file://") ? uri : `file://${uri}`;
    const base64 = await FS.readAsStringAsync(normalized, { /* @ts-ignore */ encoding: FS.EncodingType.Base64 });
    const arrayBuffer = decodeBase64(base64);
    const filename = `covers/${id}.${ext}`;
    const { error: upErr } = await supa.storage.from("playlist-covers").upload(filename, arrayBuffer, { upsert: true, contentType: mime });
    if (upErr) throw upErr;
    const { data: publicUrl } = supa.storage.from("playlist-covers").getPublicUrl(filename);
    await updatePlaylistCover(String(id), publicUrl.publicUrl);
    setCover(publicUrl.publicUrl);
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top + 12 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }} numberOfLines={1}>{name}</Text>
        <View style={{ flexDirection: "row", gap: 6, opacity: headerRightDisabled ? 0.6 : 1 }}>
          <Pressable disabled={headerRightDisabled} onPress={() => { setNameDraft(name); setRenameOpen(true); }} style={{ padding: 8 }}>
            <Ionicons name="pencil" size={18} color="#C07CFF" />
          </Pressable>
          <Pressable disabled={headerRightDisabled} onPress={askDelete} style={{ padding: 8 }}>
            <Ionicons name="trash" size={18} color="#FF7B93" />
          </Pressable>
        </View>
      </View>

      {/* Cover + actions */}
      <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
        <View style={{ height: 180, borderRadius: 18, overflow: "hidden", backgroundColor: CARD, borderWidth: 1, borderColor: STROKE, alignItems: "center", justifyContent: "center" }}>
          {cover ? <SafeImage uri={cover} style={{ width: "100%", height: "100%" }} contentFit="cover" /> : <Text style={{ color: SUBTLE }}>No cover yet</Text>}
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <ActionBtn icon="image-outline" label={changingCover ? "Changing..." : "Change cover"} onPress={pickFromDevice} disabled={changingCover} />
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
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => pb.playFromList(playable, index, true)}
              style={{
                flexDirection: "row", alignItems: "center",
                borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden"
              }}
            >
              <SafeImage uri={item.artwork_url ?? null} style={{ width: 64, height: 64 }} contentFit="cover" />
              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={{ color: "#fff", fontWeight: "900" }} numberOfLines={1}>{item.title}</Text>
                <Text style={{ color: SUBTLE, fontSize: 12 }} numberOfLines={1}>{item.artist || "Unknown"}</Text>
              </View>
              <Pressable onPress={async () => { await removeItem(item.id); await load(); }} style={{ padding: 12 }}>
                <Ionicons name="close" size={18} color="#FF7B93" />
              </Pressable>
            </Pressable>
          )}
        />
      )}

      {/* Rename modal */}
      <Modal visible={renameOpen} transparent animationType="fade" onRequestClose={() => setRenameOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={() => setRenameOpen(false)} />
        <View style={{ position: "absolute", left: 16, right: 16, top: "35%", borderRadius: 16, overflow: "hidden", backgroundColor: "#151827", padding: 16 }}>
          <Text style={{ color: "#fff", fontWeight: "900", marginBottom: 8 }}>Rename playlist</Text>
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            placeholder="Name"
            placeholderTextColor="#778"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }}
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

function ActionBtn({ icon, label, onPress, disabled }: { icon: any; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={{
      flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
      paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
      opacity: disabled ? 0.6 : 1
    }}>
      <Ionicons name={icon} size={18} color={ACCENT} />
      <Text style={{ color: "#fff", fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );
}
function DialogBtn({ title, onPress, filled }: { title: string; onPress: () => void; filled?: boolean }) {
  return (
    <Pressable onPress={onPress} style={{
      flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 12,
      backgroundColor: filled ? ACCENT : "transparent", borderWidth: 1,
      borderColor: filled ? "transparent" : "rgba(255,255,255,0.2)"
    }}>
      <Text style={{ color: "#fff", fontWeight: "800" }}>{title}</Text>
    </Pressable>
  );
}
