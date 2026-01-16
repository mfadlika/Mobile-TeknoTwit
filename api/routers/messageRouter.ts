import express from "express";
import auth from "../middleware/auth";
import {
  sendMessage,
  getMessages,
  deleteMessage,
  editMessage,
} from "../controller/messageController";

const messageRouter = express.Router();

messageRouter.post("/", auth, sendMessage);
messageRouter.get("/", auth, getMessages);
messageRouter.delete("/:id", auth, deleteMessage);
messageRouter.patch("/:id", auth, editMessage);

export default messageRouter;
