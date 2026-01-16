import express from "express";
import {
  getUsers,
  getUser,
  getUserByUsername,
} from "../controller/userController";
import { postLogin, postSignUp, postLogout } from "../controller/loginController";

const userRouter = express.Router();

userRouter.get("/", getUsers);

// get user by username
userRouter.get("/username/:username", getUserByUsername);

// userRouter.get("/:id", getUser);
userRouter.get("/:id", getUser);

userRouter.post("/signup", postSignUp);

userRouter.post("/login", postLogin);

userRouter.delete("/logout", postLogout);

export default userRouter;
