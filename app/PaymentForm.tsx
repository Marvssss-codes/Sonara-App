// app/paymentForm.tsx
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function PaymentForm() {
  const router = useRouter();
  const { plan, amount } = useLocalSearchParams<{ plan?: string; amount?: string }>();

  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const showSuccessAnim = () => {
    setShowSuccess(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setShowSuccess(false);
        router.replace("/payments");
      });
    }, 2000);
  };

  const handlePayment = async () => {
    if (!name.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      alert("Please fill all fields.");
      return;
    }

    setIsProcessing(true);

    setTimeout(async () => {
      const raw = cardNumber.replace(/\s/g, "");
      const last4 = raw.length >= 4 ? raw.slice(-4) : raw;

      const newPayment = {
        id: Date.now(),
        title: `${plan || "Premium"} Subscription`,
        amount: `₦${amount || "0"}`,
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        expires: "—",
        card: `**** **** **** ${last4}`,
      };

      try {
        const existing = await AsyncStorage.getItem("paymentHistory");
        const history = existing ? JSON.parse(existing) : [];
        const updated = [newPayment, ...history];
        await AsyncStorage.setItem("paymentHistory", JSON.stringify(updated));
      } catch (e) {
        console.log("save payment error", e);
      }

      setIsProcessing(false);
      setName("");
      setCardNumber("");
      setExpiry("");
      setCvv("");
      showSuccessAnim();
    }, 1500);
  };

  return (
    <LinearGradient
      colors={["#0a0014", "#120024", "#000"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.8, y: 1 }}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <Text style={styles.headerTitle}>Payment Details</Text>
            <View style={styles.glowBar} />
          </View>

          <View style={{ width: 24 }} />
        </View>

        {/* Form */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 60 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formCard}>
              <Text style={styles.cardHeader}>{plan || "Premium"} Subscription</Text>
              <Text style={styles.subText}>Complete your upgrade securely below.</Text>

              <View style={{ marginTop: 25 }}>
                <Text style={styles.label}>Cardholder Name</Text>
                <TextInput
                  placeholder="Full name"
                  placeholderTextColor="#777"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />

                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  placeholder="Any numbers accepted"
                  placeholderTextColor="#777"
                  value={cardNumber}
                  onChangeText={(t) => setCardNumber(t.replace(/[^\d\s]/g, ""))}
                  keyboardType="numeric"
                  maxLength={23}
                  style={styles.input}
                />

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.label}>Expiry (MM/YY)</Text>
                    <TextInput
                      placeholder="MM/YY"
                      placeholderTextColor="#777"
                      value={expiry}
                      onChangeText={setExpiry}
                      keyboardType="numeric"
                      maxLength={5}
                      style={styles.input}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>CVV</Text>
                    <TextInput
                      placeholder="Any 3-4 digits"
                      placeholderTextColor="#777"
                      value={cvv}
                      onChangeText={(t) => setCvv(t.replace(/\D/g, ""))}
                      keyboardType="numeric"
                      secureTextEntry
                      maxLength={4}
                      style={styles.input}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.payButton, isProcessing && { opacity: 0.8 }]}
                  onPress={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.payButtonText}>
                      Pay ₦{amount || "0"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Success Modal */}
        <Modal visible={showSuccess} transparent animationType="fade">
          <View style={styles.successOverlay}>
            <Animated.View
              style={[
                styles.successBox,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
              ]}
            >
              <View style={styles.checkCircle}>
                <Icon name="check" size={40} color="#fff" />
              </View>
              <Text style={styles.successText}>Payment Successful</Text>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 80 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  glowBar: {
    height: 3,
    width: 90,
    backgroundColor: "#C07CFF",
    borderRadius: 3,
    marginTop: 4,
    shadowColor: "#C07CFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  formCard: {
    backgroundColor: "rgba(18, 0, 30, 0.85)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#3a006a",
    shadowColor: "#C07CFF",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardHeader: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  subText: { color: "#aaa", fontSize: 13, marginTop: 4 },
  label: { color: "#bbb", marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2e004f",
    marginBottom: 10,
  },
  row: { flexDirection: "row", marginBottom: 10 },
  payButton: {
    backgroundColor: "#C07CFF",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#C07CFF",
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  payButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  successBox: {
    backgroundColor: "#12001a",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#9b5de5",
  },
  checkCircle: {
    backgroundColor: "#C07CFF",
    borderRadius: 50,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#C07CFF",
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  successText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
