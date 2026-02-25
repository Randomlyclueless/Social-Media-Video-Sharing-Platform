import { useEffect, useState } from "react";
import axios from "../api/axios";
import "./CreatorDashboard.css";

export default function CreatorDashboard({ onBack, onOpenVideo }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyVideos();
  }, []);

  const loadMyVideos = async () => {
    try {
      const res = await axios.get("/videos/user/me");
      setVideos(res.data.data || []);
    } catch (e) {
      console.error("Dashboard load failed", e);
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id) => {
    if (!confirm("Delete this video?")) return;

    try {
      await axios.delete(`/videos/${id}`);
      setVideos((prev) => prev.filter((v) => v._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="dash-page">
        <button className="dash-back" onClick={onBack}>
          ← Back
        </button>
        <p>Loading your videos…</p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <button className="dash-back" onClick={onBack}>
        ← Back
      </button>

      <h2 className="dash-title">Creator Dashboard</h2>

      {videos.length === 0 ? (
        <p className="dash-empty">You haven’t uploaded yet.</p>
      ) : (
        <div className="dash-grid">
          {videos.map((v) => (
            <div key={v._id} className="dash-card">
              <img
                src={v.thumbnailUrl || v.videoUrl}
                alt=""
                className="dash-thumb"
                onClick={() => onOpenVideo(v)}
              />

              <div className="dash-info">
                <div className="dash-name">{v.title}</div>

                <div className="dash-stats">
                  <span>👁 {v.views || 0}</span>
                  <span>❤️ {v.likes?.length || 0}</span>
                </div>

                <div className="dash-actions">
                  <button
                    className="dash-open"
                    onClick={() => onOpenVideo(v)}
                  >
                    Open
                  </button>

                  <button
                    className="dash-delete"
                    onClick={() => deleteVideo(v._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}