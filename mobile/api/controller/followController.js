const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function getAuthUserId(req) {
  return req.user && req.user.id ? Number(req.user.id) : null;
}

exports.followUser = async (req, res) => {
  try {
    const followerId = getAuthUserId(req);
    const followingId = Number(req.params.userId);

    if (!followerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!followingId || followerId === followingId) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const target = await prisma.user.findUnique({
      where: { id: followingId },
    });
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) {
      return res.status(409).json({ message: "Already following" });
    }

    const follow = await prisma.follow.create({
      data: { followerId, followingId },
    });

    res.status(201).json({ message: "Followed", follow });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const followerId = getAuthUserId(req);
    const followingId = Number(req.params.userId);

    if (!followerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!followingId || followerId === followingId) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (!existing) {
      return res.status(404).json({ message: "Not following" });
    }

    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });

    res.json({ message: "Unfollowed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(followers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(following);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkFollowStatus = async (req, res) => {
  try {
    const followerId = getAuthUserId(req);
    const followingId = Number(req.params.userId);

    if (!followerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!followingId) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    res.json({ isFollowing: !!existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
