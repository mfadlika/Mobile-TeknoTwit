const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET all users
exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET user by ID
exports.getUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET user by username
exports.getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user by ID delete user
exports.deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};