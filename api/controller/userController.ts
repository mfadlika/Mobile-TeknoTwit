import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
const prisma = new PrismaClient();

// GET all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET user by ID
export const getUser = async (req: Request, res: Response) => {
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
export const getUserByUsername = async (req: Request, res: Response) => {
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
export const deleteUser = async (req: Request, res: Response) => {
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
