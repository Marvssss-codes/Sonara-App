import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { supa } from "../../lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If the user already has a session, jump to home
    (async () => {
      const { data } = await supa.auth.getSession();
      if (data.session?.user) {
        router.replace("/(tabs)/home");
      }
    })();
  }, []);

  async function handleLogin() {
    try {
      if (!email || !pwd) {
        Alert.alert("Missing info", "Enter your email and password.");
        return;
      }
      setLoading(true);
      const { error } = await supa.auth.signInWithPassword({ email, password: pwd });
      if (error) {
        Alert.alert("Login failed", error.message);
        setLoading(false);
        return;
      }
      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex:1, gap:12, alignItems:"center", justifyContent:"center", paddingHorizontal:16 }}>
      <Text style={{ fontSize:22, fontWeight:"700" }}>Welcome back</Text>

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
        onPress={handleLogin}
        disabled={loading}
        style={{ width:"100%", backgroundColor: loading ? "#555" : "#000", paddingVertical:12, borderRadius:12 }}
      >
        <Text style={{ color:"#fff", textAlign:"center" }}>{loading ? "Signing in..." : "Log in"}</Text>
      </Pressable>

      <Link href="/(auth)/signup"><Text>No account? Sign up</Text></Link>
    </View>
  );
}
