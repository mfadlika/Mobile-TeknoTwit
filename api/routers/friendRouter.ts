import express from "express";
import auth from "../middleware/auth";
import {
  sendFriendRequest,
  getPendingRequests,
  respondToRequest,
  getFriends,
  removeFriend,
} from "../controller/friendController";

const friendRouter = express.Router();

friendRouter.post("/request", auth, sendFriendRequest);
friendRouter.get("/requests", auth, getPendingRequests);
friendRouter.patch("/requests/:id", auth, respondToRequest);
friendRouter.get("/", auth, getFriends);
friendRouter.delete("/:id", auth, removeFriend);

export default friendRouter;
