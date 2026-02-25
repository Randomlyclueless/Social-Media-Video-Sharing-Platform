import { useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/useAuth";

export default function ChangeAvatar({ onBack }) {
  const { user, setUser } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || "");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return alert("Select an image first");

    const formData = new FormData();
    formData.append("avatar", file); // must match multer field

    setLoading(true);

    try {
      const res = await axios.patch(
        "/users/avatar",
        formData,
        {
          withCredentials: true,
        }
      );

      setUser(res.data.user);
      alert("Avatar updated");
      onBack();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>Change Avatar</h2>

        <img
          src={preview}
          alt="preview"
          style={styles.preview}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />

        <button
          style={styles.button}
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        <button style={styles.back} onClick={onBack}>
          Back
        </button>
      </div>
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
    width: "320px",
    color: "white",
    textAlign: "center",
  },
  preview: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "14px",
  },
  button: {
    width: "100%",
    padding: "10px",
    marginTop: "14px",
    borderRadius: "6px",
    border: "none",
    background: "#6366f1",
    color: "white",
    cursor: "pointer",
  },
  back: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#334155",
    color: "white",
    cursor: "pointer",
  },
};