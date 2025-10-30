import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Modal,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Feather";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [showModal, setShowModal] = useState(null); // "about", "support", "terms"

  const slideAnim = useRef(new Animated.Value(900)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openModal = (type) => {
    setShowModal(type);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 900,
        duration: 400,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setShowModal(null));
  };

  const Feature = ({ icon, text }) => (
    <View style={styles.featureItem}>
      <Icon name={icon} size={18} color="#C07CFF" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  const renderModalContent = () => {
    switch (showModal) {
      case "about":
        return (
          <>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Icon name="music" size={42} color="#C07CFF" />
              </View>
              <Text style={styles.modalTitle}>About Sonara</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalText}>
                Sonara is your creative companion — where music meets art, rhythm, and design.
                Crafted for dreamers, artists, and listeners, Sonara brings elegance and speed
                to your music world.
              </Text>

              <Text style={styles.sectionLabel}>Highlights</Text>
              <Feature icon="star" text="Ad-free, high-quality sound" />
              <Feature icon="headphones" text="Personalized playlists for your mood" />
              <Feature icon="download" text="Offline playback for Premium" />
              <Feature icon="heart" text="Minimal, elegant interface" />

              <Text style={styles.sectionLabel}>Our Mission</Text>
              <Text style={styles.modalText}>
                To redefine how people connect with sound — simple, beautiful, and full of life.
              </Text>
            </ScrollView>
          </>
        );

      case "support":
        return (
          <>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Icon name="help-circle" size={42} color="#C07CFF" />
              </View>
              <Text style={styles.modalTitle}>Help & Support</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalText}>
                Need assistance? Our support team is here to help you get the best out of Sonara.
              </Text>

              <Text style={styles.sectionLabel}>Reach Us</Text>
              <Feature icon="mail" text="support@sonara.app" />
              <Feature icon="message-circle" text="Live chat (coming soon)" />
              <Feature icon="instagram" text="@sonara_official" />

              <Text style={styles.sectionLabel}>Quick Tips</Text>
              <Text style={styles.subText}>
                💜 Upgrade to Premium for unlimited streaming.{"\n"}
                💜 Download music to listen offline.{"\n"}
                💜 Enable notifications for new releases.
              </Text>
            </ScrollView>
          </>
        );

      case "terms":
        return (
          <>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Icon name="file-text" size={42} color="#C07CFF" />
              </View>
              <Text style={styles.modalTitle}>Terms & Privacy</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalText}>
                Your privacy is our priority. We protect your data and use it responsibly to
                enhance your experience.
              </Text>

              <Text style={styles.sectionLabel}>Data Use</Text>
              <Text style={styles.subText}>
                We only store minimal information required to make Sonara work smoothly.
              </Text>

              <Text style={styles.sectionLabel}>Your Rights</Text>
              <Text style={styles.subText}>
                You can view, update, or delete your data anytime under Account Settings.
              </Text>

              <Text style={styles.sectionLabel}>Transparency</Text>
              <Text style={styles.subText}>
                We’ll always notify you of any changes to our policy directly in the app.
              </Text>
            </ScrollView>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={styles.header}>Settings</Text>

          {/* 🌟 Premium Section (Fixed Layout) */}
          <View style={styles.premiumCard}>
            <View style={styles.premiumLeft}>
              <Text style={styles.premiumTitle}>
                {isPremium ? "Premium Member 💎" : "Go Premium"}
              </Text>
              <Text style={styles.premiumDesc}>
                {isPremium
                  ? "Enjoy all features with no limits!"
                  : "Unlock exclusive features and enjoy ad-free streaming."}
              </Text>
            </View>

            {!isPremium && (
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={() => router.push("/premium")}
              >
                <Text style={styles.premiumButtonText}>Upgrade</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ACCOUNT */}
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          <TouchableOpacity style={styles.item} onPress={() => router.push("/profile")}>
            <View style={styles.iconRow}>
              <Icon name="user" size={20} color="#C07CFF" />
              <Text style={styles.itemText}>Edit Profile</Text>
            </View>
            <Icon name="chevron-right" color="#888" size={18} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => router.push("/payments")}>
            <View style={styles.iconRow}>
              <Icon name="credit-card" size={20} color="#C07CFF" />
              <Text style={styles.itemText}>Manage Payments</Text>
            </View>
            <Icon name="chevron-right" color="#888" size={18} />
          </TouchableOpacity>

          {/* PREFERENCES */}
          <Text style={styles.sectionHeader}>PREFERENCES</Text>
          <View style={styles.item}>
            <View style={styles.iconRow}>
              <Icon name="bell" size={20} color="#C07CFF" />
              <Text style={styles.itemText}>Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: "#555", true: "#9b5de5" }}
              thumbColor={notifications ? "#fff" : "#aaa"}
              onValueChange={setNotifications}
              value={notifications}
            />
          </View>

          {/* ABOUT */}
          <Text style={styles.sectionHeader}>ABOUT</Text>
          <TouchableOpacity style={styles.item} onPress={() => openModal("about")}>
            <View style={styles.iconRow}>
              <Icon name="info" size={20} color="#C07CFF" />
              <Text style={styles.itemText}>About Sonara</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => openModal("support")}>
            <View style={styles.iconRow}>
              <Icon name="help-circle" size={20} color="#C07CFF" />
              <Text style={styles.itemText}>Help & Support</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => openModal("terms")}>
            <View style={styles.iconRow}>
              <Icon name="file-text" size={20} color="#C07CFF" />
              <Text style={styles.itemText}>Terms & Privacy</Text>
            </View>
          </TouchableOpacity>

          {/* Footer Buttons */}
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={styles.mainButton}
              onPress={() => router.push("/home")}
            >
              <Icon name="arrow-left" color="#fff" size={18} />
              <Text style={styles.mainButtonText}>Back to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: "#9b5de5" }]}
              onPress={() =>
                Alert.alert("Logout", "Are you sure you want to log out?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Logout", onPress: () => router.replace("/login") },
                ])
              }
            >
              <Icon name="log-out" color="#fff" size={18} />
              <Text style={styles.mainButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Enhanced Modals */}
      <Modal visible={!!showModal} transparent statusBarTranslucent>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.modalBox, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.handle} />
            {renderModalContent()}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#000" },
  container: { flex: 1, backgroundColor: "#000" },
  scrollContainer: { padding: 20, paddingBottom: 130 },
  header: { fontSize: 30, color: "#fff", fontWeight: "800", marginBottom: 20 },

  // 🌟 Fixed Premium Card
  premiumCard: {
    backgroundColor: "#12001a",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#9b5de5",
    marginBottom: 25,
    overflow: "hidden",
  },
  premiumLeft: { flex: 1, paddingRight: 10 },
  premiumTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  premiumDesc: { color: "#aaa", fontSize: 14, marginTop: 4 },
  premiumButton: {
    backgroundColor: "#C07CFF",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  premiumButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  sectionHeader: { color: "#888", fontSize: 14, marginTop: 25, marginBottom: 8 },
  item: {
    backgroundColor: "#0d0d0d",
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  iconRow: { flexDirection: "row", alignItems: "center" },
  itemText: { color: "#fff", fontSize: 16, marginLeft: 10 },

  mainButton: {
    backgroundColor: "#C07CFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  mainButtonText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
  footerButtons: { marginTop: 40, marginBottom: 70 },

  // 🔮 Modals
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "flex-end" },
  modalBox: {
    backgroundColor: "rgba(13,13,13,0.97)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    height: "88%",
    borderWidth: 1,
    borderColor: "#30004e",
  },
  handle: {
    width: 65,
    height: 5,
    backgroundColor: "#333",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 15,
  },
  logoContainer: { alignItems: "center", marginBottom: 10 },
  logoCircle: { backgroundColor: "#C07CFF22", borderRadius: 50, padding: 18, marginBottom: 10 },
  modalTitle: { color: "#fff", fontSize: 24, fontWeight: "800", textAlign: "center" },
  modalText: { color: "#aaa", fontSize: 15, lineHeight: 23, textAlign: "center", marginBottom: 20 },
  sectionLabel: { color: "#fff", fontSize: 17, fontWeight: "700", marginBottom: 10, marginTop: 10 },
  subText: { color: "#bbb", fontSize: 15, lineHeight: 22, marginBottom: 10 },
  featureItem: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  featureText: { color: "#ddd", fontSize: 15 },
  closeButton: {
    backgroundColor: "#C07CFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  closeText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
