import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { supa } from "../../lib/supabase";
import AuthHeader from "../../components/AuthHeader";
import GlassInput from "../../components/GlassInput";
import GradientButton from "../../components/GradientButton";
import Divider from "../../components/Divider";
import SocialButton from "../../components/SocialButton";
import { getGeneration } from "../../utils/generation";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email || !pwd || !confirmPwd || !name || !birthYear)
      return Alert.alert("Missing info", "Fill all fields.");
    if (pwd.length < 6) return Alert.alert("Weak password", "Use at least 6 characters.");
    if (pwd !== confirmPwd) return Alert.alert("Password mismatch", "Passwords do not match.");
    const by = Number(birthYear);
    if (Number.isNaN(by) || by < 1900 || by > new Date().getFullYear())
      return Alert.alert("Invalid year", "Enter a valid birth year.");

    try {
      setLoading(true);
      const { data, error } = await supa.auth.signUp({ email, password: pwd });
      if (error || !data.user) {
        setLoading(false);
        return Alert.alert("Sign up failed", error?.message ?? "Unknown error");
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
        lock_to_generation: false,
      });
      setLoading(false);
      if (insertErr) return Alert.alert("Profile error", insertErr.message);
      router.replace("/home");
    } catch (e: any) {
      setLoading(false);
      Alert.alert("Error", e?.message ?? "Something went wrong");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0E17" }}>
      <AuthHeader title="Create Your Account" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 28, paddingBottom: 32 }}>
          <View style={{ gap: 14 }}>
            <GlassInput icon="person" placeholder="Name" value={name} onChangeText={setName} />
            <GlassInput icon="calendar" placeholder="Birth year (e.g., 2002)" keyboardType="numeric" value={birthYear} onChangeText={setBirthYear} />
            <GlassInput icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <GlassInput icon="lock-closed" placeholder="Password" secureTextEntry value={pwd} onChangeText={setPwd} />
            <GlassInput icon="lock-closed" placeholder="Confirm password" secureTextEntry value={confirmPwd} onChangeText={setConfirmPwd} />
          </View>

          <GradientButton title={loading ? "Creating..." : "Sign up"} onPress={handleSignup} style={{ marginTop: 16 }} />

          <Divider text="OR" />

          <View style={{ gap: 10 }}>
            <SocialButton kind="google" onPress={() => { /* TODO */ }} />
            <SocialButton kind="apple" onPress={() => { /* TODO */ }} />
          </View>

          <View style={{ alignItems: "center", marginTop: 18 }}>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
              By signing up you agree to our Terms & Privacy Policy.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
