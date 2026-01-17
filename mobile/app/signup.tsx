import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { API_ENDPOINTS } from "@/constants/api";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-context";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignupScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[theme];
  const EMAIL_DOMAIN = "@teknokrat.ac.id";

  const handleSignup = async () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernamePattern.test(trimmedUsername)) {
      Alert.alert(
        "Error",
        "Username must be 3-20 characters and contain only letters, numbers, or underscore",
      );
      return;
    }

    setIsLoading(true);
    try {
      const localPart = trimmedUsername.split("@")[0];
      const signupEmail = `${localPart}${EMAIL_DOMAIN}`;
      const response = await fetch(API_ENDPOINTS.SIGNUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedUsername,
          username: localPart,
          email: signupEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Signup failed");
        setIsLoading(false);
        return;
      }

      Alert.alert("Success", "Account created. Please sign in.", [
        {
          text: "OK",
          onPress: () => router.replace("/login"),
        },
      ]);
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        "Error",
        "Cannot connect to server. Please check your connection.",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Create Account
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Sign up to get started
            </ThemedText>
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
                      backgroundColor: theme === "dark" ? "#2c2c2c" : "#f5f5f5",
                      color: theme === "dark" ? "#fff" : "#000",
                      borderColor: theme === "dark" ? "#404040" : "#e0e0e0",
                    },
                  ]}
                  placeholder="Choose a username"
                  placeholderTextColor={theme === "dark" ? "#888" : "#999"}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View
                  style={[
                    styles.domainBox,
                    {
                      backgroundColor: theme === "dark" ? "#2c2c2c" : "#f5f5f5",
                      borderColor: theme === "dark" ? "#404040" : "#e0e0e0",
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
                    backgroundColor: theme === "dark" ? "#2c2c2c" : "#f5f5f5",
                    color: theme === "dark" ? "#fff" : "#000",
                    borderColor: theme === "dark" ? "#404040" : "#e0e0e0",
                  },
                ]}
                placeholder="Create a password"
                placeholderTextColor={theme === "dark" ? "#888" : "#999"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Confirm Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme === "dark" ? "#2c2c2c" : "#f5f5f5",
                    color: theme === "dark" ? "#fff" : "#000",
                    borderColor: theme === "dark" ? "#404040" : "#e0e0e0",
                  },
                ]}
                placeholder="Re-enter your password"
                placeholderTextColor={theme === "dark" ? "#888" : "#999"}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tint }]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <ThemedText style={styles.buttonText}>
                {isLoading ? "Creating Account..." : "Sign Up"}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Already have an account?{" "}
            </ThemedText>
            <TouchableOpacity onPress={() => router.back()}>
              <ThemedText style={[styles.loginText, { color: colors.tint }]}>
                Sign In
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
  },
  loginText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
