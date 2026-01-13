const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function getAuthUserId(req) {
  return req.user && req.user.id ? Number(req.user.id) : null;
}

async function areFriends(userId, otherUserId) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: userId, addresseeId: otherUserId },
        { requesterId: otherUserId, addresseeId: userId },
      ],
    },
  });
  return Boolean(friendship);
}

exports.sendDirectMessage = async (req, res) => {
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
      return res
        .status(400)
        .json({ message: "Message or postId is required" });
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

exports.getDirectMessages = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    const withUserId = req.query.withUserId
      ? Number(req.query.withUserId)
      : null;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const where = withUserId
      ? {
          OR: [
            { senderId: userId, receiverId: withUserId },
            { senderId: withUserId, receiverId: userId },
          ],
        }
      : { OR: [{ senderId: userId }, { receiverId: userId }] };

    const messages = await prisma.message.findMany({
      where,
      include: { sender: true, receiver: true, post: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
