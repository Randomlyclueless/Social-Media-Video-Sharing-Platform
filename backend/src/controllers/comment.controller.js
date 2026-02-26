import { Comment } from "../models/comment.models.js";

export const getVideoComments = async (req, res) => {
  try {
    const comments = await Comment.find({ video: req.params.id })
      .populate("owner", "fullName avatar")
      .sort({ createdAt: -1 });

    res.json({ data: comments });
  } catch (e) {
    res.status(500).json({ message: "Failed to load comments" });
  }
};

export const addComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      video: req.params.id,
      owner: req.user.id,
      content: req.body.content,
    });

    const populated = await comment.populate(
      "owner",
      "fullName avatar"
    );

    res.json({ data: populated });
  } catch (e) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.sendStatus(404);
    if (comment.owner.toString() !== req.user.id)
      return res.sendStatus(403);

    await comment.deleteOne();

    res.json({ success: true });
  } catch {
    res.sendStatus(500);
  }
};