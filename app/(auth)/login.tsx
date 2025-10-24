import { View, Text, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { supa } from "../../lib/supabase";
import { theme } from "../../lib/theme";
import AuthHeader from "../../components/AuthHeader";
import Input from "../../components/Input";
import Button from "../../components/Button";

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

      <View style={{ paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.lg }}>
        <View style={{ gap: theme.spacing.md }}>
          <Input placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <Input placeholder="Password" secureTextEntry value={pwd} onChangeText={setPwd} />
        </View>

        <View style={{ marginTop: theme.spacing.lg }}>
          <Button title={loading ? "Signing in..." : "Login"} onPress={handleLogin} disabled={loading} />
        </View>

        <View style={{ alignItems: "center", marginTop: theme.spacing.md }}>
          <Text style={{ color: theme.colors.textSoft }}>
            Don’t have an account?{" "}
            <Link href="/(auth)/signup"><Text style={{ color: theme.colors.primary2 }}>Sign up</Text></Link>
          </Text>
        </View>
      </View>
    </View>
  );
}
