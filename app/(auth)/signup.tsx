import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { supa } from "../../lib/supabase";
import AuthHeader from "../../components/AuthHeader";
import GlassInput from "../../components/GlassInput";
import { LinearGradient } from "expo-linear-gradient";
import { getGeneration } from "../../utils/generation";

function CTA({ title, onPress, disabled=false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <View style={{ borderRadius: 999, overflow: "hidden" }}>
      <LinearGradient colors={["#8E59FF", "#C07CFF"]} start={{x:0,y:0.5}} end={{x:1,y:0.5}}
        style={{ paddingVertical: 16, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color:"#fff", fontWeight:"800" }}>{disabled ? "..." : title}</Text>
      </LinearGradient>
    </View>
  );
}

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [pwd, setPwd] = useState("");
  const [name, setName] = useState(""); const [birthYear, setBirthYear] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email || !pwd || !name || !birthYear) return Alert.alert("Missing info", "Fill all fields.");
    const by = Number(birthYear);
    if (Number.isNaN(by) || by < 1900 || by > new Date().getFullYear()) return Alert.alert("Invalid year", "Enter a valid birth year.");

    setLoading(true);
    const { data, error } = await supa.auth.signUp({ email, password: pwd });
    if (error || !data.user) { setLoading(false); return Alert.alert("Sign up failed", error?.message ?? "Unknown error"); }

    const gen = getGeneration(by);
    const { error: insertErr } = await supa.from("profiles").insert({
      id: data.user.id, display_name: name, birth_year: by, generation: gen,
      genres: [], is_premium: false, block_explicit: false, lock_to_generation: false
    });
    setLoading(false);
    if (insertErr) return Alert.alert("Profile error", insertErr.message);
    router.replace("/(tabs)/home");
  }

  return (
    <View style={{ flex:1, backgroundColor:"#0B0E17" }}>
      <AuthHeader title="Create Your Account" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 28 }}>
          <View style={{ gap: 14 }}>
            <GlassInput icon="person" placeholder="Name" value={name} onChangeText={setName} />
            <GlassInput icon="calendar" placeholder="Birth year (e.g., 2002)" keyboardType="numeric" value={birthYear} onChangeText={setBirthYear} />
            <GlassInput icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <GlassInput icon="lock-closed" placeholder="Password" secureTextEntry value={pwd} onChangeText={setPwd} />
          </View>

          <View style={{ marginTop: 16 }}>
            <CTA title="Sign up" onPress={handleSignup} disabled={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
