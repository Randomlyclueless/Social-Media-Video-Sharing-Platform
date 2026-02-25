import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import axios from "../api/axios";
import "./Profile.css";

export default function Profile({ onEdit, onAvatar, onBack }) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("videos");
  const[following,setFollowing] = useState(false);
  const [subsCount,setSubsCount] = useState(
    user.subscribers?.length || user.subscriberCount ||0
  );

  // follow handler
  const handleFollow = async()=>{
    try{
      const res = await axios.post(`/users/${user._id}/follow`);
      setFollowing(res.data.data.following);
      setSubsCount(res.data.data.subscribersCount);
    }catch{
      console.log("Follow failed");
    }
  }

  if (!user) return null;

  return (
    <div className="page">
      <div className="container">
        <button className="back" onClick={onBack}>
          ← Back
        </button>

        {/* HEADER */}
        <div className="header">
          <img src={user.avatar} alt="" className="avatar" />

          <div style={{ flex: 1 }}>
            <h2 className="name">{user.fullName}</h2>
            <div className="username">@{user.username}</div>
            <div className="email">{user.email}</div>

            <div className="stats">
              <div><b>{user.videoCount || 0}</b> Videos</div>
              <div><b>{user.playlistCount || 0}</b> Playlists</div>
              <div>{subsCount} Subscribers </div>
            </div>
          </div>

          <div className="actions">
            <button className="smallBtn" onClick={onAvatar}>
              Change Avatar
            </button>
            <button className="smallBtn" onClick={onEdit}>
              Edit
            </button>
            <button className="followBtn" onClick={handleFollow}>
              {following ? "Following" : "Follow"}
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          {["videos", "playlists", "history", "subscribers"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="tab"
              style={{
                borderBottom:
                  tab === t ? "2px solid #6366f1" : "none",
              }}
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

  useEffect(() => {
    const load = async () => {
      const res = await axios.get("/videos/user/me");
      setVideos(res.data.data || []);
    };
    load();
  }, []);

  if (!videos.length) return <div>No uploaded videos</div>;

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

  useEffect(() => {
    const load = async () => {
      const res = await axios.get("/videos/saved/me");
      setVideos(res.data.data || []);
    };
    load();
  }, []);

  if (!videos.length) return <div>No saved videos</div>;

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

  useEffect(() => {
    const load = async () => {
      const res = await axios.get("/videos/history/me");
      setVideos(res.data.data || []);
    };
    load();
  }, []);

  if (!videos.length) return <div>No watch history</div>;

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
  return <div>Subscribers feature coming next</div>;
}

/* ================= VIDEO CARD ================= */

function VideoCard({ video }) {
  return (
    <div className="card">
      <img src={video.thumbnailUrl} alt="" className="thumb" />
      <div className="title">{video.title}</div>
    </div>
  );
}