import express from "express";
import auth from "../middleware/auth";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  getMyProfile,
  deleteMyProfile,
  sendDirectMessage,
} from "../controller/profileController";

const profileRouter = express.Router();

profileRouter.get("/me/profile", auth, getMyProfile);
profileRouter.delete("/me/profile", auth, deleteMyProfile);
profileRouter.post("/dm", auth, sendDirectMessage);
profileRouter.get("/:userId", getProfile);
profileRouter.put("/:userId", auth, updateProfile);
profileRouter.delete("/:userId", auth, deleteProfile);

export default profileRouter;
