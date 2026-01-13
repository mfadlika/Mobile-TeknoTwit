const express = require("express");
const auth = require("../middleware/auth");
const {
  sendMessage,
  getMessages,
  deleteMessage,
  editMessage,
} = require("../controller/messageController");

const messageRouter = express.Router();

messageRouter.post("/", auth, sendMessage);
messageRouter.get("/", auth, getMessages);
messageRouter.delete("/:id", auth, deleteMessage);
messageRouter.patch("/:id", auth, editMessage);

module.exports = messageRouter;