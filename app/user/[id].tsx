import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { API_ENDPOINTS } from "@/constants/api";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
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

function PostCard({ post }: { post: Post }) {
  return (
    <ThemedView style={styles.postCard}>
      <View style={styles.postHeader}>
        <RNImage
          source={require("@/assets/images/icon.png")}
          style={styles.avatar}
        />
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

      <ThemedText style={styles.content}>{post.content}</ThemedText>

      <View style={styles.likeContainer}>
        <ThemedText style={styles.likeIcon}>❤️</ThemedText>
        <ThemedText style={styles.likeCount}>{post.likes || 0}</ThemedText>
      </View>
    </ThemedView>
  );
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const colors = Colors[theme];
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const [userResponse, postsResponse] = await Promise.all([
          fetch(API_ENDPOINTS.GET_USER_BY_ID(id as string)),
          fetch(`${API_ENDPOINTS.GET_POSTS}/user/${id}`),
        ]);

        const userData = await userResponse.json();
        const postsData = await postsResponse.json();

        if (userResponse.ok) {
          setUser(userData);
        }

        if (postsResponse.ok) {
          setPosts(postsData);
        }

        // Check follow status
        if (token) {
          const followingResponse = await fetch(
            API_ENDPOINTS.CHECK_FOLLOW_STATUS(id as string),
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (followingResponse.ok) {
            const followingData = await followingResponse.json();
            setIsFollowing(followingData.isFollowing || false);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleFollowToggle = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Please login first");
        return;
      }

      setIsFollowLoading(true);

      const endpoint = isFollowing
        ? API_ENDPOINTS.UNFOLLOW(id as string)
        : API_ENDPOINTS.FOLLOW(id as string);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Error",
          errorData.error || "Failed to update follow status"
        );
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setIsFollowLoading(false);
    }
  };

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
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </ThemedView>
    );
  }

  if (!user) {
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
        </View>
        <View style={styles.loadingContainer}>
          <ThemedText>User not found</ThemedText>
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
      </View>

      <ScrollView>
        <View
          style={[
            styles.profileSection,
            { borderBottomColor: theme === "dark" ? "#404040" : "#e0e0e0" },
          ]}
        >
          <RNImage
            source={require("@/assets/images/icon.png")}
            style={styles.profileAvatar}
          />

          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>{user.name}</ThemedText>
            <ThemedText style={styles.profileHandle}>
              @{user.email.split("@")[0]}
            </ThemedText>
          </View>

          <TouchableOpacity
            style={[
              styles.followButton,
              {
                backgroundColor: isFollowing
                  ? "transparent"
                  : theme === "dark"
                  ? "#667eea"
                  : "#667eea",
                borderColor: isFollowing
                  ? theme === "dark"
                    ? "#667eea"
                    : "#667eea"
                  : "transparent",
                borderWidth: isFollowing ? 2 : 0,
              },
            ]}
            onPress={handleFollowToggle}
            disabled={isFollowLoading}
          >
            <ThemedText
              style={[
                styles.followButtonText,
                {
                  color: isFollowing
                    ? theme === "dark"
                      ? "#667eea"
                      : "#667eea"
                    : "#fff",
                },
              ]}
            >
              {isFollowLoading
                ? "Loading..."
                : isFollowing
                ? "Following"
                : "Follow"}
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{posts.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Posts</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.postsSection}>
          <ThemedText style={styles.sectionTitle}>Posts</ThemedText>
          {posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No posts yet</ThemedText>
            </View>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </View>
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
  },
  backButton: {
    fontSize: 16,
    fontWeight: "600",
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
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 8,
  },
  followButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
    minWidth: 120,
    alignItems: "center",
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: "700",
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
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  postsSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  postCard: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  postHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
  },
  username: {
    fontSize: 14,
    opacity: 0.6,
  },
  timestamp: {
    fontSize: 13,
    opacity: 0.5,
  },
  content: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  likeIcon: {
    fontSize: 16,
  },
  likeCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.5,
  },
});
