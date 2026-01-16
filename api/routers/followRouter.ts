import express from "express";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
} from "../controller/followController";
import auth from "../middleware/auth";

const followrouter = express.Router();

followrouter.post("/follow/:userId", auth, followUser);
followrouter.post("/unfollow/:userId", auth, unfollowUser);
followrouter.get("/followers/:userId", getFollowers);
followrouter.get("/following/:userId", getFollowing);
followrouter.get("/status/:userId", auth, checkFollowStatus);

export default followrouter;
