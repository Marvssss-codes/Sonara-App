import { View, Text, Pressable, Alert } from "react-native";
import { supa } from "../../lib/supabase";
import { useRouter } from "expo-router";

export default function Library() {
  const router = useRouter();

  async function handleLogout() {
    const { error } = await supa.auth.signOut();
    if (error) {
      Alert.alert("Logout failed", error.message);
      return;
    }
    router.replace("/(auth)/login");
  }

  return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center", gap:16 }}>
      <Text style={{ fontSize:18, fontWeight:"600" }}>Library</Text>
      <Pressable onPress={handleLogout} style={{ backgroundColor:"#000", paddingVertical:12, paddingHorizontal:16, borderRadius:12 }}>
        <Text style={{ color:"#fff" }}>Log out</Text>
      </Pressable>
    </View>
  );
}
