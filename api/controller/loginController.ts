import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";

const prisma = new PrismaClient();

const SECRET = process.env.JWT_SECRET || "dev_secret";

// User login controller (email + password)
export const postLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", userId: user.id, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// User signup controller
export const postSignUp = async (req: Request, res: Response) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, username, email and password are required" });
    }

    const normalizedUsername = String(username).trim();
    const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernamePattern.test(normalizedUsername)) {
      return res.status(400).json({
        message:
          "Username must be 3-20 characters and contain only letters, numbers, or underscore",
      });
    }

    // only allow teknokrat.ac.id emails
    const allowedDomain = "@teknokrat.ac.id";
    if (!String(email).toLowerCase().endsWith(allowedDomain)) {
      return res
        .status(400)
        .json({ message: `Only ${allowedDomain} emails are allowed` });
    }

    if (typeof password === "string" && password.length > 20) {
      return res
        .status(400)
        .json({ message: "Password must be 20 characters or less" });
    }
    if (!/\d/.test(String(password))) {
      return res
        .status(400)
        .json({ message: "Password must include at least one number" });
    }

    // check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }
    const existingUsername = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already in use" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        username: normalizedUsername,
        email,
        password,
      },
    });

    res.status(201).json({ message: "User created", userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const postLogout = async (req: Request, res: Response) => {
  res.json({ message: "Logout successful" });
};
