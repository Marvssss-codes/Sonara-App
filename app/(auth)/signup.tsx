import { View, Text, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  function handleSignup() {
    // We'll wire real auth later; for now, just go to home
    router.replace("/(tabs)/home");
  }

  return (
    <View style={{ flex:1, gap:12, alignItems:"center", justifyContent:"center", paddingHorizontal:16 }}>
      <Text style={{ fontSize:22, fontWeight:"700" }}>Create account</Text>
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
      <Pressable onPress={handleSignup} style={{ width:"100%", backgroundColor:"#000", paddingVertical:12, borderRadius:12 }}>
        <Text style={{ color:"#fff", textAlign:"center" }}>Sign up (stub)</Text>
      </Pressable>
    </View>
  );
}
