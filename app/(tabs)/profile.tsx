import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { API_ENDPOINTS } from "@/constants/api";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export default function ProfileScreen() {
  const { theme, setThemePreference: setThemePref } = useTheme();
  const colors = Colors[theme];
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [postCount, setPostCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");

  const toggleTheme = async (value: boolean) => {
    const newTheme = value ? "dark" : "light";
    await setThemePref(newTheme);
  };

  const fetchUserData = async () => {
    try {
      // Get logged-in user ID from AsyncStorage
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        // No user logged in, redirect to login
        router.replace("/login");
        return;
      }

      // Fetch user data by ID
      const userResponse = await fetch(API_ENDPOINTS.GET_USER_BY_ID(userId));
      const userData = await userResponse.json();

      if (userResponse.ok) {
        setUser(userData);

        // Fetch posts count for this user
        const postsResponse = await fetch(API_ENDPOINTS.GET_POSTS);
        const posts = await postsResponse.json();

        if (postsResponse.ok) {
          const userPosts = posts.filter(
            (post: any) => post.userId === parseInt(userId)
          );
          setPostCount(userPosts.length);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          // Clear stored tokens/user data
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("userId");

          router.replace("/login");
        },
        style: "destructive",
      },
    ]);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Profile
          </ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Profile
          </ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ThemedText>No user data found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Profile
        </ThemedText>
      </View>

      <ScrollView>
        <View style={styles.profileSection}>
          <RNImage
            source={require("@/assets/images/icon.png")}
            style={styles.profileAvatar}
          />

          <View style={styles.profileInfo}>
            <ThemedText type="defaultSemiBold" style={styles.profileName}>
              {user.name}
            </ThemedText>
            <ThemedText style={styles.profileHandle}>
              @{user.email.split("@")[0]}
            </ThemedText>
            {/* <ThemedText style={styles.profileBio}>
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </ThemedText> */}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{postCount}</ThemedText>
              <ThemedText style={styles.statLabel}>Posts</ThemedText>
            </View>
            {/* <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Followers</ThemedText>
            </View> */}
            {/* <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Following</ThemedText>
            </View> */}
          </View>
        </View>

        <View style={styles.menuSection}>
          <ThemedText style={styles.sectionTitle}>Settings</ThemedText>

          <View
            style={[styles.menuItem, { borderBottomColor: colors.icon + "30" }]}
          >
            <View style={styles.menuItemLeft}>
              <ThemedText style={styles.menuItemIcon}>🌙</ThemedText>
              <View>
                <ThemedText style={styles.menuItemText}>Dark Mode</ThemedText>
                <ThemedText style={styles.menuItemSubtext}>
                  {isDarkMode ? "Enabled" : "Disabled"}
                </ThemedText>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#d1d5db", true: colors.tint }}
              thumbColor={isDarkMode ? "#fff" : "#f9fafb"}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.tint }]}
          onPress={handleLogout}
        >
          <ThemedText style={[styles.logoutButtonText, { color: colors.tint }]}>
            Logout
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
    maxWidth: 250,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  menuSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.5,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemIcon: {
    fontSize: 22,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuItemSubtext: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
  menuItemArrow: {
    fontSize: 20,
    opacity: 0.5,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
