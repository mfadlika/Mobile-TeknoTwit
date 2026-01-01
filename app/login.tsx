import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual login API call
      // Example:
      // const response = await fetch('YOUR_API_URL/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password }),
      // });
      // const data = await response.json();

      // For now, simulate a login
      setTimeout(() => {
        setIsLoading(false);
        router.replace("/(tabs)");
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Login failed. Please try again.");
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
              placeholder="Enter your username"
              placeholderTextColor={colorScheme === "dark" ? "#888" : "#999"}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
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
            Don't have an account?{" "}
          </ThemedText>
          <TouchableOpacity>
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
  button: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
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
