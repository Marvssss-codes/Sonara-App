// app/profile-setup.tsx
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as FS from "expo-file-system/legacy";
import { decode as decodeBase64 } from "base64-arraybuffer";
import { supa } from "../lib/supabase";
import SafeImage from "../components/SafeImage";

const GENERATIONS = ["Gen Alpha", "Gen Z", "Millennial", "Gen X", "Boomer", "Silent"];
const GENRES = ["Pop", "Hip-Hop/Rap", "R&B/Soul", "Rock", "Jazz", "Electronic", "Classical"];

export default function ProfileSetup() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [generation, setGeneration] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // We keep TWO URIs:
  // - avatarPreviewUri: can be ph://, file:// → safe for display via SafeImage
  // - avatarFileUri: guaranteed file:// path for upload
  const [avatarPreviewUri, setAvatarPreviewUri] = useState<string | null>(null);
  const [avatarFileUri, setAvatarFileUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // Prefill
  useEffect(() => {
    (async () => {
      const { data } = await supa.auth.getSession();
      const uid = data.session?.user?.id;
      if (!uid) {
        Alert.alert("Sign in required", "Please log in again to complete setup.");
        router.replace("/login");
        return;
      }
      const { data: u } = await supa.auth.getUser();
      const meta = u.user?.user_metadata || {};
      const suggested =
        (meta.full_name as string) ||
        (meta.name as string) ||
        (u.user?.email ? u.user.email.split("@")[0] : "") ||
        "";
      if (!displayName) setDisplayName(suggested);
    })();
  }, []);

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  // Convert iOS ph:// asset into a real file:// path for upload
  async function resolveUploadFilePathFromAsset(assetId?: string, fallbackUri?: string) {
    try {
      if (assetId) {
        const perm = await MediaLibrary.requestPermissionsAsync();
        if (!perm.granted) return fallbackUri ?? null;
        const info = await MediaLibrary.getAssetInfoAsync(assetId);
        // localUri can be undefined; if so, copy to cache
        if (info.localUri) return info.localUri;
        if (info.uri) {
          const dest = `${FS.cacheDirectory}avatar-${assetId}.${(info.filename || "jpg").split(".").pop()}`;
          await FS.copyAsync({ from: info.uri, to: dest });
          return dest;
        }
      }
    } catch {}
    return fallbackUri ?? null;
  }

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo access to choose an avatar.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.9,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (res.canceled) return;

    const asset = res.assets[0];
    const previewUri = asset?.uri || null;        // can be ph:// on iOS → fine for preview
    const uploadUri = await resolveUploadFilePathFromAsset(asset?.assetId, asset?.uri); // aim for file://

    setAvatarPreviewUri(previewUri);
    setAvatarFileUri(uploadUri);
  };

  const extAndMime = (uri: string) => {
    const ext = (uri.split(".").pop() || "jpg").toLowerCase();
    const map: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      heic: "image/heic",
      heif: "image/heif",
    };
    return { ext, mime: map[ext] || "application/octet-stream" };
  };

  const saveProfile = async () => {
    if (!displayName || !generation) {
      Alert.alert("Missing info", "Please enter your name and select your generation.");
      return;
    }

    try {
      setLoading(true);

      const { data: session } = await supa.auth.getSession();
      const uid = session.session?.user?.id;
      if (!uid) {
        setLoading(false);
        Alert.alert("Sign in required", "Please log in again to complete setup.");
        router.replace("/login");
        return;
      }

      let avatar_url: string | null = null;

      // Upload using the guaranteed file path
      if (avatarFileUri) {
        try {
          const { ext, mime } = extAndMime(avatarFileUri);
          const fileName = `avatars/${uid}.${ext}`;
          const normalized = avatarFileUri.startsWith("file://") ? avatarFileUri : `file://${avatarFileUri}`;
          const base64 = await FS.readAsStringAsync(normalized, { /* @ts-ignore */ encoding: FS.EncodingType.Base64 });
          const arrayBuffer = decodeBase64(base64);

          const { error: uploadErr } = await supa.storage
            .from("avatars")
            .upload(fileName, arrayBuffer, { upsert: true, contentType: mime });
          if (uploadErr) throw uploadErr;

          const { data: publicUrl } = supa.storage.from("avatars").getPublicUrl(fileName);
          avatar_url = publicUrl.publicUrl;
        } catch (e: any) {
          console.warn("Avatar upload failed:", e?.message || e);
        }
      }

      const { error } = await supa.from("profiles").upsert({
        id: uid,
        display_name: displayName,
        generation,
        favorite_genres: selectedGenres,
        avatar_url,
      });
      if (error) throw error;

      Alert.alert("Profile saved", "Welcome to Sonara!");
      router.replace("/(tabs)/home");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err?.message || "Could not save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0B0E17" }}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 40,
        paddingHorizontal: 20,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 26, fontWeight: "900", marginBottom: 16 }}>
        Complete Your Profile
      </Text>

      {/* Avatar preview (never crashes) */}
      <Pressable
        onPress={pickAvatar}
        style={{
          alignSelf: "center",
          width: 120,
          height: 120,
          borderRadius: 999,
          overflow: "hidden",
          backgroundColor: "rgba(255,255,255,0.1)",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        {avatarPreviewUri ? (
          <SafeImage uri={avatarPreviewUri} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        ) : (
          <Text style={{ color: "#aaa" }}>Pick Avatar</Text>
        )}
      </Pressable>

      <Text style={styles.label}>Display Name</Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your name"
        placeholderTextColor="#777"
        style={styles.input}
      />

      <Text style={[styles.label, { marginTop: 20 }]}>Generation</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {GENERATIONS.map((g) => (
          <Pressable
            key={g}
            onPress={() => setGeneration(g)}
            style={[styles.chip, generation === g && { backgroundColor: "#C07CFF" }]}
          >
            <Text style={{ color: generation === g ? "#fff" : "#ccc", fontWeight: "700" }}>
              {g}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={[styles.label, { marginTop: 20 }]}>Favorite Genres</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {GENRES.map((g) => (
          <Pressable
            key={g}
            onPress={() =>
              setSelectedGenres((prev) =>
                prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
              )
            }
            style={[styles.genreChip, selectedGenres.includes(g) && { backgroundColor: "#8E59FF" }]}
          >
            <Text style={{ color: selectedGenres.includes(g) ? "#fff" : "#ccc", fontWeight: "600" }}>
              {g}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={saveProfile} disabled={loading} style={{ marginTop: 40 }}>
        <LinearGradient
          colors={["#8E59FF", "#C07CFF"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ paddingVertical: 16, borderRadius: 999, alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
            {loading ? "Saving..." : "Save Profile"}
          </Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

const styles = {
  label: { color: "#B7BCD3", fontWeight: "700", marginBottom: 6 },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    marginRight: 8,
  },
  genreChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
} as const;
