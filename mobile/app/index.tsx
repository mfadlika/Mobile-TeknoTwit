import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

export default function Index() {
  const { theme } = useTheme();
  const tint = Colors[theme].tint;
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    const hydrateAuth = async () => {
      try {
        const [token, userId] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("userId"),
        ]);

        if (!mounted) return;
        setIsLoggedIn(Boolean(token && userId));
      } catch (error) {
        if (__DEV__) {
          console.warn("Failed to read auth cache", error);
        }
        if (!mounted) return;
        setIsLoggedIn(false);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    };

    hydrateAuth();
    return () => {
      mounted = false;
    };
  }, []);

  if (checkingAuth) {
    return (
      <ThemedView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={tint} />
      </ThemedView>
    );
  }

  return <Redirect href={isLoggedIn ? "/(tabs)" : "/login"} />;
}
