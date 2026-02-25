import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import axios from "../api/axios";
import "./Profile.css";

export default function Profile({ onEdit, onAvatar, onBack }) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("videos");
  const [following, setFollowing] = useState(false);
  const [subsCount, setSubsCount] = useState(
    user.subscribers?.length || user.subscriberCount || 0
  );
  const [loading, setLoading] = useState(false);

  // follow handler
  const handleFollow = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`/users/${user._id}/follow`);
      setFollowing(res.data.data.following);
      setSubsCount(res.data.data.subscribersCount);
    } catch {
      console.log("Follow failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page">
      <div className="container">
        <button className="back" onClick={onBack}>
          <span>←</span> Back to Dashboard
        </button>

        {/* HEADER */}
        <div className="header">
          <img 
            src={user.avatar || "https://via.placeholder.com/120"} 
            alt={user.fullName} 
            className="avatar" 
          />

          <div className="userInfo">
            <h2 className="name">{user.fullName}</h2>
            <div className="username">{user.username}</div>
            <div className="email">{user.email}</div>

            <div className="stats">
              <div className="statCard">
                <div className="statValue">{user.videoCount || 0}</div>
                <div className="statLabel">Videos</div>
              </div>
              <div className="statCard">
                <div className="statValue">{user.playlistCount || 0}</div>
                <div className="statLabel">Playlists</div>
              </div>
              <div className="statCard">
                <div className="statValue">{subsCount}</div>
                <div className="statLabel">Subscribers</div>
              </div>
            </div>
          </div>

          <div className="actions">
            <button className="actionBtn primaryBtn" onClick={onAvatar}>
              <span>📸</span> Change Avatar
            </button>
            <button className="actionBtn secondaryBtn" onClick={onEdit}>
              <span>✏️</span> Edit Profile
            </button>
            <button 
              className={`actionBtn ${following ? 'secondaryBtn' : 'followBtn'}`} 
              onClick={handleFollow}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <span>{following ? '✓' : '+'}</span>
                  {following ? 'Following' : 'Follow'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          {["videos", "playlists", "history", "subscribers"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tab ${tab === t ? 'active' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="content">
          {tab === "videos" && <VideosTab />}
          {tab === "playlists" && <PlaylistsTab />}
          {tab === "history" && <HistoryTab />}
          {tab === "subscribers" && <SubscribersTab />}
        </div>

        <button className="logout" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

/* ================= VIDEOS TAB ================= */
function VideosTab() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/videos/user/me");
        setVideos(res.data.data || []);
      } catch (error) {
        console.error("Failed to load videos:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card skeleton" style={{ height: "200px" }}></div>
        ))}
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="emptyState">
        <div className="emptyIcon">🎬</div>
        <h3 className="emptyTitle">No videos yet</h3>
        <p className="emptyText">Upload your first video to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {videos.map(v => (
        <VideoCard key={v._id} video={v} />
      ))}
    </div>
  );
}

/* ================= PLAYLISTS TAB ================= */
function PlaylistsTab() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/videos/saved/me");
        setVideos(res.data.data || []);
      } catch (error) {
        console.error("Failed to load playlists:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card skeleton" style={{ height: "200px" }}></div>
        ))}
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="emptyState">
        <div className="emptyIcon">📋</div>
        <h3 className="emptyTitle">No playlists yet</h3>
        <p className="emptyText">Create playlists to organize your favorite videos!</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {videos.map(v => (
        <VideoCard key={v._id} video={v} />
      ))}
    </div>
  );
}

/* ================= HISTORY TAB ================= */
function HistoryTab() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/videos/history/me");
        setVideos(res.data.data || []);
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card skeleton" style={{ height: "200px" }}></div>
        ))}
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="emptyState">
        <div className="emptyIcon">⏱️</div>
        <h3 className="emptyTitle">No watch history</h3>
        <p className="emptyText">Videos you watch will appear here!</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {videos.map(v => (
        <VideoCard key={v._id} video={v} />
      ))}
    </div>
  );
}

/* ================= SUBSCRIBERS TAB ================= */
function SubscribersTab() {
  return (
    <div className="emptyState">
      <div className="emptyIcon">👥</div>
      <h3 className="emptyTitle">Subscribers Coming Soon!</h3>
      <p className="emptyText">We're working on bringing you subscriber management features.</p>
    </div>
  );
}

/* ================= VIDEO CARD ================= */
function VideoCard({ video }) {
  // Format views count
  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };

  // Format time (mock function - replace with actual video duration)
  const formatDuration = () => {
    return "10:30"; // Mock duration
  };

  return (
    <div className="card">
      <div className="thumbnail">
        <img 
          src={video.thumbnailUrl || "https://via.placeholder.com/220x140"} 
          alt={video.title} 
          className="thumb" 
        />
        <span className="duration">{formatDuration()}</span>
      </div>
      <div className="videoInfo">
        <h4 className="videoTitle">{video.title}</h4>
        <div className="videoMeta">
          <span>👁️ {formatViews(video.views || 0)}</span>
          <span>❤️ {video.likes || 0}</span>
          <span>📅 {new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}