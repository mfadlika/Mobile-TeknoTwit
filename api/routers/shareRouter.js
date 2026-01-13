const express = require("express");
const auth = require("../middleware/auth");
const {
  sendDirectMessage,
  getDirectMessages,
} = require("../controller/shareController");

const shareRouter = express.Router();

shareRouter.post("/dm", auth, sendDirectMessage);
shareRouter.get("/dm", auth, getDirectMessages);

module.exports = shareRouter;
