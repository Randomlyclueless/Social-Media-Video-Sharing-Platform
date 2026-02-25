import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import axios from "../api/axios";
import "./Home.css";

const CATEGORIES = ["All", "Europe", "Asia", "Africa", "Americas", "Oceania"];

const STATS = [
  { val: "12.4K", label: "Videos" },
  { val: "186",   label: "Countries" },
  { val: "4.2M",  label: "Travelers" },
];

const formatViews = (num) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000)     return (num / 1_000).toFixed(1) + "K";
  return String(num);
};

const formatDuration = (sec) => {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const mapVideo = (v) => ({
  id:       v._id,
  title:    v.title,
  location: v.owner?.fullName || "Creator",
  views:    formatViews(v.views || 0),
  duration: formatDuration(v.duration),
  thumb:    v.thumbnailUrl || v.videoUrl,
  videoUrl: v.videoUrl,
  owner:    v.owner,
  category: v.category || "General",
});

export default function Home({ onProfile, onUpload, onOpenVideo }) {
  const { user, logout } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [loaded, setLoaded] = useState(false);
  const [videos, setVideos] = useState([]);

  // Page load animation
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Fetch videos — setState called inside .then() callback, not effect body directly
  useEffect(() => {
    const controller = new AbortController();

    axios
      .get("/videos", { signal: controller.signal })
      .then((res) => {
        const dbVideos = res.data?.data?.videos ?? [];
        setVideos(dbVideos.map(mapVideo));
      })
      .catch((err) => {
        if (err.name !== "CanceledError") {
          console.error("Video fetch failed", err);
        }
      });

    return () => controller.abort();
  }, []);

  const filtered =
    activeCategory === "All"
      ? videos
      : videos.filter((v) => v.category === activeCategory);

  return (
    <div className="trizo-page">

      {/* ── Top Bar ── */}
      <header className="topbar">
        <div className="logo">Tri<span>zo</span></div>

        <div className="topbar-center">
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input className="search-input" placeholder="Search destinations…" />
          </div>
        </div>

        <div className="topbar-right">
          <button className="upload-nav-btn" onClick={onUpload}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload
          </button>

          <button className="notif-btn" aria-label="Notifications">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="notif-dot" />
          </button>

          <div className="avatar-wrap" onClick={onProfile}>
            <img src={user.avatar} alt="avatar" className="avatar" />
            <span className="avatar-name">{user.fullName?.split(" ")[0]}</span>
          </div>

          <button className="logout-btn" onClick={logout}>Sign out</button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className={`hero${loaded ? " loaded" : ""}`}>
        <p className="hero-greeting">Welcome back, {user.fullName?.split(" ")[0]}</p>
        <h1 className="hero-title">
          Discover your next<br /><em>great adventure</em>
        </h1>
        <p className="hero-sub">
          Handpicked travel films from explorers worldwide. Find your next destination.
        </p>

        <div className="stats-row">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <span className="stat-val">{s.val}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <div className="categories-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-pill${activeCategory === cat ? " active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Feed ── */}
      <div className="section-heading">
        <h2 className="section-title">Trending Now</h2>
        <button className="section-link">See all →</button>
      </div>

      <div className="video-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p className="empty-text">No videos found in this category.</p>
          </div>
        ) : (
          filtered.map((video) => (
            <div
              key={video.id}
              className="video-card"
              onClick={() => onOpenVideo(video)}
            >
              <div className="thumb-wrap">
                <img src={video.thumb} alt={video.title} className="thumb" />
                <div className="thumb-overlay">
                  <div className="play-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#080c14">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                </div>
                {video.duration && (
                  <span className="duration-tag">{video.duration}</span>
                )}
                <span className="category-tag">{video.category}</span>
              </div>

              <div className="card-body">
                <div className="card-title">{video.title}</div>
                <div className="card-meta">
                  <div className="card-location">
                    <span className="loc-dot" />
                    {video.location}
                  </div>
                  <span className="card-views">{video.views} views</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}