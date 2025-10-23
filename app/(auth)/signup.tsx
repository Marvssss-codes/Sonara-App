import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { supa } from "../../lib/supabase";
import { getGeneration } from "../../utils/generation";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    try {
      if (!email || !pwd || !name || !birthYear) {
        Alert.alert("Missing info", "Please fill all fields.");
        return;
      }
      const by = Number(birthYear);
      if (Number.isNaN(by) || by < 1900 || by > new Date().getFullYear()) {
        Alert.alert("Invalid year", "Please enter a valid birth year.");
        return;
      }

      setLoading(true);
      const { data, error } = await supa.auth.signUp({ email, password: pwd });
      if (error || !data.user) {
        Alert.alert("Sign up failed", error?.message ?? "Unknown error");
        setLoading(false);
        return;
      }

      const gen = getGeneration(by);
      const { error: insertErr } = await supa.from("profiles").insert({
        id: data.user.id,
        display_name: name,
        birth_year: by,
        generation: gen,
        genres: [],
        is_premium: false,
        block_explicit: false,
        lock_to_generation: false
      });

      if (insertErr) {
        Alert.alert("Profile create failed", insertErr.message);
        setLoading(false);
        return;
      }

      // Go to home
      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex:1, gap:12, alignItems:"center", justifyContent:"center", paddingHorizontal:16 }}>
      <Text style={{ fontSize:22, fontWeight:"700" }}>Create account</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ width:"100%", borderWidth:1, borderRadius:12, paddingHorizontal:12, paddingVertical:10 }}
      />

      <TextInput
        placeholder="Birth year (e.g., 2002)"
        keyboardType="numeric"
        value={birthYear}
        onChangeText={setBirthYear}
        style={{ width:"100%", borderWidth:1, borderRadius:12, paddingHorizontal:12, paddingVertical:10 }}
      />

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{ width:"100%", borderWidth:1, borderRadius:12, paddingHorizontal:12, paddingVertical:10 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={pwd}
        onChangeText={setPwd}
        style={{ width:"100%", borderWidth:1, borderRadius:12, paddingHorizontal:12, paddingVertical:10 }}
      />

      <Pressable
        onPress={handleSignup}
        disabled={loading}
        style={{ width:"100%", backgroundColor: loading ? "#555" : "#000", paddingVertical:12, borderRadius:12 }}
      >
        <Text style={{ color:"#fff", textAlign:"center" }}>{loading ? "Creating..." : "Sign up"}</Text>
      </Pressable>
    </View>
  );
}
