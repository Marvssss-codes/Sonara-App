// app/(tabs)/profile.tsx
import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FS from "expo-file-system/legacy";
import { decode as decodeBase64 } from "base64-arraybuffer";
import { supa } from "../../lib/supabase";
import SafeImage from "../../components/SafeImage";

const BG = "#0B0E17";
const CARD = "rgba(255,255,255,0.06)";
const STROKE = "rgba(255,255,255,0.12)";
const SUBTLE = "#B7BCD3";
const ACCENT = "#8E59FF";
const ACCENT_2 = "#C07CFF";

const GENERATIONS = ["Gen Alpha", "Gen Z", "Millennial", "Gen X", "Boomer", "Silent"] as const;
const GENRES = ["Pop", "Hip-Hop/Rap", "R&B/Soul", "Rock", "Jazz", "Electronic", "Classical"];

type ProfileRow = {
  id: string;
  display_name: string | null;
  generation: string | null;
  favorite_genres: string[] | null;
  avatar_url: string | null;
  block_explicit?: boolean | null;
  lock_to_generation?: boolean | null;
  is_premium?: boolean | null;
};

export default function Profile() {
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uid, setUid] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [generation, setGeneration] = useState<string>("");
  const [genres, setGenres] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);

  const [blockExplicit, setBlockExplicit] = useState(false);
  const [lockToGen, setLockToGen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const initials = useMemo(() => {
    if (!displayName?.trim()) return "👤";
    const p = displayName.trim().split(/\s+/);
    if (p.length === 1) return p[0][0]?.toUpperCase();
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  }, [displayName]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: s } = await supa.auth.getSession();
      const id = s.session?.user?.id || null;
      setUid(id);
      if (!id) {
        Alert.alert("Not signed in", "Please log in again.");
        return;
      }
      const { data, error } = await supa
        .from("profiles")
        .select("display_name,generation,favorite_genres,avatar_url,block_explicit,lock_to_generation,is_premium")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      const row = (data || {}) as ProfileRow;
      setDisplayName(row.display_name || "");
      setGeneration(row.generation || "");
      setGenres(Array.isArray(row.favorite_genres) ? row.favorite_genres : []);
      setAvatar(row.avatar_url || null);
      setBlockExplicit(!!row.block_explicit);
      setLockToGen(!!row.lock_to_generation);
      setIsPremium(!!row.is_premium);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleGenre = (g: string) => {
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const changeAvatar = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (res.canceled || !uid) return;
      const uri = res.assets[0]?.uri;
      if (!uri) return;

      // upload → supabase storage (avatars)
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
      const normalized = uri.startsWith("file://") ? uri : `file://${uri}`;
      const base64 = await FS.readAsStringAsync(normalized, { /* @ts-ignore */ encoding: FS.EncodingType.Base64 });
      const buf = decodeBase64(base64);
      const path = `avatars/${uid}.${ext}`;

      const { error: upErr } = await supa.storage.from("avatars").upload(path, buf, {
        upsert: true,
        contentType: mime,
      });
      if (upErr) throw upErr;
      const { data: pub } = supa.storage.from("avatars").getPublicUrl(path);
      setAvatar(pub.publicUrl);
    } catch (e: any) {
      Alert.alert("Avatar error", e?.message ?? "Could not change avatar.");
    }
  };

  const save = async () => {
    if (!uid) return;
    if (!displayName.trim()) return Alert.alert("Missing name", "Please enter a display name.");

    try {
      setSaving(true);
      const { error } = await supa.from("profiles").upsert({
        id: uid,
        display_name: displayName.trim(),
        generation: generation || null,
        favorite_genres: genres,
        avatar_url: avatar,
        block_explicit: blockExplicit,
        lock_to_generation: lockToGen,
        is_premium: isPremium,
      });
      if (error) throw error;
      Alert.alert("Saved", "Your profile has been updated.");
    } catch (e: any) {
      Alert.alert("Save error", e?.message ?? "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    try {
      await supa.auth.signOut();
    } catch {}
    Alert.alert("Signed out", "You have been signed out.");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={{
        paddingTop: insets.top + 10,
        paddingBottom: insets.bottom + 28,
        paddingHorizontal: 16,
      }}
    >
      {/* Header */}
      <View style={{ marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: "#fff", fontSize: 26, fontWeight: "900" }}>Profile</Text>
        <Pressable
          onPress={logout}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.08)",
            borderWidth: 1,
            borderColor: STROKE,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>Log out</Text>
        </Pressable>
      </View>

      {/* Avatar + name */}
      <View
        style={{
          borderRadius: 16,
          backgroundColor: CARD,
          borderWidth: 1,
          borderColor: STROKE,
          padding: 14,
          marginBottom: 14,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 999,
              overflow: "hidden",
              backgroundColor: "rgba(255,255,255,0.08)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {avatar ? (
              <SafeImage uri={avatar} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            ) : (
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900" }}>{initials}</Text>
            )}
          </View>

          <Pressable
            onPress={changeAvatar}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: ACCENT,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Ionicons name="image-outline" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "900" }}>Change avatar</Text>
          </Pressable>
        </View>

        <Text style={{ color: SUBTLE, fontWeight: "700", marginTop: 14, marginBottom: 6 }}>Display Name</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your name"
          placeholderTextColor="#778"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            color: "#fff",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: STROKE,
          }}
        />
      </View>

      {/* Generation */}
      <View
        style={{
          borderRadius: 16,
          backgroundColor: CARD,
          borderWidth: 1,
          borderColor: STROKE,
          padding: 14,
          marginBottom: 14,
        }}
      >
        <Text style={{ color: SUBTLE, fontWeight: "700", marginBottom: 8 }}>Generation</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {GENERATIONS.map((g) => {
            const active = generation === g;
            return (
              <Pressable
                key={g}
                onPress={() => setGeneration(g)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: active ? ACCENT_2 : "transparent",
                  borderWidth: 1,
                  borderColor: active ? "transparent" : STROKE,
                }}
              >
                <Text style={{ color: active ? "#fff" : "#E0E4F0", fontWeight: "800" }}>{g}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Favorite genres */}
      <View
        style={{
          borderRadius: 16,
          backgroundColor: CARD,
          borderWidth: 1,
          borderColor: STROKE,
          padding: 14,
          marginBottom: 14,
        }}
      >
        <Text style={{ color: SUBTLE, fontWeight: "700", marginBottom: 8 }}>Favorite Genres</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {GENRES.map((g) => {
            const active = genres.includes(g);
            return (
              <Pressable
                key={g}
                onPress={() => toggleGenre(g)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: active ? ACCENT : "transparent",
                  borderWidth: 1,
                  borderColor: active ? "transparent" : STROKE,
                }}
              >
                <Text style={{ color: active ? "#fff" : "#E0E4F0", fontWeight: "800" }}>{g}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* App preferences */}
      <View
        style={{
          borderRadius: 16,
          backgroundColor: CARD,
          borderWidth: 1,
          borderColor: STROKE,
          padding: 14,
          marginBottom: 14,
          gap: 12,
        }}
      >
        <RowToggle
          label="Block explicit content"
          value={blockExplicit}
          onValueChange={setBlockExplicit}
        />
        <RowToggle
          label="Lock recommendations to my generation"
          value={lockToGen}
          onValueChange={setLockToGen}
        />
        <RowInfo label="Premium" right={isPremium ? "Active" : "Free"} />
      </View>

      {/* Parental controls – coming soon */}
      <View
        style={{
          borderRadius: 16,
          backgroundColor: CARD,
          borderWidth: 1,
          borderColor: STROKE,
          padding: 14,
          marginBottom: 14,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "900", marginBottom: 4 }}>Parental Controls</Text>
        <Text style={{ color: SUBTLE, marginBottom: 8 }}>
          Manage content restrictions and passcode. (Coming soon)
        </Text>
        <View style={{ opacity: 0.6 }}>
          <RowToggle label="Require passcode for explicit content" value={false} onValueChange={() => {}} disabled />
          <RowToggle label="Daily time limit" value={false} onValueChange={() => {}} disabled />
        </View>
      </View>

      {/* Save */}
      <Pressable
        onPress={save}
        disabled={saving || loading}
        style={{
          paddingVertical: 14,
          borderRadius: 14,
          backgroundColor: saving || loading ? "rgba(255,255,255,0.1)" : ACCENT,
          alignItems: "center",
        }}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "900" }}>Save changes</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function RowToggle({
  label,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 6,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "800", flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} disabled={disabled} />
    </View>
  );
}

function RowInfo({ label, right }: { label: string; right?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 }}>
      <Text style={{ color: "#fff", fontWeight: "800" }}>{label}</Text>
      {!!right && <Text style={{ color: SUBTLE }}>{right}</Text>}
    </View>
  );
}
