import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

export default function AboutModal({ visible, onClose }) {
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 600,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.modalBox, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.handle} />
          <Text style={styles.modalTitle}>About Sonara</Text>

          <Text style={styles.modalText}>
            Sonara is your creative companion — designed for smooth streaming,
            discovery, and inspiration. Experience music the calm, premium way.
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Icon name="star" size={18} color="#C07CFF" />
              <Text style={styles.featureText}>Ad-free high-quality music</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="headphones" size={18} color="#C07CFF" />
              <Text style={styles.featureText}>Personalized playlists</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="download" size={18} color="#C07CFF" />
              <Text style={styles.featureText}>Offline mode for Premium users</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)", // no white flash
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#0d0d0d",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: "#222",
  },
  handle: {
    width: 50,
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 15,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  modalText: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 25,
  },
  featureList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  featureText: {
    color: "#ccc",
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: "#C07CFF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
