import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import {
  FlatList,
  Image as RNImage,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface Post {
  id: string;
  author: string;
  avatar: string;
  username: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  reposts: number;
}

// Dummy data for posts
const DUMMY_POSTS: Post[] = [
  {
    id: "1",
    author: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
    username: "@johndoe",
    content:
      "Just launched my new project! Excited to share it with everyone. Check it out and let me know what you think! 🚀",
    timestamp: "2 hours ago",
    likes: 234,
    comments: 45,
    reposts: 89,
  },
  {
    id: "2",
    author: "Jane Smith",
    avatar: "https://i.pravatar.cc/150?img=2",
    username: "@janesmith",
    content:
      "React Native is amazing! Built a cross-platform app in just one week. The development experience is smooth. 💯",
    timestamp: "4 hours ago",
    likes: 512,
    comments: 78,
    reposts: 156,
  },
  {
    id: "3",
    author: "Tech News",
    avatar: "https://i.pravatar.cc/150?img=3",
    username: "@technewstoday",
    content:
      "Latest JavaScript frameworks comparison: React vs Vue vs Angular. Which one is your favorite?",
    image: "https://via.placeholder.com/400x200?text=Frameworks+Comparison",
    timestamp: "6 hours ago",
    likes: 890,
    comments: 234,
    reposts: 445,
  },
  {
    id: "4",
    author: "Dev Tips",
    avatar: "https://i.pravatar.cc/150?img=4",
    username: "@devtips",
    content:
      "Pro tip: Use useCallback and useMemo to optimize your React components and prevent unnecessary re-renders.",
    timestamp: "8 hours ago",
    likes: 456,
    comments: 102,
    reposts: 203,
  },
  {
    id: "5",
    author: "Mobile Dev",
    avatar: "https://i.pravatar.cc/150?img=5",
    username: "@mobiledev",
    content:
      "Started learning React Native yesterday. Already fell in love with how easy it is to build mobile apps!",
    timestamp: "10 hours ago",
    likes: 345,
    comments: 67,
    reposts: 123,
  },
];

function PostCard({ post }: { post: Post }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <ThemedView style={styles.postCard}>
      <View style={styles.postHeader}>
        <RNImage
          source={require("@/assets/images/icon.png")}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <View style={styles.authorRow}>
            <ThemedText style={styles.authorName}>{post.author}</ThemedText>
            <ThemedText style={styles.username}>{post.username}</ThemedText>
          </View>
          <ThemedText style={styles.timestamp}>{post.timestamp}</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.content}>{post.content}</ThemedText>

      {post.image && (
        <RNImage
          source={{ uri: post.image }}
          style={styles.postImage}
          defaultSource={require("@/assets/images/react-logo.png")}
        />
      )}

      <View style={styles.likeContainer}>
        <TouchableOpacity style={styles.likeButton}>
          <ThemedText style={styles.likeIcon}>❤️</ThemedText>
          <ThemedText style={styles.likeCount}>{post.likes}</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Home
        </ThemedText>
      </View>

      <FlatList
        data={DUMMY_POSTS}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEventThrottle={16}
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
  postCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
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
});
