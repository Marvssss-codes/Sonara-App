// components/FullPlayerModal.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  PanResponderGestureState,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePlayer } from "./PlayerContext";

interface FullPlayerModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FullPlayerModal({ visible, onClose }: FullPlayerModalProps) {
  const { track, isPlaying, setIsPlaying } = usePlayer();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(track ? 180 : 0); // mock duration

  // Auto-increment progress if playing
  useEffect(() => {
    let timer: number;

    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => Math.min(prev + 1, duration));
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  // Swipe-down animation
  const panY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
      onPanResponderMove: (_, gesture) => panY.setValue(gesture.dy),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120) onClose();
        else Animated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  const translateY = panY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, 300],
    extrapolate: "clamp",
  });

  // Progress bar drag
  const onProgressDrag = (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
    const width = 250; // progress bar width in pixels
    let newProgress = Math.min(Math.max((gesture.dx / width) * duration, 0), duration);
    setProgress(newProgress);
  };

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.container, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity onPress={onClose} style={styles.minimizeButton}>
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>

          {track ? (
            <View style={styles.content}>
              {track.artwork && typeof track.artwork === "string" && (
                <Image source={{ uri: track.artwork }} style={styles.artwork} />
              )}

              <Text style={styles.title}>{track.title}</Text>
              <Text style={styles.artist}>{track.user?.name || "Unknown Artist"}</Text>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressTime}>{formatTime(progress)}</Text>
                <View
                  style={styles.progressBarBackground}
                  {...PanResponder.create({
                    onMoveShouldSetPanResponder: () => true,
                    onPanResponderMove: onProgressDrag,
                  }).panHandlers}
                >
                  <View
                    style={[styles.progressBarFill, { flex: progress / duration }]}
                  />
                </View>
                <Text style={styles.progressTime}>{formatTime(duration)}</Text>
              </View>

              {/* Playback controls */}
              <View style={styles.controls}>
                <TouchableOpacity style={styles.controlButton}>
                  <Ionicons name="play-skip-back" size={32} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={40}
                    color="#fff"
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton}>
                  <Ionicons name="play-skip-forward" size={32} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noTrackContainer}>
              <Text style={styles.noTrack}>No song playing</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#000000cc", justifyContent: "flex-end" },
  container: {
    height: "85%",
    backgroundColor: "#0B0E17",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  minimizeButton: { alignSelf: "center", marginBottom: 20 },
  content: { alignItems: "center", flex: 1, justifyContent: "center", gap: 20 },
  artwork: { width: 250, height: 250, borderRadius: 12, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", textAlign: "center" },
  artist: { fontSize: 16, color: "#A4A8B8", marginTop: 4, textAlign: "center" },
  progressContainer: {
    width: 250,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  progressTime: { color: "#A4A8B8", fontSize: 12, width: 35, textAlign: "center" },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: "#444",
    borderRadius: 3,
    overflow: "hidden",
    justifyContent: "center",
  },
  progressBarFill: { height: 6, backgroundColor: "#1DB954" },
  controls: { flexDirection: "row", alignItems: "center", marginTop: 30, gap: 40 },
  controlButton: { padding: 10 },
  playButton: { backgroundColor: "#1DB954", padding: 20, borderRadius: 50 },
  noTrackContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  noTrack: { color: "#888", fontSize: 16 },
});
