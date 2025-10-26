// app/profile-setup.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { supa } from "../lib/supabase";

const GENERATIONS = ["Gen Alpha", "Gen Z", "Millennial", "Gen X", "Boomer", "Silent"];
const GENRES = ["Pop", "Hip-Hop/Rap", "R&B/Soul", "Rock", "Jazz", "Electronic", "Classical"];

export default function ProfileSetup() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [generation, setGeneration] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Ensure session & prefill name
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
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo access to choose an avatar.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!res.canceled) setAvatar(res.assets[0].uri); // file:// or content://
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

      // Guard session
      const { data: session } = await supa.auth.getSession();
      const uid = session.session?.user?.id;
      if (!uid) {
        setLoading(false);
        Alert.alert("Sign in required", "Please log in again to complete setup.");
        router.replace("/login");
        return;
      }

      // Upload avatar (safe path: FileSystem -> base64 -> ArrayBuffer)
      let avatar_url: string | null = null;
      if (avatar) {
        try {
          const { ext, mime } = extAndMime(avatar);
          const fileName = `avatars/${uid}.${ext}`;

          // NOTE: use literal "base64" (EncodingType may be undefined on some SDKs)
          const base64 = await FileSystem.readAsStringAsync(avatar, {
            // @ts-ignore - RN accepts string literal
            encoding: "base64",
          });
          const arrayBuffer = decode(base64);

          const { error: uploadErr } = await supa.storage
            .from("avatars")
            .upload(fileName, arrayBuffer, { upsert: true, contentType: mime });
          if (uploadErr) throw uploadErr;

          const { data: publicUrl } = supa.storage.from("avatars").getPublicUrl(fileName);
          avatar_url = publicUrl.publicUrl;
        } catch (e: any) {
          // If avatar upload fails, continue with profile save (don’t block)
          console.warn("Avatar upload failed:", e?.message || e);
        }
      }

      // Upsert profile
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
        {avatar ? (
          <Image source={{ uri: avatar }} style={{ width: "100%", height: "100%" }} />
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
            style={[
              styles.genreChip,
              selectedGenres.includes(g) && { backgroundColor: "#8E59FF" },
            ]}
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
