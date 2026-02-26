import express from "express";
import {
  subscribeToChannel,
  unsubscribeFromChannel,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/users/subscribe/:channelId", verifyJWT, subscribeToChannel);
router.delete("/users/subscribe/:channelId", verifyJWT, unsubscribeFromChannel);

export default router;