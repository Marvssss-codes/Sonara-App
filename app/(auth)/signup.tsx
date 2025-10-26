// app/(auth)/signup.tsx
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { supa } from "../../lib/supabase";
import { theme } from "../../lib/theme";
import AuthHeader from "../../components/AuthHeader";
import GlassInput from "../../components/GlassInput";
import GradientButton from "../../components/GradientButton";
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
    } catch (e: any) {
      setLoading(false);
      Alert.alert("Error", e?.message ?? "Something went wrong");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <AuthHeader title="Create Your Account" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
          <GlassInput icon="person" placeholder="Name" value={name} onChangeText={setName} />
          <GlassInput icon="calendar" placeholder="Birth year (e.g., 2002)" keyboardType="numeric" value={birthYear} onChangeText={setBirthYear} />
          <GlassInput icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <GlassInput icon="lock-closed" placeholder="Password" secureTextEntry value={pwd} onChangeText={setPwd} />
          <GradientButton title={loading ? "Creating..." : "Sign up"} onPress={handleSignup} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
