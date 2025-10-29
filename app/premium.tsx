// app/premium.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Feather";

// ✅ Plan type definition
type Plan = {
  id: number;
  name: string;
  price: string;
  features: string[];
  gradient: string[];
  amount: number;
};

export default function PremiumPlans() {
  const router = useRouter();

  const plans: Plan[] = [
    {
      id: 1,
      name: "Basic",
      price: "₦4,500 / month",
      features: ["Ad-free experience", "Unlimited skips", "HD audio"],
      gradient: ["#9b5de5", "#6A00F4"],
      amount: 4500,
    },
    {
      id: 2,
      name: "Pro",
      price: "₦7,000 / month",
      features: [
        "All Basic features",
        "Offline listening",
        "Priority updates",
      ],
      gradient: ["#C07CFF", "#8B5CF6"],
      amount: 7000,
    },
    {
      id: 3,
      name: "Elite",
      price: "₦10,000 / month",
      features: [
        "All Pro features",
        "Exclusive content",
        "Early access to features",
      ],
      gradient: ["#7B2FF7", "#F107A3"],
      amount: 10000,
    },
  ];

  const handleSelectPlan = (plan: Plan) => {
    router.push({
      pathname: "/PaymentForm",
      params: { plan: plan.name, amount: plan.amount.toString() },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="chevron-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Plan Cards */}
      {plans.map((plan) => (
        <TouchableOpacity
          key={plan.id}
          activeOpacity={0.9}
          onPress={() => handleSelectPlan(plan)}
        >
          <LinearGradient
            colors={plan.gradient as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >

            <View style={styles.cardInner}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>{plan.price}</Text>

              <View style={styles.features}>
                {plan.features.map((feat, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Icon name="check-circle" size={16} color="#fff" />
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => handleSelectPlan(plan)}
              >
                <Text style={styles.selectButtonText}>Choose Plan</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  card: {
    borderRadius: 22,
    marginBottom: 25,
    padding: 2,
    shadowColor: "#C07CFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  cardInner: {
    backgroundColor: "#111",
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  planName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  planPrice: {
    color: "#C07CFF",
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 6,
  },
  features: {
    marginTop: 10,
    width: "100%",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  featureText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
  },
  selectButton: {
    backgroundColor: "#C07CFF",
    borderRadius: 10,
    marginTop: 18,
    paddingVertical: 10,
    width: "100%",
  },
  selectButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },
});
