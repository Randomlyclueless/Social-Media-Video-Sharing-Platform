import { useEffect, useState } from "react";
import axios from "../api/axios";
import "./VideoPlayer.css";

export default function VideoPlayer({ video, onBack, onChannel }) {
  const [data, setData] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const [related, setRelated] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (!video?.id) return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/videos/${video.id}`);
        const v = res.data.data;

        setData(v);

        const likeCount = Array.isArray(v.likes)
          ? v.likes.length
          : v.likes || 0;

        setLikes(likeCount);
        setLiked(v.isLiked || false);
        setSaved(v.isSaved || false);
        setSubscribed(v.owner?.isSubscribed || false);

        const c = await axios.get(`/videos/${video.id}/comments`);
        setComments(c.data.data || []);

        // related videos (same category)
        const r = await axios.get("/videos");
        const all = r.data?.data?.videos || [];

        const rel = all.filter(
          (x) =>
            x._id !== v._id &&
            x.category === v.category
        );

        setRelated(rel.slice(0, 8));
      } catch (e) {
        console.error("Video load failed", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [video]);

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

  const toggleSubscribe = async () => {
  if (!data?.owner?._id) return;

  const prev = subscribed;
  setSubscribed(!prev); // optimistic update

  try {
    if (prev) {
      await axios.delete(`/users/subscribe/${data.owner._id}`);
    } else {
      await axios.post(`/users/subscribe/${data.owner._id}`);
    }

    // ✅ Reload from backend to get source of truth (same as Channel.jsx)
    const res = await axios.get(`/videos/${data._id}`);
    const v = res.data.data;
    setSubscribed(v.owner?.isSubscribed || false);

  } catch {
    setSubscribed(prev); // revert on error
  }
};

  const postComment = async () => {
    if (!newComment.trim() || !data) return;

    setCommentLoading(true);
    // const commentText = newComment;

    try {
      const res = await axios.post(
        `/videos/${data._id}/comments`,
        { content: newComment }
      );

      setComments((prev) => [res.data.data, ...prev]);
      setNewComment("");
    } catch {
      alert("Failed to post comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      postComment();
    }
  };

  if (loading) {
    return (
      <div className="video-player-page">
        <div className="player-loading">
          <div className="loading-spinner"></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="video-player-page">
      {/* Custom Header */}
      <header className="player-header">
        <button className="player-back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
      </header>

      <div className="player-layout">
        {/* Main Content */}
        <div className="player-main">
          {/* Video Container */}
          <div className="video-container">
            <video
              className="player-video"
              src={data.videoUrl}
              controls
              autoPlay
              poster={data.thumbnailUrl}
            />
          </div>

          {/* Video Info */}
          <div className="video-info-section">
            <h1 className="video-title">{data.title}</h1>
            
            <div className="video-stats-bar">
              <div className="video-views">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="2"/>
                  <path d="M22 12c-2.667 4.667-6 7-10 7s-7.333-2.333-10-7c2.667-4.667 6-7 10-7s7.333 2.333 10 7z"/>
                </svg>
                <span>{formatNumber(data.views || 0)} views</span>
              </div>
              
              <div className="video-actions">
                <button 
                  className={`action-btn like-btn ${liked ? 'active' : ''}`}
                  onClick={toggleLike}
                >
                  <svg viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span>{formatNumber(likes)}</span>
                </button>

                <button 
                  className={`action-btn save-btn ${saved ? 'active' : ''}`}
                  onClick={toggleSave}
                >
                  <svg viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>Save</span>
                </button>

                <button className="action-btn share-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Creator Info */}
            <div className="creator-section">
              <div className="creator-info">
                <img 
                  src={data.owner?.avatar || "https://via.placeholder.com/48"} 
                  alt={data.owner?.fullName}
                  className="creator-avatar"
                  onClick={() => onChannel(data.owner?.username)}
                />
                <div className="creator-details">
                  <h3 
                    className="creator-name"
                    onClick={() => onChannel(data.owner?.username)}
                  >
                    {data.owner?.fullName || "Creator"}
                  </h3>
                  <p className="creator-subscribers">
                    {formatNumber(data.owner?.subscribersCount || 0)} subscribers
                  </p>
                </div>
              </div>

              <button
                className={`subscribe-btn ${subscribed ? 'subscribed' : ''}`}
                onClick={toggleSubscribe}
              >
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Description */}
            <div className="video-description">
              <p>{data.description || "No description available."}</p>
              <div className="video-tags">
                {data.category && (
                  <span className="tag">{data.category}</span>
                )}
                {data.tags?.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="comments-section">
              <h3 className="comments-title">
                Comments <span className="comment-count">{comments.length}</span>
              </h3>

              <div className="comment-form">
                <img 
                  src={data.owner?.avatar || "https://via.placeholder.com/40"} 
                  alt="Your avatar"
                  className="comment-avatar"
                />
                <div className="comment-input-wrapper">
                  <textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="comment-input"
                    rows="1"
                  />
                  <button 
                    className="comment-submit"
                    onClick={postComment}
                    disabled={!newComment.trim() || commentLoading}
                  >
                    {commentLoading ? (
                      <span className="btn-spinner"></span>
                    ) : (
                      'Post'
                    )}
                  </button>
                </div>
              </div>

              <div className="comments-list">
                {comments.length === 0 ? (
                  <div className="no-comments">
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="comment-item">
                      <img
                        src={c.owner?.avatar || "https://via.placeholder.com/40"}
                        alt={c.owner?.fullName}
                        className="comment-avatar"
                      />
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">
                            {c.owner?.fullName || "User"}
                          </span>
                          <span className="comment-time">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="comment-text">{c.content}</p>
                        <div className="comment-actions">
                          <button className="comment-like">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            <span>Like</span>
                          </button>
                          <button className="comment-reply">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Videos Sidebar */}
        <div className="player-sidebar">
          <h3 className="sidebar-title">Related Videos</h3>
          <div className="related-list">
            {related.length === 0 ? (
              <p className="no-related">No related videos found</p>
            ) : (
              related.map((r) => (
                <div
                  key={r._id}
                  className="related-item"
                  onClick={() => onBack(r)}
                >
                  <div className="related-thumb">
                    <img
                      src={r.thumbnailUrl || r.videoUrl}
                      alt={r.title}
                      loading="lazy"
                    />
                    {r.duration && (
                      <span className="related-duration">{r.duration}</span>
                    )}
                  </div>
                  <div className="related-info">
                    <h4 className="related-title">{r.title}</h4>
                    <p className="related-creator">{r.owner?.fullName}</p>
                    <p className="related-stats">
                      {formatNumber(r.views || 0)} views
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}