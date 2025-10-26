// app/(auth)/login.tsx
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { supa } from "../../lib/supabase";
import { theme } from "../../lib/theme";
import AuthHeader from "../../components/AuthHeader";
import GlassInput from "../../components/GlassInput";
import GradientButton from "../../components/GradientButton";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supa.auth.getSession();
      if (data.session?.user) router.replace("/(tabs)/home");
    })();
  }, []);

  async function handleLogin() {
    try {
      if (!email || !pwd) return Alert.alert("Missing info", "Enter email & password.");
      setLoading(true);
      const { error } = await supa.auth.signInWithPassword({ email, password: pwd });
      setLoading(false);
      if (error) return Alert.alert("Login failed", error.message);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      setLoading(false);
      Alert.alert("Error", e?.message ?? "Something went wrong");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <AuthHeader title="Login To Your Account" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
          <GlassInput icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <GlassInput icon="lock-closed" placeholder="Password" secureTextEntry value={pwd} onChangeText={setPwd} />
          <GradientButton title={loading ? "Signing in..." : "Login"} onPress={handleLogin} />
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <Text style={{ color: theme.colors.textSoft, marginBottom: 8 }}>
              <Link href="/(auth)/forgot"><Text style={{ color: theme.colors.primary2 }}>Forgot password?</Text></Link>
            </Text>
            <Text style={{ color: theme.colors.textSoft }}>
              Don’t have an account?{" "}
              <Link href="/(auth)/signup"><Text style={{ color: theme.colors.primary2, fontWeight: "700" }}>Sign up</Text></Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
