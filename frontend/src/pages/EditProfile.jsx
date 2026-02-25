import { useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/useAuth";
import "./EditProfile.css";

export default function EditProfile({ onBack }) {
  const { user, setUser } = useAuth();

  const [fullName, setFullName] = useState(user.fullName || "");
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (username.includes(' ')) {
      setError("Username cannot contain spaces");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.put("/users/update-profile", {
        fullName,
        username,
        bio,
      });

      setUser(res.data.user);
      alert("✅ Profile updated successfully!");
      onBack();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Character count for bio
  const bioLength = bio.length;
  const maxBioLength = 160;

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-container">
        <button className="edit-profile-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Profile
        </button>

        <div className="edit-profile-card">
          <div className="edit-profile-header">
            <div className="edit-profile-avatar">
              <img 
                src={user.avatar || "https://via.placeholder.com/80"} 
                alt={user.fullName}
              />
            </div>
            <h2>Edit Profile</h2>
            <p>Update your personal information</p>
          </div>

          {error && (
            <div className="edit-profile-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="edit-profile-form">
            <div className="form-group">
              <label htmlFor="fullName">
                Full Name
                <span className="required">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">
                Username
                <span className="required">*</span>
              </label>
              <div className="input-prefix">
                <span>@</span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                  placeholder="johndoe"
                  required
                  className="form-input prefix-input"
                />
              </div>
              <small className="input-hint">No spaces allowed</small>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, maxBioLength))}
                placeholder="Tell us about yourself..."
                className="form-textarea"
                rows="4"
              />
              <div className="char-counter">
                <span style={{ color: bioLength > maxBioLength * 0.8 ? '#f59e0b' : 'inherit' }}>
                  {bioLength}
                </span> / {maxBioLength}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
              
              <button 
                type="button" 
                onClick={onBack}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}