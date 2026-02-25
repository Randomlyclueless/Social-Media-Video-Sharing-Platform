import { useState } from "react";
import API from "../api/axios";

export default function Register({ onSwitch }) {
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    username: "",
    password: "",
    avatar: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setForm((prev) => ({ ...prev, avatar: files?.[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") fd.append(key, value);
    });

    try {
      await API.post("/users/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Registered successfully! Please login.");
      onSwitch();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Create Account</h2>

        {error && <p style={{ color: "#e74c3c", marginBottom: 16 }}>{error}</p>}

        <input
          style={styles.input}
          name="fullname"
          placeholder="Full Name"
          value={form.fullname}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <div style={{ margin: "16px 0", textAlign: "left" }}>
          <label style={{ fontSize: "14px", color: "#555" }}>Profile Picture (optional)</label>
          <input
            style={styles.fileInput}
            name="avatar"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p style={styles.switchText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={onSwitch}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
  minHeight: "100vh",           // ← use minHeight instead of height
  display: "flex",
  justifyContent: "center",     // horizontal center
  alignItems: "center",         // vertical center
  background: "linear-gradient(135deg, #1f1c2c, #928dab)",
  fontFamily: "system-ui, sans-serif",
},
  card: {
  background: "#ffffff",
  padding: "40px 32px",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "420px",           // ← 380–440px feels best on most screens
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  textAlign: "center",
},
  title: {
    margin: "0 0 28px",
    color: "#2c3e50",
    fontSize: "28px",
  },
  input: {
    width: "100%",
    padding: "13px 16px",
    marginBottom: "16px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
  },
  fileInput: {
    marginTop: "6px",
    width: "100%",
    padding: "8px 0",
  },
  button: {
    width: "100%",
    padding: "13px",
    borderRadius: "10px",
    border: "none",
    background: "#6c63ff",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "8px",
  },
  switchText: {
    marginTop: "20px",
    fontSize: "14.5px",
    color: "#555",
  },
  link: {
    color: "#6c63ff",
    cursor: "pointer",
    fontWeight: "500",
    textDecoration: "underline",
  },
};