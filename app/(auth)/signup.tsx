// app/(auth)/signup.tsx
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { supa } from "../../lib/supabase";
import AuthHeader from "../../components/AuthHeader";
import GlassInput from "../../components/GlassInput";
import GradientButton from "../../components/GradientButton";
import Divider from "../../components/Divider";
import SocialButton from "../../components/SocialButton";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
  // …your validation untouched…

  try {
    setLoading(true);

    // 1) Create account
    const { data, error } = await supa.auth.signUp({
      email,
      password: pwd,
      options: { data: { name, birth_year: Number(birthYear) } },
    });
    if (error || !data.user) {
      setLoading(false);
      return Alert.alert("Sign up failed", error?.message ?? "Unknown error");
    }

    // 2) Immediately sign in (ensures we have a session even if email confirmation is on)
    const { error: loginErr } = await supa.auth.signInWithPassword({
      email,
      password: pwd,
    });
    if (loginErr) {
      setLoading(false);
      return Alert.alert("Sign in required", loginErr.message);
    }

    // 3) Go to profile setup
    setLoading(false);
    router.replace("/profile-setup");
  } catch (e: any) {
    setLoading(false);
    Alert.alert("Error", e?.message ?? "Something went wrong");
  }
}


  return (
    <View style={{ flex: 1, backgroundColor: "#0B0E17" }}>
      <AuthHeader title="Create Your Account" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingTop: 28,
            paddingBottom: 32,
          }}
        >
          <View style={{ gap: 14 }}>
            <GlassInput
              icon="person"
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <GlassInput
              icon="calendar"
              placeholder="Birth year (e.g., 2002)"
              keyboardType="numeric"
              value={birthYear}
              onChangeText={setBirthYear}
            />
            <GlassInput
              icon="mail"
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <GlassInput
              icon="lock-closed"
              placeholder="Password"
              secure
              value={pwd}
              onChangeText={setPwd}
            />
            <GlassInput
              icon="lock-closed"
              placeholder="Confirm password"
              secure
              value={confirmPwd}
              onChangeText={setConfirmPwd}
            />
          </View>

          <GradientButton
            title={loading ? "Creating..." : "Sign up"}
            onPress={handleSignup}
            style={{ marginTop: 16 }}
          />

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
