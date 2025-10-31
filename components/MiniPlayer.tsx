import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { usePlayer } from "./PlayerContext";

interface MiniPlayerProps {
  onExpand: () => void;
}

export default function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const { track, isPlaying, togglePlayPause, playerExpanded } = usePlayer();

  if (!track || playerExpanded) return null;

  const artwork = track.artworkUri ?? null;

  return (
    <TouchableOpacity style={styles.container} onPress={onExpand} activeOpacity={0.9}>
      {artwork && <Image source={{ uri: artwork }} style={styles.artwork} />}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{track.artist || "Unknown Artist"}</Text>
      </View>
      <TouchableOpacity onPress={() => togglePlayPause()} style={styles.playButton}>
        <Ionicons name={isPlaying ? "pause" : "play"} size={22} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 60,
    left: 16,
    right: 16,
    backgroundColor: "#1C1C1E",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 15,
    zIndex: 100,
  },
  artwork: { width: 50, height: 50, borderRadius: 6, marginRight: 12 },
  info: { flex: 1 },
  title: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  artist: { color: "#A4A8B8", fontSize: 12, marginTop: 2 },
  playButton: { padding: 4 },
});
