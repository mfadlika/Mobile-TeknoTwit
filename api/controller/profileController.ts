import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";

const prisma = new PrismaClient();

function getAuthUserId(req: Request): number | null {
  return req.user && req.user.id ? Number(req.user.id) : null;
}

// GET profile by userId
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      } as any,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT update profile (authenticated)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const authUserId = req.user && req.user.id ? Number(req.user.id) : null;
    const userId = parseInt(req.params.userId);

    if (authUserId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { bio, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { bio, avatarUrl } as any,
    });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE profile (authenticated)
export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const authUserId = req.user && req.user.id ? Number(req.user.id) : null;
    const userId = parseInt(req.params.userId);

    if (authUserId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: "User deleted", user: deletedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET authenticated user's profile
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const authUserId = req.user && req.user.id ? Number(req.user.id) : null;

    if (!authUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUserId },
      select: {
        id: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      } as any,
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE authenticated user's profile
export const deleteMyProfile = async (req: Request, res: Response) => {
  try {
    const authUserId = req.user && req.user.id ? Number(req.user.id) : null;

    if (!authUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: authUserId },
    });

    res.json({ message: "User deleted", user: deletedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Additional profile-related controllers can be added here

// Helper function to check if two users are friends
async function areFriends(userId1: number, userId2: number) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userId1, addresseeId: userId2, status: "ACCEPTED" },
        { requesterId: userId2, addresseeId: userId1, status: "ACCEPTED" },
      ],
    },
  });
  return Boolean(friendship);
}

export const sendDirectMessage = async (req: Request, res: Response) => {
  try {
    const senderId = getAuthUserId(req);
    const receiverId = Number(req.body.receiverId);
    const content =
      typeof req.body.content === "string" ? req.body.content : null;
    const postId = req.body.postId ? Number(req.body.postId) : null;

    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!receiverId || receiverId === senderId) {
      return res.status(400).json({ message: "Invalid receiver" });
    }
    if (!content && !postId) {
      return res.status(400).json({ message: "Message or postId is required" });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    const friends = await areFriends(senderId, receiverId);
    if (!friends) {
      return res.status(403).json({ message: "Only friends can receive DMs" });
    }

    if (postId) {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        postId,
      },
    });

    res.status(201).json({ message: "Message sent", dm: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
