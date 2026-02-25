import Video from "../models/video.models.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
/* ================= CLOUDINARY UPLOAD ================= */
const uploadToCloudinary = (buffer, resourceType) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

/* ================= UPLOAD VIDEO ================= */
const uploadVideo = asyncHandler(async (req, res) => {
  const { title, category } = req.body;
  const videoFile = req.files?.video?.[0];
  const thumbFile = req.files?.thumbnail?.[0];

  if (!videoFile) throw new ApiError(400, "Video file is required");
  if (!title?.trim()) throw new ApiError(400, "Title is required");

  const videoUpload = await uploadToCloudinary(videoFile.buffer, "video");

  let thumbUrl = "";
  if (thumbFile) {
    const thumbUpload = await uploadToCloudinary(thumbFile.buffer, "image");
    thumbUrl = thumbUpload.secure_url;
  }

  const videoDoc = await Video.create({
    title: title.trim(),
    category: category || "General",
    videoUrl: videoUpload.secure_url,
    thumbnailUrl: thumbUrl,
    owner: req.user._id,
    duration: videoUpload.duration,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, videoDoc, "Video uploaded successfully"));
});
/* ================= GET MY VIDEOS ================= */
const getMyVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({
    owner: req.user._id,
  })
    .populate("owner", "fullName avatar")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, videos, "My videos fetched")
  );
});
/* ================= GET ALL VIDEOS ================= */
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, category } = req.query;

  const filter = category && category !== "All" ? { category } : {};

  const videos = await Video.find(filter)
    .populate("owner", "fullName avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Video.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      { videos, total, page: Number(page) },
      "Videos fetched successfully"
    )
  );
});

/* ================= GET VIDEO BY ID ================= */
const getVideoById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await Video.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate("owner", "fullName avatar");

  if (!video) throw new ApiError(404, "Video not found");

  // 👍 derive liked + saved state for frontend
  const userId = req.user?._id;

  const isLiked = userId
    ? video.likes.includes(userId)
    : false;

  const isSaved = userId
    ? video.savedBy?.includes(userId)
    : false;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...video.toObject(),
        likesCount: video.likes.length,
        isLiked,
        isSaved,
      },
      "Video fetched successfully"
    )
  );
});

/* ================= LIKE / UNLIKE ================= */
const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await Video.findById(id);
  if (!video) throw new ApiError(404, "Video not found");

  const userId = req.user._id;
  const alreadyLiked = video.likes.includes(userId);

  if (alreadyLiked) {
    video.likes.pull(userId);
  } else {
    video.likes.push(userId);
  }

  await video.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        liked: !alreadyLiked,
        likesCount: video.likes.length,
      },
      "Like toggled"
    )
  );
});

/* ================= SAVE / UNSAVE (PLAYLIST MVP) ================= */
const toggleSave = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await Video.findById(id);
  if (!video) throw new ApiError(404, "Video not found");

  const userId = req.user._id;

  if (!video.savedBy) video.savedBy = [];

  const alreadySaved = video.savedBy.includes(userId);

  if (alreadySaved) {
    video.savedBy.pull(userId);
  } else {
    video.savedBy.push(userId);
  }

  await video.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { saved: !alreadySaved },
      "Save toggled"
    )
  );
});

/* ================= GET SAVED VIDEOS ================= */
const getSavedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const videos = await Video.find({
    savedBy: userId,
  })
    .populate("owner", "fullName avatar")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      videos,
      "Saved videos fetched"
    )
  );
});
/* ================= ADD TO HISTORY ================= */
const addToHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { history: id },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Added to history"));
});

/* ================= GET HISTORY ================= */
const getHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: "history",
      populate: { path: "owner", select: "fullName avatar" },
    });

  return res
    .status(200)
    .json(new ApiResponse(200, user.history || [], "History fetched"));
});
/* ================= DELETE VIDEO ================= */
const deleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await Video.findById(id);
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this video");
  }

  await video.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

export {
  uploadVideo,
  getAllVideos,
  getVideoById,
  getMyVideos,
  deleteVideo,
  toggleLike,
  toggleSave,
  getSavedVideos,
  addToHistory,   // ⭐ add this
  getHistory,     // ⭐ add this
};