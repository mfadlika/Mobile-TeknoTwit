const express = require("express");
const auth = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
  deleteProfile,
  getMyProfile,
  deleteMyProfile,
  sendDirectMessage,
} = require("../controller/profileController");

const profileRouter = express.Router();

profileRouter.get("/me/profile", auth, getMyProfile);
profileRouter.delete("/me/profile", auth, deleteMyProfile);
profileRouter.post("/dm", auth, sendDirectMessage);
profileRouter.get("/:userId", getProfile);
profileRouter.put("/:userId", auth, updateProfile);
profileRouter.delete("/:userId", auth, deleteProfile);

module.exports = profileRouter;
