const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });

    // fetch users for posts to include user name
    const userIds = Array.from(
      new Set(posts.map((p) => p.userId).filter(Boolean))
    );
    let users = [];
    if (userIds.length) {
      users = await prisma.user.findMany({ where: { id: { in: userIds } } });
    }
    const usersById = Object.fromEntries(users.map((u) => [u.id, u]));

    // fetch like counts per post
    const postIds = posts.map((p) => p.id);
    let likeCountsByPostId = {};
    if (postIds.length) {
      const likeGroups = await prisma.like.groupBy({
        by: ["postId"],
        _count: { postId: true },
        where: { postId: { in: postIds } },
      });
      likeCountsByPostId = Object.fromEntries(
        likeGroups.map((g) => [g.postId, g._count.postId])
      );
    }

    const postsWithExtras = posts.map((p) => ({
      ...p,
      user: usersById[p.userId] || null,
      likes: likeCountsByPostId[p.id] || 0,
    }));

    res.json(postsWithExtras);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET post by ID
exports.getPost = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await prisma.user.findUnique({ where: { id: post.userId } });
    const likes = await prisma.like.count({ where: { postId: id } });

    res.json({ ...post, user, likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET posts by user ID
exports.getPostsByUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // attach user info (single user)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const postsWithUser = posts.map((p) => ({ ...p, user }));

    res.json(postsWithUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET posts from followed users (authenticated)
exports.getFollowingPosts = async (req, res) => {
  try {
    const followerId = req.user && req.user.id ? Number(req.user.id) : null;

    if (!followerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get list of users that this user follows
    const following = await prisma.follow.findMany({
      where: { followerId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    // Get posts from those users
    const posts = await prisma.post.findMany({
      where: { userId: { in: followingIds } },
      orderBy: { createdAt: "desc" },
    });

    // fetch users for posts
    const userIds = Array.from(
      new Set(posts.map((p) => p.userId).filter(Boolean))
    );
    let users = [];
    if (userIds.length) {
      users = await prisma.user.findMany({ where: { id: { in: userIds } } });
    }
    const usersById = Object.fromEntries(users.map((u) => [u.id, u]));

    // fetch like counts per post
    const postIds = posts.map((p) => p.id);
    let likeCountsByPostId = {};
    if (postIds.length) {
      const likeGroups = await prisma.like.groupBy({
        by: ["postId"],
        _count: { postId: true },
        where: { postId: { in: postIds } },
      });
      likeCountsByPostId = Object.fromEntries(
        likeGroups.map((g) => [g.postId, g._count.postId])
      );
    }

    const postsWithExtras = posts.map((p) => ({
      ...p,
      user: usersById[p.userId] || null,
      likes: likeCountsByPostId[p.id] || 0,
    }));

    res.json(postsWithExtras);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE new post (authenticated)
exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    // prefer authenticated user id from middleware
    const authUserId = req.user && req.user.id ? Number(req.user.id) : null;
    const bodyUserId = req.body.userId ? Number(req.body.userId) : null;
    const userId = authUserId || bodyUserId;

    if (!title || !content || !userId) {
      return res
        .status(400)
        .json({ message: "Missing required fields or unauthorized" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        userId: Number(userId),
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    res.json({
      message: "Post created successfully",
      post: { ...post, user },
      postId: post.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Create Picture Post (authenticated)
exports.createPosture = async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    // prefer authenticated user id from middleware
    const authUserId = req.user && req.user.id ? Number(req.user.id) : null;
    const bodyUserId = req.body.userId ? Number(req.body.userId) : null;
    const userId = authUserId || bodyUserId;

    if (!title || !content || !imageUrl || !userId) {
      return res
        .status(400)
        .json({ message: "Missing required fields or unauthorized" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
        userId: Number(userId),
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    res.json({
      message: "Picture Post created successfully",
      post: { ...post, user },
      postId: post.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPostpicture = exports.createPosture;

// Repost a post (authenticated)
exports.repostPost = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user && req.user.id ? Number(req.user.id) : null;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!postId) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existing = await prisma.repost.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (existing) {
      return res.status(409).json({ message: "Already reposted" });
    }

    const repost = await prisma.repost.create({
      data: { userId, postId },
    });

    res.status(201).json({ message: "Reposted", repost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Undo repost (authenticated)
exports.unrepostPost = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user && req.user.id ? Number(req.user.id) : null;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!postId) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const existing = await prisma.repost.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (!existing) {
      return res.status(404).json({ message: "Repost not found" });
    }

    await prisma.repost.delete({
      where: { userId_postId: { userId, postId } },
    });

    res.json({ message: "Repost removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user && req.user.id ? Number(req.user.id) : null;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!postId) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (existing) {
      return res.status(409).json({ message: "Already liked" });
    }

    const like = await prisma.like.create({
      data: { userId, postId },
    });
    const likes = await prisma.like.count({ where: { postId } });
    res.status(201).json({ message: "Liked", like, likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user && req.user.id ? Number(req.user.id) : null;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!postId) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (!existing) {
      return res.status(404).json({ message: "Like not found" });
    }

    await prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    });

    const likes = await prisma.like.count({ where: { postId } });
    res.json({ message: "Like removed", likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
