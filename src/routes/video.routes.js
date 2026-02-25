import express from "express";
import multer from "multer";

import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  deleteVideo,
  toggleLike,
  toggleSave,
  getSavedVideos,
  getMyVideos,
  addToHistory,
  getHistory,
} from "../controllers/video.controller.js";

import { verifyJWT as protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ================= MULTER ================= */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
});

/* =========================================================
   IMPORTANT: specific routes FIRST → dynamic /:id LAST
   ========================================================= */

/* ================= PUBLIC ================= */

// all videos feed
router.get("/", getAllVideos);

// saved playlist
router.get("/saved/me", protect, getSavedVideos);

// my uploaded videos
router.get("/user/me", protect, getMyVideos);

// watch history
router.get("/history/me", protect, getHistory);

// single video
router.get("/:id", getVideoById);

/* ================= ENGAGEMENT ================= */

// like / unlike
router.post("/:id/like", protect, toggleLike);

// save / unsave
router.post("/:id/save", protect, toggleSave);

// add to history (called when video plays)
router.post("/:id/history", protect, addToHistory);

/* ================= UPLOAD ================= */

router.post(
  "/upload",
  protect,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo
);

/* ================= DELETE ================= */

router.delete("/:id", protect, deleteVideo);

export default router;