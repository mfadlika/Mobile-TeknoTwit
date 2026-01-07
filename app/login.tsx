import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { API_ENDPOINTS } from "@/constants/api";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const EMAIL_DOMAIN = "@teknokrat.ac.id";

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const localPart = email.trim().split("@")[0];
      const loginEmail = `${localPart}${EMAIL_DOMAIN}`;
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: loginEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      // Store token and user info
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("userId", data.userId.toString());

      setIsLoading(false);
      router.replace("/(tabs)");
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        "Error",
        "Cannot connect to server. Please check your connection."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Welcome Back
          </ThemedText>
          <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.inputFlex,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2c2c2c" : "#f5f5f5",
                    color: colorScheme === "dark" ? "#fff" : "#000",
                    borderColor: colorScheme === "dark" ? "#404040" : "#e0e0e0",
                  },
                ]}
                placeholder="Enter your username"
                placeholderTextColor={colorScheme === "dark" ? "#888" : "#999"}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
              />
              <View
                style={[
                  styles.domainBox,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2c2c2c" : "#f5f5f5",
                    borderColor: colorScheme === "dark" ? "#404040" : "#e0e0e0",
                  },
                ]}
                pointerEvents="none"
              >
                <ThemedText style={styles.domainText}>
                  {EMAIL_DOMAIN}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#2c2c2c" : "#f5f5f5",
                  color: colorScheme === "dark" ? "#fff" : "#000",
                  borderColor: colorScheme === "dark" ? "#404040" : "#e0e0e0",
                },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={colorScheme === "dark" ? "#888" : "#999"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <ThemedText style={styles.buttonText}>
              {isLoading ? "Signing in..." : "Sign In"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <ThemedText
              style={[styles.forgotPasswordText, { color: colors.tint }]}
            >
              Forgot Password?
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Dont have an account?{" "}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <ThemedText style={[styles.signupText, { color: colors.tint }]}>
              Sign Up
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputFlex: {
    flex: 1,
  },
  domainBox: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
    marginLeft: 8,
  },
  domainText: {
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#030000ff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: 10,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
  },
  signupText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
