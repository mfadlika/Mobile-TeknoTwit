import "dotenv/config";
import { PrismaClient, FriendStatus } from "@prisma/client";
import type { Request, Response } from "express";

const prisma = new PrismaClient();

const FRIEND_STATUS = FriendStatus;

function getAuthUserId(req: Request): number | null {
  return req.user && req.user.id ? Number(req.user.id) : null;
}

export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const requesterId = getAuthUserId(req);
    const addresseeId = Number(req.body.addresseeId);

    if (!requesterId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!addresseeId || requesterId === addresseeId) {
      return res.status(400).json({ message: "Invalid addressee" });
    }

    const addressee = await prisma.user.findUnique({
      where: { id: addresseeId },
    });
    if (!addressee) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });
    if (existing) {
      return res.status(409).json({ message: "Friend request already exists" });
    }

    const request = await prisma.friendship.create({
      data: { requesterId, addresseeId },
    });

    res.status(201).json({ message: "Request sent", request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const requests = await prisma.friendship.findMany({
      where: { addresseeId: userId, status: FRIEND_STATUS.PENDING },
      include: { requester: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const respondToRequest = async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const requestId = Number(req.params.id);
    const statusInput = String(req.body.status || "").toUpperCase();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!requestId) {
      return res.status(400).json({ message: "Invalid request id" });
    }
    if (
      statusInput !== FRIEND_STATUS.ACCEPTED &&
      statusInput !== FRIEND_STATUS.REJECTED
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const status = statusInput as FriendStatus;

    const request = await prisma.friendship.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.addresseeId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updated = await prisma.friendship.update({
      where: { id: requestId },
      data: { status },
    });

    res.json({ message: "Request updated", request: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFriends = async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        status: FRIEND_STATUS.ACCEPTED,
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: { requester: true, addressee: true },
      orderBy: { updatedAt: "desc" },
    });

    const friends = friendships.map((f) =>
      f.requesterId === userId ? f.addressee : f.requester
    );

    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeFriend = async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const friendshipId = Number(req.params.id);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!friendshipId) {
      return res.status(400).json({ message: "Invalid friendship id" });
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    if (!friendship) {
      return res.status(404).json({ message: "Friendship not found" });
    }
    if (
      friendship.requesterId !== userId &&
      friendship.addresseeId !== userId
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.friendship.delete({ where: { id: friendshipId } });
    res.json({ message: "Friend removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
