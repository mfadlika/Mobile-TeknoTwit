import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { API_ENDPOINTS } from "@/constants/api";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image as RNImage,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Follower {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: string;
  follower: User;
}

export default function FollowersScreen() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const router = useRouter();
  const [followersList, setFollowersList] = useState<Follower[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFollowers = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        router.replace("/login");
        return;
      }

      const response = await fetch(API_ENDPOINTS.GET_FOLLOWERS(userId));
      const data = await response.json();

      if (response.ok) {
        setFollowersList(data);
      } else {
        console.error("Failed to fetch followers:", data);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  const renderFollowerItem = ({ item }: { item: Follower }) => (
    <TouchableOpacity
      style={[
        styles.userItem,
        { borderBottomColor: theme === "dark" ? "#2f2f2f" : "#e0e0e0" },
      ]}
      onPress={() => router.push(`/user/${item.follower.id}`)}
    >
      <RNImage
        source={require("@/assets/images/icon.png")}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <ThemedText style={styles.userName}>{item.follower.name}</ThemedText>
        <ThemedText style={styles.userHandle}>
          @{item.follower.email.split("@")[0]}
        </ThemedText>
      </View>
      <ThemedText style={[styles.arrow, { color: colors.icon }]}>›</ThemedText>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View
          style={[
            styles.header,
            { borderBottomColor: theme === "dark" ? "#404040" : "#e0e0e0" },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.backButton}>← Back</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            Followers
          </ThemedText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          { borderBottomColor: theme === "dark" ? "#404040" : "#e0e0e0" },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          Followers
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={followersList}
        renderItem={renderFollowerItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No followers yet
            </ThemedText>
          </View>
        }
      />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    fontSize: 16,
    fontWeight: "600",
    width: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    opacity: 0.6,
  },
  arrow: {
    fontSize: 28,
    fontWeight: "300",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
  },
});
