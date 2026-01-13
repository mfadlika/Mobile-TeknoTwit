const express = require("express");
const auth = require("../middleware/auth");
const {
  sendFriendRequest,
  getPendingRequests,
  respondToRequest,
  getFriends,
  removeFriend,
} = require("../controller/friendController");

const friendRouter = express.Router();

friendRouter.post("/request", auth, sendFriendRequest);
friendRouter.get("/requests", auth, getPendingRequests);
friendRouter.patch("/requests/:id", auth, respondToRequest);
friendRouter.get("/", auth, getFriends);
friendRouter.delete("/:id", auth, removeFriend);

module.exports = friendRouter;
