import { useState, useRef, useCallback } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/useAuth";
import "./Upload.css";
import "../styles/ui.css";
const CATEGORIES = ["General", "Education", "Entertainment", "Technology", "Gaming"];

export default function Upload({ onBack }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [videoDragging, setVideoDragging] = useState(false);
  const [thumbDragging, setThumbDragging] = useState(false);

  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  const handleVideoDrop = useCallback((e) => {
    e.preventDefault();
    setVideoDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) setVideo(file);
  }, []);

  const handleThumbDrop = useCallback((e) => {
    e.preventDefault();
    setThumbDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!video) return setMessage({ text: "Please select a video file", type: "error" });
    if (!title.trim()) return setMessage({ text: "Please enter a title", type: "error" });

    try {
      setLoading(true);
      setProgress(0);
      setMessage({ text: "", type: "" });

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("video", video);
      if (thumbnail) formData.append("thumbnail", thumbnail);

      await axios.post("/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setProgress(pct);
        },
      });

      setMessage({ text: "Video uploaded successfully!", type: "success" });

      setTimeout(() => {
        onBack?.();
      }, 1200);

      setTitle("");
      setCategory("General");
      setVideo(null);
      setThumbnail(null);
      setThumbnailPreview(null);
      setProgress(0);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Upload failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="upload-page">
      {/* Header */}
      <div className="upload-header">
        <button className="ui-back" onClick={onBack}>
  ← Back
</button>

        <p className="upload-eyebrow">Share your journey</p>
        <h1 className="upload-title">
          Upload a <em>Video</em>
        </h1>
        <p className="upload-subtitle">
          Bring your travel story to the Trizo community.
        </p>
      </div>

      {/* Form */}
      <form className="upload-form" onSubmit={handleSubmit}>
        {/* Left column */}
        <div className="upload-col">
          {/* Video */}
          <div className="field-group">
            <label className="field-label">
              Video File <span className="required">*</span>
            </label>

            <div
              className={`drop-zone${videoDragging ? " dragging" : ""}${video ? " has-file" : ""}`}
              onClick={() => videoInputRef.current.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setVideoDragging(true);
              }}
              onDragLeave={() => setVideoDragging(false)}
              onDrop={handleVideoDrop}
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                style={{ display: "none" }}
                onChange={(e) => setVideo(e.target.files[0])}
              />

              {video ? (
                <div className="file-info">
                  <div className="file-icon">
                    🎥
                  </div>
                  <div className="file-details">
                    <p className="file-name">{video.name}</p>
                    <p className="file-size">{formatBytes(video.size)}</p>
                  </div>
                  <button
                    type="button"
                    className="file-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideo(null);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="drop-placeholder">
                  <p className="drop-text">Drag & drop your video here</p>
                  <p className="drop-hint">
                    or <span className="drop-link">browse files</span>
                  </p>
                  <p className="drop-formats">MP4, MOV, AVI · Max 500MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="field-group">
            <label className="field-label">
              Thumbnail <span className="optional">optional</span>
            </label>

            <div
              className={`drop-zone thumb-zone${thumbDragging ? " dragging" : ""}${thumbnail ? " has-file" : ""}`}
              onClick={() => thumbInputRef.current.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setThumbDragging(true);
              }}
              onDragLeave={() => setThumbDragging(false)}
              onDrop={handleThumbDrop}
            >
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleThumbChange}
              />

              {thumbnailPreview ? (
                <div className="thumb-preview-wrap">
                  <img src={thumbnailPreview} alt="preview" className="thumb-preview" />
                  <button
                    type="button"
                    className="file-remove thumb-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThumbnail(null);
                      setThumbnailPreview(null);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="drop-placeholder">
                  <p className="drop-text">Add a thumbnail image</p>
                  <p className="drop-hint">
                    or <span className="drop-link">browse</span>
                  </p>
                  <p className="drop-formats">JPG, PNG, WEBP</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="upload-col">
          <div className="field-group">
            <label className="field-label">Title</label>
            <input
              type="text"
              className="field-input"
              placeholder="Give your video a title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Category</label>
            <select
              className="field-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Uploader */}
          <div className="uploader-card">
            <img src={user?.avatar} alt="avatar" className="uploader-avatar" />
            <div>
              <p className="uploader-name">{user?.fullName}</p>
              <p className="uploader-label">Uploading as</p>
            </div>
          </div>

          {/* Progress */}
          {loading && (
            <div className="progress-wrap">
              <div className="progress-track">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <span className="progress-pct">{progress}%</span>
            </div>
          )}

          {/* Message */}
          {message.text && (
            <div className={`upload-message ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Uploading…" : "Publish Video"}
          </button>
        </div>
      </form>
    </div>
  );
}