import { useState } from "react";
import { useAuth } from "../context/useAuth";

export default function Login({ onSwitch }) {
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // user will be updated via context → component re-renders
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Welcome, {user.fullname}</h2>
          <p style={styles.text}>Email: {user.email}</p>
          <p style={styles.text}>Username: @{user.username}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Login</h2>

        {error && <p style={{ color: "#e74c3c", marginBottom: 16 }}>{error}</p>}

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          required
          autoFocus
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.switchText}>
          Don't have an account?{" "}
          <span style={styles.link} onClick={onSwitch}>
            Register
          </span>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1f1c2c, #928dab)",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    background: "#ffffff",
    padding: "40px 32px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "360px",
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
    outline: "none",
    transition: "border-color 0.2s",
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
    cursor: "pointer",
    transition: "background 0.2s",
  },
  text: {
    color: "#555",
    margin: "8px 0",
    fontSize: "15px",
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