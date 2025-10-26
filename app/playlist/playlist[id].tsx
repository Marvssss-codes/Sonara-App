import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PlaylistDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex:1, backgroundColor:"#0B0E17", paddingTop: insets.top + 12, paddingHorizontal:16 }}>
      <Text style={{ color:"#fff", fontSize:22, fontWeight:"900", marginBottom:8 }}>Playlist</Text>
      <Text style={{ color:"#B7BCD3" }}>ID: {id}</Text>
      <Text style={{ color:"#B7BCD3", marginTop:8 }}>We’ll style this screen later.</Text>
    </View>
  );
}
