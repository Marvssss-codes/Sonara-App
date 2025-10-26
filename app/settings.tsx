import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Settings() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex:1, backgroundColor:"#0B0E17", paddingTop: insets.top + 12, paddingHorizontal:16 }}>
      <Text style={{ color:"#fff", fontSize:22, fontWeight:"900", marginBottom:8 }}>Settings</Text>
      <Text style={{ color:"#B7BCD3" }}>We’ll flesh this out later.</Text>
    </View>
  );
}
