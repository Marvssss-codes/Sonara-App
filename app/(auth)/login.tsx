import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { supa } from "../../lib/supabase";
import AuthHeader from "../../components/AuthHeader";
import GlassInput from "../../components/GlassInput";
import GradientButton from "../../components/GradientButton";
import Divider from "../../components/Divider";
import SocialButton from "../../components/SocialButton";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supa.auth.getSession();
      if (data.session?.user) router.replace("/home");
    })();
  }, []);

  function comingSoon(what: string) {
    Alert.alert(
      `${what} — coming soon`,
      "We’re putting the final touches on this. For now, please continue with email and password."
    );
  }

  async function handleLogin() {
    if (!email || !pwd) return Alert.alert("Missing info", "Enter email & password.");
    try {
      setLoading(true);
      const { error } = await supa.auth.signInWithPassword({ email, password: pwd });
      setLoading(false);
      if (error) return Alert.alert("Login failed", error.message);
      router.replace("/home");
    } catch (e: any) {
      setLoading(false);
      Alert.alert("Error", e?.message ?? "Something went wrong");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0E17" }}>
      <AuthHeader title="Login To Your Account" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 28, paddingBottom: 32 }}>
          <View style={{ gap: 14 }}>
            <GlassInput icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <GlassInput icon="lock-closed" placeholder="Password" secure value={pwd} onChangeText={setPwd} />
          </View>

          <View style={{ alignItems: "flex-end", marginTop: 10 }}>
            <Link href="/forgot"><Text style={{ color: "#FF7B93", fontWeight: "700" }}>Forgot Password?</Text></Link>
          </View>

          <GradientButton title={loading ? "Signing in..." : "Login"} onPress={handleLogin} style={{ marginTop: 16 }} />

          <Divider text="OR" />

          <View style={{ gap: 10 }}>
            <SocialButton kind="google" onPress={() => comingSoon("Sign in with Google")} />
            <SocialButton kind="apple" onPress={() => comingSoon("Sign in with Apple")} />
          </View>

          <View style={{ alignItems: "center", marginTop: 18 }}>
            <Text style={{ color: "#B7BCD3" }}>
              Don’t have an account?{" "}
              <Link href="/signup"><Text style={{ color: "#C07CFF", fontWeight: "800" }}>Sign up</Text></Link>
            </Text>
          </View>

          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>By continuing, you agree to our Terms & Privacy.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
