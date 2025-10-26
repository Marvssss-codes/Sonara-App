import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { supa } from "../../lib/supabase";
import AuthHeader from "../../components/AuthHeader";
import GlassInput from "../../components/GlassInput";
import { LinearGradient } from "expo-linear-gradient";

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

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [pwd, setPwd] = useState(""); const [loading, setLoading] = useState(false);

  useEffect(() => { (async () => {
    const { data } = await supa.auth.getSession();
    if (data.session?.user) router.replace("/(tabs)/home");
  })(); }, []);

  async function handleLogin() {
    if (!email || !pwd) return Alert.alert("Missing info", "Enter email & password.");
    setLoading(true);
    const { error } = await supa.auth.signInWithPassword({ email, password: pwd });
    setLoading(false);
    if (error) return Alert.alert("Login failed", error.message);
    router.replace("/(tabs)/home");
  }

  return (
    <View style={{ flex:1, backgroundColor:"#0B0E17" }}>
      <AuthHeader title="Login To Your Account" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 28 }}>
          <View style={{ gap: 14 }}>
            <GlassInput icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <GlassInput icon="lock-closed" placeholder="Password" secureTextEntry value={pwd} onChangeText={setPwd} />
          </View>

          <View style={{ alignItems:"flex-end", marginTop: 10 }}>
            <Link href="/(auth)/forgot"><Text style={{ color:"#C07CFF" }}>Forgot Password?</Text></Link>
          </View>

          <View style={{ marginTop: 16 }}>
            <CTA title="Login" onPress={handleLogin} disabled={loading} />
          </View>

          <View style={{ alignItems:"center", marginTop: 18 }}>
            <Text style={{ color:"#B7BCD3" }}>
              Don’t have an account? <Link href="/(auth)/signup"><Text style={{ color:"#C07CFF", fontWeight:"700" }}>Sign up</Text></Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
