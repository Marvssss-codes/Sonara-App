import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { supa } from "../../lib/supabase";
import { getGeneration } from "../../utils/generation";
import BackButton from "../../components/BackButton";
// ...
<BackButton />


type Profile = {
  display_name: string | null;
  birth_year: number | null;
  generation: string | null;
  genres: string[] | null;
};

export default function ProfileScreen() {
  const [uid, setUid] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [generation, setGenerationState] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supa.auth.getUser();
      const id = data.user?.id || null;
      setUid(id);
      if (!id) return;

      const { data: prof, error } = await supa
        .from("profiles")
        .select("display_name, birth_year, generation")
        .eq("id", id)
        .single<Profile>();
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
      setDisplayName(prof?.display_name ?? "");
      setBirthYear(prof?.birth_year ? String(prof.birth_year) : "");
      setGenerationState(prof?.generation ?? "");
    })();
  }, []);

  async function handleSave() {
    try {
      if (!uid) return;
      const by = Number(birthYear);
      if (Number.isNaN(by) || by < 1900 || by > new Date().getFullYear()) {
        return Alert.alert("Invalid", "Enter a valid birth year");
      }
      const gen = getGeneration(by);
      setSaving(true);
      const { error } = await supa
        .from("profiles")
        .update({
          display_name: displayName.trim(),
          birth_year: by,
          generation: gen
        })
        .eq("id", uid);
      setSaving(false);
      if (error) return Alert.alert("Error", error.message);
      setGenerationState(gen);
      Alert.alert("Saved", "Profile updated");
    } catch (e: any) {
      setSaving(false);
      Alert.alert("Error", e?.message ?? "Could not save");
    }
  }

  return (
    <View style={{ flex: 1, paddingTop: 32, paddingHorizontal: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Profile</Text>

      <Text style={{ marginTop: 8 }}>Display name</Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
      />

      <Text style={{ marginTop: 8 }}>Birth year</Text>
      <TextInput
        value={birthYear}
        onChangeText={setBirthYear}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
      />

      <Text style={{ color: "#666" }}>Generation: {generation || "—"}</Text>

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={{ marginTop: 12, backgroundColor: "#000", paddingVertical: 12, borderRadius: 12 }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>{saving ? "Saving..." : "Save changes"}</Text>
      </Pressable>
    </View>
  );
}
