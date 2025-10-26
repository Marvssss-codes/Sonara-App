// app/(auth)/forgot.tsx
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import { supa } from "../../lib/supabase";
import { theme } from "../../lib/theme";
import AuthHeader from "../../components/AuthHeader";
import GlassInput from "../../components/GlassInput";
import GradientButton from "../../components/GradientButton";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleReset() {
    try {
      if (!email) return Alert.alert("Missing email", "Please enter your account email.");
      setBusy(true);
      const { error } = await supa.auth.resetPasswordForEmail(email, {
        redirectTo: "sonara://reset", // optional deep link
      });
      setBusy(false);
      if (error) return Alert.alert("Failed", error.message);
      Alert.alert("Email sent", "Check your inbox to reset your password.");
    } catch (e: any) {
      setBusy(false);
      Alert.alert("Error", e?.message ?? "Could not send reset email.");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <AuthHeader title="Forgot Password" subtitle="We’ll email you a reset link" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
          <GlassInput icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <GradientButton title={busy ? "Sending..." : "Send reset link"} onPress={handleReset} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
