import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { API_ENDPOINTS } from "@/constants/api";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  title?: string;
  content: string;
  userId: number;
  createdAt: string;
  user: User | null;
  likes?: number;
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const postId = useMemo(() => (id ? String(id) : null), [id]);

  const fetchPost = async () => {
    if (!postId) return;
    try {
      const response = await fetch(API_ENDPOINTS.GET_POST_BY_ID(postId));
      const data = await response.json();

      if (response.ok) {
        setPost(data);
      } else {
        setPost(null);
      }
    } catch (error) {
      setPost(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPost();
  };

  const handleToggleLike = async () => {
    if (!postId || !post) return;

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Error", "Please login to like posts.");
      return;
    }

    setIsLiking(true);

    // Optimistic increment
    setPost((prev) =>
      prev ? { ...prev, likes: (prev.likes || 0) + 1 } : prev,
    );

    try {
      const likeUrl = `${API_ENDPOINTS.CREATE_POST}/${postId}/like`;
      const res = await fetch(likeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.status === 409) {
        const unlikeRes = await fetch(likeUrl, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const unlikeData = await unlikeRes.json();

        if (unlikeRes.ok) {
          setPost((prev) =>
            prev
              ? {
                  ...prev,
                  likes:
                    typeof unlikeData.likes === "number"
                      ? unlikeData.likes
                      : Math.max(0, (prev.likes || 1) - 1),
                }
              : prev,
          );
        }
      } else if (res.ok) {
        setPost((prev) =>
          prev
            ? {
                ...prev,
                likes:
                  typeof data.likes === "number" ? data.likes : prev.likes || 1,
              }
            : prev,
        );
      } else {
        setPost((prev) =>
          prev ? { ...prev, likes: Math.max(0, (prev.likes || 1) - 1) } : prev,
        );
        Alert.alert("Error", data.message || "Failed to like post.");
      }
    } catch (error) {
      setPost((prev) =>
        prev ? { ...prev, likes: Math.max(0, (prev.likes || 1) - 1) } : prev,
      );
      Alert.alert("Error", "Cannot like post right now.");
    } finally {
      setIsLiking(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Post",

            headerBackTitle: "Back",
          }}
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </ThemedView>
    );
  }

  if (!post) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Post",

            headerBackTitle: "Back",
          }}
        />
        <ScrollView
          contentContainerStyle={styles.centered}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              title="Memuat ulang..."
            />
          }
        >
          <ThemedText style={styles.emptyText}>Post tidak ditemukan</ThemedText>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Post",

          headerBackTitle: "Back",
        }}
      />
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            title="Memuat ulang..."
          />
        }
      >
        <View style={styles.headerRow}>
          <View style={styles.avatarPlaceholder} />
          <View style={styles.headerInfo}>
            <View style={styles.authorRow}>
              <ThemedText style={styles.authorName}>
                {post.user?.name || "Unknown User"}
              </ThemedText>
              <ThemedText style={styles.username}>
                @{post.user?.email?.split("@")[0] || "user"}
              </ThemedText>
            </View>
            <ThemedText style={styles.timestamp}>
              {formatTimestamp(post.createdAt)}
            </ThemedText>
          </View>
        </View>

        <ThemedText style={styles.bodyText}>{post.content}</ThemedText>

        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleToggleLike}
            disabled={isLiking}
          >
            <ThemedText style={styles.likeIcon}>❤️</ThemedText>
            <ThemedText style={styles.likeCount}>{post.likes || 0}</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0e0e0",
  },
  headerInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorName: {
    fontWeight: "700",
    fontSize: 16,
  },
  username: {
    fontSize: 14,
    opacity: 0.5,
  },
  timestamp: {
    fontSize: 13,
    opacity: 0.5,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  likeIcon: {
    fontSize: 18,
  },
  likeCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
