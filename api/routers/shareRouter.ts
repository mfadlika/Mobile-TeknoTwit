import express from "express";
import auth from "../middleware/auth";
import {
  sendDirectMessage,
  getDirectMessages,
} from "../controller/shareController";

const shareRouter = express.Router();

shareRouter.post("/dm", auth, sendDirectMessage);
shareRouter.get("/dm", auth, getDirectMessages);

export default shareRouter;
