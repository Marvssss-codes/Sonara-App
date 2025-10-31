import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Image, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { usePlayer } from "./PlayerContext";

export default function FullPlayer() {
  const { track, isPlaying, togglePlayPause, nextTrack, previousTrack, positionMs, durationMs, seekTo, playerExpanded, setPlayerExpanded } = usePlayer();
  const [barWidth, setBarWidth] = useState(1);
  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  const translateY = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get("window").height;

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10,
    onPanResponderMove: (_, g) => {
      if (g.dy > 0) translateY.setValue(g.dy);
    },
    onPanResponderRelease: (_, g) => {
      if (g.dy > 100 || g.vy > 1.2) {
        Animated.timing(translateY, { toValue: screenHeight, duration: 180, useNativeDriver: true }).start(() => {
          translateY.setValue(0);
          setPlayerExpanded(false);
        });
      } else {
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  }), [screenHeight]);

  if (!track || !playerExpanded) return null;

  const onSeekPress = (e: any) => {
    const x = e.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, x / barWidth));
    seekTo(Math.floor(ratio * (durationMs || 0)));
  };

  return (
    <Animated.View style={[styles.overlay, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
      <View style={styles.card}>
        <Pressable onPress={() => setPlayerExpanded(false)} style={styles.minimizeBtn} hitSlop={10}>
          <Ionicons name="chevron-down" color="#fff" size={24} />
        </Pressable>
        {track.artworkUri ? <Image source={{ uri: track.artworkUri }} style={styles.artwork} /> : <View style={[styles.artwork, styles.placeholder]} />}
        <Text style={styles.title} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{track.artist || "Unknown Artist"}</Text>
        <View style={styles.controls}>
          <Pressable onPress={previousTrack} style={styles.controlBtn}>
            <Ionicons name="play-skip-back" color="#fff" size={30} />
          </Pressable>
          <Pressable onPress={togglePlayPause} style={[styles.controlBtn, styles.playBtn]}>
            <Ionicons name={isPlaying ? "pause" : "play"} color="#fff" size={36} />
          </Pressable>
          <Pressable onPress={nextTrack} style={styles.controlBtn}>
            <Ionicons name="play-skip-forward" color="#fff" size={30} />
          </Pressable>
        </View>
        <View style={styles.progressContainer} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
          <Pressable onPress={onSeekPress} style={styles.progressPressArea}>
            <View style={styles.progressBarBg} />
            <View style={[styles.progressBarFg, { width: `${progress * 100}%` }]} />
          </Pressable>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(positionMs)}</Text>
            <Text style={styles.timeText}>{formatTime(durationMs)}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function formatTime(ms: number) {
  const total = Math.floor((ms || 0) / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#000000cc",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
  },
  card: {
    width: "88%",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  minimizeBtn: { position: "absolute", right: 8, top: 8, padding: 6, zIndex: 1 },
  artwork: { width: 260, height: 260, borderRadius: 12, marginBottom: 14 },
  placeholder: { backgroundColor: "#2A2A2A" },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  artist: { color: "#A4A8B8", fontSize: 13, marginTop: 4 },
  controls: { marginTop: 18, flexDirection: "row", alignItems: "center" },
  controlBtn: { padding: 12 },
  playBtn: { paddingHorizontal: 20 },
  progressContainer: { width: "100%", marginTop: 16 },
  progressPressArea: { width: "100%", height: 24, justifyContent: "center" },
  progressBarBg: { position: "absolute", height: 3, backgroundColor: "#333", width: "100%", borderRadius: 2 },
  progressBarFg: { position: "absolute", height: 3, backgroundColor: "#fff", borderRadius: 2 },
  timeRow: { marginTop: 8, flexDirection: "row", justifyContent: "space-between" },
  timeText: { color: "#A4A8B8", fontSize: 12 },
});


