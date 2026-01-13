const express = require("express");
const {
  getUsers,
  getUser,
  getUserByUsername,
} = require("../controller/userController");
const { postLogin, postSignUp, postLogout } = require("../controller/loginController");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const userRouter = express.Router();

userRouter.get("/", getUsers);

// get user by username
userRouter.get("/username/:username", getUserByUsername);

// userRouter.get("/:id", getUser);
userRouter.get("/:id", getUser);

userRouter.post("/signup", postSignUp);

userRouter.post("/login", postLogin);

userRouter.delete("/logout", postLogout);

module.exports = userRouter;
