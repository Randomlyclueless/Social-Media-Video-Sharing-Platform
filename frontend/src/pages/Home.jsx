import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/useAuth";
import axios from "../api/axios";
import "./Home.css";

const CATEGORIES = ["All", "Europe", "Asia", "Africa", "Americas", "Oceania"];

const formatViews = (num) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return String(num);
};

const formatDuration = (sec) => {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const mapVideo = (v) => ({
  id: v._id,
  title: v.title,
  location: v.owner?.fullName || "Creator",
  ownerUsername: v.owner?.username,
  viewsRaw: v.views || 0,
  views: formatViews(v.views || 0),
  duration: formatDuration(v.duration),
  thumb: v.thumbnailUrl || v.videoUrl,
  videoUrl: v.videoUrl,
  owner: v.owner,
  category: v.category || "General",
  createdAt: v.createdAt,
});

// Custom debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

export default function Home({ onProfile, onUpload, onOpenVideo, onChannel }) {
  const { user, logout } = useAuth();

  const [activeCategory, setActiveCategory] = useState("All");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Search states
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [sort, setSort] = useState("latest");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Fetch initial videos
  useEffect(() => {
    let isMounted = true;
    
    const fetchVideos = async () => {
      try {
        setLoading(true);
        // Build URL with search params if search exists
        let url = "/videos";
        if (search.trim()) {
          url += `?search=${encodeURIComponent(search)}`;
        }
        if (activeCategory !== "All") {
          url += search.trim() ? `&category=${activeCategory}` : `?category=${activeCategory}`;
        }
        
        const res = await axios.get(url);
        if (isMounted) {
          const dbVideos = res.data?.data?.videos ?? [];
          setVideos(dbVideos.map(mapVideo));
        }
      } catch (err) {
        if (isMounted) {
          console.error("Video fetch failed", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setTimeout(() => setHeroLoaded(true), 100);
        }
      }
    };

    fetchVideos();

    return () => {
      isMounted = false;
    };
  }, [search, activeCategory]);

  // Debounced search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      if (searchTerm.trim()) {
        setSearchLoading(true);
        // The useEffect above will trigger with the new search value
      }
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim()) {
      setSearchLoading(true);
      debouncedSearch(value);
    } else {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearch("");
    setSearchLoading(false);
  };

  // Sort videos
  const sortedVideos = useMemo(() => {
    let sorted = [...videos];
    
    if (sort === "views") {
      sorted = sorted.sort((a, b) => b.viewsRaw - a.viewsRaw);
    } else {
      sorted = sorted.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    
    return sorted;
  }, [videos, sort]);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="trizo-page">
      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-left"></div>

        <div className={`topbar-center ${showMobileSearch ? 'mobile-show' : ''}`}>
          <div className="search-wrap">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              className="search-input"
              placeholder="Search videos or creators…"
              value={search}
              onChange={handleSearchChange}
            />
            
            {searchLoading && (
              <div className="search-loading">
                <div className="search-spinner"></div>
              </div>
            )}
            
            {search && !searchLoading && (
              <button 
                className="search-clear"
                onClick={clearSearch}
                type="button"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Search suggestions / results count */}
          {search && !loading && (
            <div className="search-meta">
              Found {sortedVideos.length} {sortedVideos.length === 1 ? 'result' : 'results'}
            </div>
          )}
        </div>

        <div className="topbar-right">
          <button 
            className="mobile-search-toggle" 
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          <button className="upload-nav-btn" onClick={onUpload} type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="upload-text">Upload</span>
          </button>

          <button className="notif-btn" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="notif-dot"></span>
          </button>

          <div className="avatar-wrap" onClick={onProfile}>
            <img 
              src={user?.avatar || "https://via.placeholder.com/34"} 
              alt="avatar" 
              className="avatar" 
            />
            <span className="avatar-name">
              {user?.fullName?.split(" ")[0] || "User"}
            </span>
          </div>

          <button className="logout-btn" onClick={logout} type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="logout-text">Sign out</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className={`hero ${heroLoaded ? 'loaded' : ''}`}>
        <div className="hero-greeting">{getGreeting()}, {user?.fullName?.split(' ')[0]}</div>
        <h1 className="hero-title">
          Discover the <em>world</em>
        </h1>
        <p className="hero-sub">
          Explore breathtaking destinations through the lens of Trizo!!
        </p>
      </div>

      {/* Categories + Sort */}
      <div className="categories-wrap">
        <div className="categories-scroll">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-pill${
                activeCategory === cat ? " active" : ""
              }`}
              onClick={() => setActiveCategory(cat)}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="sort-wrap">
          <label className="sort-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
          </label>
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Section Heading */}
      <div className="section-heading">
        <h2 className="section-title">
          {search ? `Search Results for "${search}"` : 
           activeCategory === "All" ? "All Videos" : `${activeCategory} Videos`}
          {!loading && (
            <span className="result-count">
              ({sortedVideos.length} {sortedVideos.length === 1 ? 'video' : 'videos'})
            </span>
          )}
        </h2>
        {search && (
          <button 
            className="clear-search-btn"
            onClick={clearSearch}
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="video-grid loading-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="video-card skeleton">
              <div className="thumb-wrap skeleton-thumb"></div>
              <div className="card-body">
                <div className="skeleton-title"></div>
                <div className="skeleton-meta"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="video-grid">
          {sortedVideos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No videos found</h3>
              <p className="empty-text">
                {search ? `No results for "${search}"` : "No videos in this category"}
              </p>
              <button 
                className="empty-reset"
                onClick={() => {
                  clearSearch();
                  setActiveCategory("All");
                }}
                type="button"
              >
                Clear filters
              </button>
            </div>
          ) : (
            sortedVideos.map((video, index) => (
              <div 
                key={video.id} 
                className="video-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className="thumb-wrap"
                  onClick={() => onOpenVideo(video)}
                >
                  <img
                    src={video.thumb || "https://via.placeholder.com/320x180"}
                    alt={video.title}
                    className="thumb"
                    loading="lazy"
                  />
                  <div className="thumb-overlay">
                    <div className="play-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                  {video.duration && (
                    <span className="duration-tag">
                      {video.duration}
                    </span>
                  )}
                  {video.category && video.category !== "General" && (
                    <span className="category-tag">
                      {video.category}
                    </span>
                  )}
                </div>

                <div className="card-body">
                  <h3 className="card-title">{video.title}</h3>

                  <div className="card-meta">
                    <div
                      className="card-location"
                      onClick={() => onChannel(video.ownerUsername)}
                    >
                      <span className="loc-dot"></span>
                      {video.location}
                    </div>

                    <span className="card-views">
                      {video.views} views
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}