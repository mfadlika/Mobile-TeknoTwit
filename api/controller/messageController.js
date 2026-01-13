const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function getAuthUserId(req) {
  return req.user && req.user.id ? Number(req.user.id) : null;
}


exports.sendMessage = async (req, res) => {
  try {
    const senderId = getAuthUserId(req);
    const receiverId = Number(req.body.receiverId);
    const content = typeof req.body.content === "string" ? req.body.content : null;

    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!receiverId || receiverId === senderId) {
      return res.status(400).json({ message: "Invalid receiver" });
    }
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });

    res.json({ message: "Message sent successfully", data: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    const otherUserId = Number(req.query.userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!otherUserId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendDirectMessageWithPost = async (req, res) => {
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

exports.deleteMessage = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    const messageId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!messageId) {
      return res.status(400).json({ message: "Invalid message id" });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    if (message.senderId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.message.delete({ where: { id: messageId } });

    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.editMessage = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    const messageId = Number(req.params.id);
    const newContent =
      typeof req.body.content === "string" ? req.body.content : null;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!messageId) {
      return res.status(400).json({ message: "Invalid message id" });
    }
    if (!newContent) {
      return res.status(400).json({ message: "Content is required" });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    if (message.senderId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { content: newContent },
    });

    res.json({ message: "Message updated", data: updatedMessage });
    } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

