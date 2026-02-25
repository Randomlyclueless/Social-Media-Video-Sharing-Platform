import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/ui.css";
import "./VideoPlayer.css";

export default function VideoPlayer({ video, onBack }) {
  const [data, setData] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!video?.id) return;

    const load = async () => {
      try {
        // 🎥 Load video
        const res = await axios.get(`/videos/${video.id}`);
        const v = res.data.data;

        setData(v);

        // ❤️ likes fix (array → count)
        const likeCount = Array.isArray(v.likes)
          ? v.likes.length
          : v.likes || 0;

        setLikes(likeCount);
        setLiked(v.isLiked || false);
        setSaved(v.isSaved || false);

        // 💬 Load comments
        const c = await axios.get(`/videos/${video.id}/comments`);
        setComments(c.data.data || []);
      } catch (e) {
        console.error("Video load failed", e);
      }
    };

    load();
  }, [video]);

  // ❤️ LIKE
  const toggleLike = async () => {
    if (!data) return;

    const prevLiked = liked;
    const prevLikes = likes;

    setLiked(!prevLiked);
    setLikes(prevLiked ? prevLikes - 1 : prevLikes + 1);

    try {
      const res = await axios.post(`/videos/${data._id}/like`);

      if (res.data?.likes !== undefined) {
        const count = Array.isArray(res.data.likes)
          ? res.data.likes.length
          : res.data.likes;

        setLikes(count);
        setLiked(res.data.liked);
      }
    } catch {
      setLiked(prevLiked);
      setLikes(prevLikes);
    }
  };

  // 🔗 SHARE
  const handleShare = async () => {
    if (!data?._id) return;

    const url = `${window.location.origin}/watch/${data._id}`;

    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    } catch {
      alert(url);
    }
  };

  // 💾 SAVE
  const toggleSave = async () => {
    if (!data) return;

    const prev = saved;
    setSaved(!prev);

    try {
      const res = await axios.post(`/videos/${data._id}/save`);
      if (res.data?.saved !== undefined) {
        setSaved(res.data.saved);
      }
    } catch {
      setSaved(prev);
    }
  };

  // 💬 POST COMMENT
  const postComment = async () => {
    if (!newComment.trim() || !data) return;

    try {
      const res = await axios.post(
        `/videos/${data._id}/comments`,
        { content: newComment }
      );

      setComments(prev => [res.data.data, ...prev]);
      setNewComment("");
    } catch {
      alert("Failed to comment");
    }
  };

  if (!data) return null;

  return (
    <div className="player-page">
      <button className="ui-back" onClick={onBack}>
        ← Back
      </button>

      <video
        className="player-video"
        src={data.videoUrl}
        controls
        autoPlay
      />

      <div className="player-info">
        <h2 className="player-title">{data.title}</h2>

        <div className="player-meta">
          <span>{data.owner?.fullName || "Creator"}</span>
          <span>•</span>
          <span>{data.views || 0} views</span>
          <span>•</span>
          <span>{data.category}</span>
        </div>

        {/* ACTIONS */}
        <div className="player-actions">
          <button
            className={`player-like ${liked ? "liked" : ""}`}
            onClick={toggleLike}
          >
            ❤️ {likes}
          </button>

          <button className="player-btn" onClick={handleShare}>
            🔗 Share
          </button>

          <button
            className={`player-btn ${saved ? "saved" : ""}`}
            onClick={toggleSave}
          >
            💾 Save
          </button>
        </div>

        {/* COMMENTS */}
        <div className="player-comments">
          <h3>Comments {comments.length}</h3>

          <div className="comment-input">
            <input
              placeholder="Add a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <button onClick={postComment}>Post</button>
          </div>

          <div className="comment-list">
            {comments.map(c => (
              <div key={c._id} className="comment">
                <img
                  src={c.owner?.avatar}
                  alt=""
                  className="comment-avatar"
                />
                <div>
                  <div className="comment-user">
                    {c.owner?.fullName || "User"}
                  </div>
                  <div className="comment-text">
                    {c.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}