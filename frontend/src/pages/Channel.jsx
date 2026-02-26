import { useEffect, useState, useCallback } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/useAuth";
import "./Channel.css";

export default function Channel({ username, onBack, onOpenVideo }) {
  const { user } = useAuth();

  const [creator, setCreator] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");

  const isOwnChannel = user?.username === username;

  // Load channel data
  const loadChannel = useCallback(async () => {
    try {
      setLoading(true);

      const [userRes, videoRes] = await Promise.all([
        axios.get(`/users/${username}`),
        axios.get(`/videos/user/${username}`),
      ]);

      setCreator(userRes.data);
      setVideos(videoRes.data);
    } catch (err) {
      console.error("Channel load error:", err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadChannel();
  }, [loadChannel]);

  // Subscribe / Unsubscribe
  const handleSubscribe = async () => {
    if (!creator || subscribing) return;

    try {
      setSubscribing(true);

      if (creator.isSubscribed) {
        await axios.delete(`/users/subscribe/${creator._id}`);
      } else {
        await axios.post(`/users/subscribe/${creator._id}`);
      }

      // 🔥 Always reload creator from backend (source of truth)
      await loadChannel();
    } catch (err) {
      console.error("Subscribe error:", err);
    } finally {
      setSubscribing(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return 0;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  if (loading) {
    return (
      <div className="channel-page">
        <div className="channel-topbar">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
        </div>
        <div className="channel-loading">
          <div className="loading-spinner"></div>
          <p>Loading channel...</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="channel-page">
        <div className="channel-topbar">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
        </div>
        <div className="channel-error">
          <div className="error-icon">🔍</div>
          <h3>Channel not found</h3>
          <p>The channel you're looking for doesn't exist</p>
          <button className="back-home-btn" onClick={onBack}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="channel-page">
      {/* Banner */}
      <div className="channel-banner">
        <div className="banner-overlay"></div>
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Channel Header */}
      <div className="channel-header">
        <img
          src={creator.avatar || "https://via.placeholder.com/120"}
          alt={creator.username}
          className="channel-avatar"
        />

        <div className="channel-info">
          <h1 className="channel-name">
            {creator.fullName || creator.username}
          </h1>
          <p className="channel-username">@{creator.username}</p>

          <div className="channel-stats">
            <div className="stat-item">
              <span className="stat-value">
                {formatNumber(creator.subscribersCount)}
              </span>
              <span className="stat-label">subscribers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatNumber(videos.length)}</span>
              <span className="stat-label">videos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {formatNumber(creator.totalViews)}
              </span>
              <span className="stat-label">views</span>
            </div>
          </div>

          {creator.bio && <p className="channel-bio">{creator.bio}</p>}
        </div>

        {/* Subscribe Button */}
        {!isOwnChannel && (
          <button
            className={`subscribe-btn ${
              creator.isSubscribed ? "subscribed" : ""
            }`}
            onClick={handleSubscribe}
            disabled={subscribing}
          >
            {subscribing
              ? "Processing..."
              : creator.isSubscribed
              ? "Subscribed"
              : "Subscribe"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="channel-tabs">
        <button
          className={`tab-btn ${activeTab === "videos" ? "active" : ""}`}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </button>
        <button
          className={`tab-btn ${activeTab === "playlists" ? "active" : ""}`}
          onClick={() => setActiveTab("playlists")}
        >
          Playlists
        </button>
        <button
          className={`tab-btn ${activeTab === "about" ? "active" : ""}`}
          onClick={() => setActiveTab("about")}
        >
          About
        </button>
      </div>

      {/* Content */}
      <div className="channel-content">
        {activeTab === "videos" && (
          <div className="videos-section">
            {videos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎬</div>
                <h3>No videos yet</h3>
                <p>This channel hasn't uploaded any videos</p>
              </div>
            ) : (
              <div className="video-grid">
                {videos.map((video) => (
                  <div
                    key={video._id}
                    className="video-card"
                    onClick={() => onOpenVideo(video)}
                  >
                    <div className="thumbnail-wrapper">
                      <img
                        src={
                          video.thumbnail ||
                          "https://via.placeholder.com/320x180"
                        }
                        alt={video.title}
                        className="video-thumb"
                        loading="lazy"
                      />
                      {video.duration && (
                        <span className="duration-badge">
                          {video.duration}
                        </span>
                      )}
                    </div>

                    <div className="video-info">
                      <h4 className="video-title">{video.title}</h4>
                      <div className="video-meta">
                        <span>{formatNumber(video.views)} views</span>
                        <span className="dot">•</span>
                        <span>
                          {new Date(video.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "playlists" && (
          <div className="playlists-section">
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No playlists yet</h3>
              <p>This channel hasn't created any playlists</p>
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="about-section">
            <div className="about-card">
              <h3>Description</h3>
              <p>{creator.bio || "This user hasn't added a bio yet."}</p>

              <div className="about-details">
                <div className="detail-item">
                  <span className="detail-label">Joined</span>
                  <span className="detail-value">
                    {new Date(creator.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Views</span>
                  <span className="detail-value">
                    {formatNumber(creator.totalViews)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Country</span>
                  <span className="detail-value">
                    {creator.country || "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}