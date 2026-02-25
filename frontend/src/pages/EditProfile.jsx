import { useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/useAuth";

export default function EditProfile({ onBack }) {
  const { user, setUser } = useAuth();

  const [fullName, setFullName] = useState(user.fullName || "");
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.put("/users/update-profile", {
        fullName,
        username,
        bio,
      });

      setUser(res.data.user);
      alert("Profile updated");
      onBack();
    } catch {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Edit Profile</h2>

        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          style={styles.input}
        />

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          style={styles.input}
        />

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          style={styles.textarea}
        />

        <button style={styles.button} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          onClick={onBack}
          style={{ ...styles.button, background: "#334155", marginTop: 10 }}
        >
          Back
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#0f172a,#020617)",
  },
  card: {
    background: "#0f172a",
    padding: "2rem",
    borderRadius: "12px",
    width: "350px",
    color: "white",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #334155",
    background: "#020617",
    color: "white",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #334155",
    background: "#020617",
    color: "white",
    minHeight: "80px",
  },
  button: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#6366f1",
    color: "white",
    cursor: "pointer",
  },
};