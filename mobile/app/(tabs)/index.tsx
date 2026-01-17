import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { API_ENDPOINTS } from "@/constants/api";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Image as RNImage,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  reposts?: number;
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

function PostCard({
  post,
  onPress,
  onToggleLike,
  onUserPress,
  onToggleRepost,
}: {
  post: Post;
  onPress?: () => void;
  onToggleLike?: (postId: number) => void;
  onUserPress?: (userId: number) => void;
  onToggleRepost?: (postId: number) => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
      style={styles.postCardTouchable}
    >
      <ThemedView style={styles.postCard}>
        <View style={styles.postHeader}>
          <RNImage
            source={require("@/assets/images/icon.png")}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                if (post.user?.id) {
                  onUserPress?.(post.user.id);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.authorRow}>
                <ThemedText style={styles.authorName}>
                  {post.user?.name || "Unknown User"}
                </ThemedText>
                <ThemedText style={styles.username}>
                  @{post.user?.email?.split("@")[0] || "user"}
                </ThemedText>
              </View>
            </TouchableOpacity>
            <ThemedText style={styles.timestamp}>
              {formatTimestamp(post.createdAt)}
            </ThemedText>
          </View>
        </View>

        <ThemedText style={styles.content}>{post.content}</ThemedText>

        <View style={styles.likeContainer}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={(e) => {
              e.stopPropagation();
              onToggleLike?.(post.id);
            }}
          >
            <ThemedText style={styles.likeIcon}>❤️</ThemedText>
            <ThemedText style={styles.likeCount}>{post.likes || 0}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={(e) => {
              e.stopPropagation();
              onToggleRepost?.(post.id);
            }}
          >
            <Feather name="repeat-2" size={18} color="#666" />
            <ThemedText style={styles.likeCount}>
              {post.reposts || 0}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "following">("all");
  const [error, setError] = useState<string | null>(null);

  const invalidateSession = useCallback(async () => {
    await AsyncStorage.multiRemove(["token", "userId"]);
    setAuthToken(null);
    setAuthUserId(null);
    router.replace("/login");
  }, [router]);

  const fetchPosts = useCallback(async () => {
    setError(null);
    try {
      let url = API_ENDPOINTS.GET_POSTS;
      const headers: Record<string, string> = {};

      if (activeTab === "following") {
        const token = authToken || (await AsyncStorage.getItem("token"));
        if (!token) {
          Alert.alert("Error", "Please login to see posts from following");
          setActiveTab("all");
          return;
        }
        url = API_ENDPOINTS.GET_FOLLOWING_POSTS;
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });
      const data = await response.json();

      if (response.status === 401) {
        setError("Sesi berakhir. Silakan login ulang.");
        await invalidateSession();
        return;
      }

      if (response.ok) {
        const ordered = Array.isArray(data) ? [...data].reverse() : [];
        setPosts(ordered);
      } else {
        console.error("Failed to fetch posts:", data);
        setError("Gagal memuat posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Tidak bisa memuat posts sekarang");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, authToken, invalidateSession]);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const [storedToken, storedUserId] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("userId"),
        ]);

        setAuthToken(storedToken);
        setAuthUserId(storedUserId);
      } catch (error) {
        console.error("Error loading auth data:", error);
      }
    };

    loadAuth();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [activeTab, fetchPosts]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPosts();
  };

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Content must be filled in.");
      return;
    }

    const derivedTitle = content.trim().slice(0, 80) || "Post";

    const storedToken = authToken || (await AsyncStorage.getItem("token"));
    const storedUserId = authUserId || (await AsyncStorage.getItem("userId"));

    if (!storedToken || !storedUserId) {
      Alert.alert("Error", "Please login to create a post.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.CREATE_POST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify({
          title: derivedTitle,
          content: content.trim(),
          userId: Number(storedUserId),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        Alert.alert("Error", "Session expired. Please login again.");
        await invalidateSession();
        return;
      }

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to send post.");
        return;
      }

      if (data.post) {
        setPosts((prev) => [data.post, ...prev]);
      } else {
        fetchPosts();
      }

      setContent("");
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Cannot send post right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (postId: number) => {
    const storedToken = authToken || (await AsyncStorage.getItem("token"));

    if (!storedToken) {
      Alert.alert("Error", "Please login to like posts.");
      return;
    }

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p,
      ),
    );

    try {
      const response = await fetch(
        `${API_ENDPOINTS.CREATE_POST}/${postId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likes: Math.max(0, (p.likes || 1) - 1) }
              : p,
          ),
        );
        Alert.alert("Error", "Session expired. Please login again.");
        await invalidateSession();
        return;
      }

      if (response.status === 409) {
        // Already liked, so unlike
        const unlikeResponse = await fetch(
          `${API_ENDPOINTS.CREATE_POST}/${postId}/like`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          },
        );

        const unlikeData = await unlikeResponse.json();

        if (unlikeResponse.ok) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, likes: unlikeData.likes || 0 } : p,
            ),
          );
        } else if (unlikeResponse.status === 401) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? { ...p, likes: Math.max(0, (p.likes || 1) - 1) }
                : p,
            ),
          );
          Alert.alert("Error", "Session expired. Please login again.");
          await invalidateSession();
          return;
        }
      } else if (response.ok) {
        // Successfully liked
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, likes: data.likes || p.likes || 0 } : p,
          ),
        );
      } else {
        // Revert optimistic update on error
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likes: Math.max(0, (p.likes || 0) - 1) }
              : p,
          ),
        );
        Alert.alert("Error", data.message || "Failed to like post.");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likes: Math.max(0, (p.likes || 0) - 1) }
            : p,
        ),
      );
      Alert.alert("Error", "Cannot like post right now.");
    }
  };

  const handleToggleRepost = async (postId: number) => {
    const storedToken = authToken || (await AsyncStorage.getItem("token"));

    if (!storedToken) {
      Alert.alert("Error", "Please login to repost.");
      return;
    }

    // Optimistic increment
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, reposts: (p.reposts || 0) + 1 } : p,
      ),
    );

    try {
      const repostUrl = API_ENDPOINTS.REPOST(postId);
      const res = await fetch(repostUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`,
        },
      });

      const data = await res.json();

      if (res.status === 401) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, reposts: Math.max(0, (p.reposts || 1) - 1) }
              : p,
          ),
        );
        Alert.alert("Error", "Session expired. Please login again.");
        await invalidateSession();
        return;
      }

      if (res.status === 409) {
        // Already reposted, so unrepost
        const unrepostRes = await fetch(repostUrl, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        const unrepostData = await unrepostRes.json();

        if (unrepostRes.ok) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    reposts:
                      typeof unrepostData.reposts === "number"
                        ? unrepostData.reposts
                        : Math.max(0, (p.reposts || 1) - 1),
                  }
                : p,
            ),
          );
        } else if (unrepostRes.status === 401) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? { ...p, reposts: Math.max(0, (p.reposts || 1) - 1) }
                : p,
            ),
          );
          Alert.alert("Error", "Session expired. Please login again.");
          await invalidateSession();
          return;
        }
      } else if (res.ok) {
        // Successfully reposted
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, reposts: data.reposts || p.reposts || 1 }
              : p,
          ),
        );
      } else {
        // Revert optimistic update
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, reposts: Math.max(0, (p.reposts || 0) - 1) }
              : p,
          ),
        );
        Alert.alert("Error", data.message || "Failed to repost.");
      }
    } catch (error) {
      console.error("Error toggling repost:", error);
      // Revert optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, reposts: Math.max(0, (p.reposts || 0) - 1) }
            : p,
        ),
      );
      Alert.alert("Error", "Cannot repost right now.");
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Home
          </ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      style={styles.container}
    >
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Home
          </ThemedText>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() => router.push(`/post/${item.id}`)}
              onToggleLike={handleToggleLike}
              onToggleRepost={handleToggleRepost}
              onUserPress={(userId) => router.push(`/user/${userId}`)}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              title="Refreshing..."
            />
          }
          ListHeaderComponent={
            <>
              {authToken && (
                <View
                  style={[
                    styles.tabContainer,
                    {
                      borderBottomColor:
                        theme === "dark" ? "#2f2f2f" : "#e0e0e0",
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === "all" && styles.tabActive,
                    ]}
                    onPress={() => setActiveTab("all")}
                  >
                    <ThemedText
                      style={[
                        styles.tabText,
                        activeTab === "all" && {
                          color: colors.tint,
                          fontWeight: "700",
                        },
                      ]}
                    >
                      All Posts
                    </ThemedText>
                    {activeTab === "all" && (
                      <View
                        style={[
                          styles.tabIndicator,
                          { backgroundColor: colors.tint },
                        ]}
                      />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === "following" && styles.tabActive,
                    ]}
                    onPress={() => setActiveTab("following")}
                  >
                    <ThemedText
                      style={[
                        styles.tabText,
                        activeTab === "following" && {
                          color: colors.tint,
                          fontWeight: "700",
                        },
                      ]}
                    >
                      Following
                    </ThemedText>
                    {activeTab === "following" && (
                      <View
                        style={[
                          styles.tabIndicator,
                          { backgroundColor: colors.tint },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.listHeader}>
                {/* <ThemedText style={styles.composerLabel}>
                  Create Post
                </ThemedText> */}

                <TextInput
                  style={[
                    styles.composerInput,
                    styles.composerContentInput,
                    {
                      backgroundColor: theme === "dark" ? "#1c1c1c" : "#f7f7f7",
                      borderColor: theme === "dark" ? "#2f2f2f" : "#e0e0e0",
                      color: theme === "dark" ? "#fff" : "#000",
                    },
                  ]}
                  placeholder="What do you want to share?"
                  placeholderTextColor={theme === "dark" ? "#8a8a8a" : "#999"}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[
                    styles.postButton,
                    { backgroundColor: colors.tint },
                    isSubmitting && styles.postButtonDisabled,
                  ]}
                  onPress={handleCreatePost}
                  disabled={isSubmitting}
                >
                  <ThemedText style={styles.postButtonText}>
                    {isSubmitting ? "Sending..." : "Send"}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No posts yet</ThemedText>
            </View>
          }
        />
      </ThemedView>
    </KeyboardAvoidingView>
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
  listContent: {
    paddingBottom: 20,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  composerLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  composerInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  composerContentInput: {
    minHeight: 100,
  },
  postButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: "#030000ff",
    fontSize: 16,
    fontWeight: "700",
  },
  postCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  postCardTouchable: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  postHeader: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  headerInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  authorName: {
    fontWeight: "700",
    fontSize: 15,
  },
  username: {
    fontSize: 14,
    opacity: 0.5,
  },
  timestamp: {
    fontSize: 13,
    opacity: 0.5,
  },
  postTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
  },
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#ffebee",
    borderWidth: 1,
    borderColor: "#f5c6cb",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 4,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: "relative",
  },
  tabActive: {},
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    opacity: 0.6,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
});
