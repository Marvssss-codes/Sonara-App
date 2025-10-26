import { View, Image, Text, Pressable, ViewStyle } from "react-native";
import { AudiusTrack } from "../lib/audius";

export default function SongCard({
  track, onPress, style
}: { track: AudiusTrack; onPress?: () => void; style?: ViewStyle }) {
  const art =
    track.artwork?.["480x480"] ||
    track.artwork?.["150x150"] ||
    "https://placehold.co/480x480/111/FFF.png?text=Artwork";

  return (
    <Pressable onPress={onPress} style={[{ width: 160 }, style]}>
      <View
        style={{
          width: 160,
          height: 160,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: "#131A2C",
        }}
      >
        <Image source={{ uri: art }} style={{ width: "100%", height: "100%" }} />
      </View>
      <Text
        numberOfLines={1}
        style={{ color: "#fff", marginTop: 8, fontWeight: "800" }}
      >
        {track.title}
      </Text>
      <Text numberOfLines={1} style={{ color: "#B7BCD3", marginTop: 2 }}>
        {track.user?.name || track.user?.handle}
      </Text>
    </Pressable>
  );
}
