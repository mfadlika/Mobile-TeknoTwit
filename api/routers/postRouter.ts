import express from "express";
import {
  getPosts,
  getPost,
  getPostsByUser,
  getFollowingPosts,
  createPost,
  createPosture,
  repostPost,
  unrepostPost,
  likePost,
  unlikePost,
} from "../controller/postController";
import auth from "../middleware/auth";

const postRouter = express.Router();

// Get posts from followed users (requires auth)
postRouter.get("/following/feed", auth, getFollowingPosts);

// Get posts by user
postRouter.get("/user/:userId", getPostsByUser);

// Get post by id
postRouter.get("/:id", getPost);

// Get all posts
postRouter.get("/", getPosts);

// Create post (requires auth)
postRouter.post("/", auth, createPost);

// Create picture post
postRouter.post("/picture", auth, createPosture);

// Like / Unlike
postRouter.post("/:id/like", auth, likePost);
postRouter.delete("/:id/like", auth, unlikePost);

// Repost routes
postRouter.post("/:id/repost", auth, repostPost);
postRouter.delete("/:id/repost", auth, unrepostPost);

export default postRouter;
