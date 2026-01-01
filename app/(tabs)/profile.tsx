import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image as RNImage,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          // TODO: Clear stored tokens/user data
          // await AsyncStorage.removeItem('token');
          // await AsyncStorage.removeItem('userId');

          router.replace("/login");
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Profile
        </ThemedText>
      </View>

      <View style={styles.profileSection}>
        <RNImage
          source={require("@/assets/images/icon.png")}
          style={styles.profileAvatar}
        />

        <View style={styles.profileInfo}>
          <ThemedText type="defaultSemiBold" style={styles.profileName}>
            John Doe
          </ThemedText>
          <ThemedText style={styles.profileHandle}>@johndoe</ThemedText>
          <ThemedText style={styles.profileBio}>
            Mobile developer | React Native enthusiast
          </ThemedText>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>234</ThemedText>
            <ThemedText style={styles.statLabel}>Posts</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>1.2K</ThemedText>
            <ThemedText style={styles.statLabel}>Followers</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>567</ThemedText>
            <ThemedText style={styles.statLabel}>Following</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuItemText}>Settings</ThemedText>
          <ThemedText style={styles.menuItemArrow}>›</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuItemText}>Privacy & Safety</ThemedText>
          <ThemedText style={styles.menuItemArrow}>›</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuItemText}>Help & Support</ThemedText>
          <ThemedText style={styles.menuItemArrow}>›</ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: colors.tint }]}
        onPress={handleLogout}
      >
        <ThemedText style={[styles.logoutButtonText, { color: colors.tint }]}>
          Logout
        </ThemedText>
      </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
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
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
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
