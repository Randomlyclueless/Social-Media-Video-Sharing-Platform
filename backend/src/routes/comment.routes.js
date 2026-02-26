import express from "express";
import {
  getVideoComments,
  addComment,
  deleteComment,
} from "../controllers/comment.controller.js";

import { verifyJWT as protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/videos/:id/comments", getVideoComments);
router.post("/videos/:id/comments", protect, addComment);
router.delete("/comments/:id", protect, deleteComment);

export default router;