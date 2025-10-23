import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";

export default function Onboarding() {
  return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
      <Text style={{ fontSize:24, fontWeight:"700", marginBottom:8 }}>Sonara</Text>
      <Text style={{ textAlign:"center", marginBottom:24, paddingHorizontal:24 }}>
        Discover music by your generation. Free & Premium tiers.
      </Text>
      <Link href="/(auth)/login" asChild>
        <Pressable style={{ backgroundColor:"#000", paddingVertical:12, paddingHorizontal:24, borderRadius:12 }}>
          <Text style={{ color:"#fff" }}>Get Started</Text>
        </Pressable>
      </Link>
    </View>
  );
}
