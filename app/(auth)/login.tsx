import { View, Text, TextInput, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  function handleLogin() {
    // We'll wire real auth later; for now, just navigate
    router.replace("/(tabs)/home");
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
      <Pressable onPress={handleLogin} style={{ width:"100%", backgroundColor:"#000", paddingVertical:12, borderRadius:12 }}>
        <Text style={{ color:"#fff", textAlign:"center" }}>Log in (stub)</Text>
      </Pressable>
      <Link href="/(auth)/signup"><Text>No account? Sign up</Text></Link>
    </View>
  );
}
