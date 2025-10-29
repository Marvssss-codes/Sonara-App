// app/payments.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

export default function Payments() {
  const router = useRouter();
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchPayments = async () => {
        const stored = await AsyncStorage.getItem("paymentHistory");
        if (stored) setPaymentHistory(JSON.parse(stored));
      };

      fetchPayments();
      return () => {};
    }, [])
  );

  const renderPayment = ({ item }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => setSelectedPayment(item)}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Icon name="credit-card" size={22} color="#C07CFF" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.paymentTitle}>{item.title}</Text>
          <Text style={styles.paymentDate}>{item.date}</Text>
        </View>
      </View>
      <Text style={styles.paymentAmount}>{item.amount}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header (moved down with paddingTop) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="chevron-left" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Manage Payments</Text>
          <View style={styles.glowBar} />
        </View>
        <TouchableOpacity onPress={() => router.push("/PaymentForm")}>
          <Icon name="refresh-cw" size={22} color="#C07CFF" />
        </TouchableOpacity>
      </View>

      {/* Saved Card Section */}
      <View style={styles.cardSection}>
        <Text style={styles.sectionHeader}>SAVED PAYMENT METHOD</Text>
        <View style={styles.cardBox}>
          <Icon name="credit-card" size={30} color="#C07CFF" />
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.cardText}>Visa •••• 4242</Text>
            <Text style={styles.cardSub}>Expires 12/26</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/PaymentForm")}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment History Section */}
      <View style={styles.historySection}>
        <Text style={styles.sectionHeader}>PAYMENT HISTORY</Text>
        {paymentHistory.length === 0 ? (
          <Text style={styles.emptyText}>No payments yet.</Text>
        ) : (
          <FlatList
            data={paymentHistory}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPayment}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Add New Payment */}
      <TouchableOpacity
        style={styles.addPaymentButton}
        onPress={() => router.push("/PaymentForm")}
      >
        <Icon name="plus" size={18} color="#fff" />
        <Text style={styles.addPaymentText}>Add New Payment</Text>
      </TouchableOpacity>

      {/* Payment Details Modal */}
      <Modal visible={!!selectedPayment} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>Payment Details</Text>

            {selectedPayment && (
              <>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Plan</Text>
                  <Text style={styles.modalValue}>{selectedPayment.title}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Amount</Text>
                  <Text style={styles.modalValue}>{selectedPayment.amount}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Card Used</Text>
                  <Text style={styles.modalValue}>{selectedPayment.card}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Date</Text>
                  <Text style={styles.modalValue}>{selectedPayment.date}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Expires</Text>
                  <Text style={styles.modalValue}>{selectedPayment.expires}</Text>
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPayment(null)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingTop: 70, // 👈 pushes the header and title down
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30, // 👈 more space after title
  },
  headerTextContainer: { alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  glowBar: {
    height: 3,
    width: 120,
    backgroundColor: "#C07CFF",
    borderRadius: 3,
    marginTop: 4,
    shadowColor: "#C07CFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },

  sectionHeader: {
    color: "#888",
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: 10,
  },

  cardSection: { marginBottom: 25 },
  cardBox: {
    backgroundColor: "#111",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#222",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  cardText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cardSub: { color: "#aaa", fontSize: 13 },
  changeText: { color: "#C07CFF", fontWeight: "600" },

  historySection: { flex: 1 },
  paymentCard: {
    backgroundColor: "#0f0f0f",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f0038",
  },
  paymentTitle: { color: "#fff", fontWeight: "700", fontSize: 15 },
  paymentDate: { color: "#aaa", fontSize: 13 },
  paymentAmount: { color: "#C07CFF", fontWeight: "700", fontSize: 15 },
  emptyText: { color: "#777", textAlign: "center", marginTop: 20 },

  addPaymentButton: {
    backgroundColor: "#C07CFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  addPaymentText: { color: "#fff", fontWeight: "700", fontSize: 15, marginLeft: 8 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#111",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    borderWidth: 1,
    borderColor: "#2b0055",
  },
  handle: {
    width: 60,
    height: 5,
    backgroundColor: "#333",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 15,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalLabel: { color: "#aaa", fontSize: 14 },
  modalValue: { color: "#fff", fontSize: 15, fontWeight: "600" },
  closeButton: {
    backgroundColor: "#C07CFF",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 15,
  },
  closeText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});
