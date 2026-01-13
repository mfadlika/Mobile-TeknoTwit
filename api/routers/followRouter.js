const express = require("express");
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
} = require("../controller/followController");
const auth = require("../middleware/auth");

const followrouter = express.Router();

followrouter.post("/follow/:userId", auth, followUser);
followrouter.post("/unfollow/:userId", auth, unfollowUser);
followrouter.get("/followers/:userId", getFollowers);
followrouter.get("/following/:userId", getFollowing);
followrouter.get("/status/:userId", auth, checkFollowStatus);

module.exports = followrouter;
