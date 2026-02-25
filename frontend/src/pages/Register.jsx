import { useState } from "react";
import API from "../api/axios";
import { colors, shadows, animations } from "../styles/sharedStyles";

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
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      const file = files?.[0] || null;
      setForm((prev) => ({ ...prev, avatar: file }));
      
      // Create preview URL
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setAvatarPreview(null);
      }
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
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>🎥</div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join our creative community</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span style={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              name="fullname"
              placeholder="John Doe"
              value={form.fullname}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              name="email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              name="username"
              placeholder="johndoe"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.avatarSection}>
            <label style={styles.label}>Profile Picture (optional)</label>
            <div style={styles.avatarUpload}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" style={styles.avatarPreview} />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  <span style={styles.avatarIcon}>📷</span>
                </div>
              )}
              <label style={styles.uploadButton}>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleChange}
                  style={styles.hiddenInput}
                />
                Choose Image
              </label>
            </div>
          </div>

          <button
            style={{
              ...styles.button,
              ...(loading && styles.buttonLoading),
            }}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loadingContent}>
                <span style={styles.spinner}></span>
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{" "}
          <button style={styles.linkButton} onClick={onSwitch}>
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: `linear-gradient(135deg, ${colors.dark[900]}, ${colors.primary})`,
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "20px",
    animation: "fadeIn 0.5s ease-out",
  },
  card: {
    background: colors.white,
    padding: "48px 40px",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: shadows['2xl'],
    textAlign: "center",
    animation: "fadeIn 0.5s ease-out",
  },
  logoContainer: {
    marginBottom: "32px",
  },
  logo: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  title: {
    margin: "0 0 8px",
    color: colors.dark[900],
    fontSize: "32px",
    fontWeight: "700",
  },
  subtitle: {
    margin: "0",
    color: colors.dark[500],
    fontSize: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    textAlign: "left",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: colors.dark[700],
    fontSize: "14px",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: `2px solid ${colors.light[200]}`,
    fontSize: "15px",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    ":focus": {
      borderColor: colors.primary,
      boxShadow: shadows.neon,
    },
  },
  avatarSection: {
    textAlign: "left",
  },
  avatarUpload: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginTop: "8px",
  },
  avatarPreview: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
    border: `3px solid ${colors.primary}`,
  },
  avatarPlaceholder: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: colors.light[200],
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: {
    fontSize: "24px",
  },
  hiddenInput: {
    display: "none",
  },
  uploadButton: {
    padding: "10px 20px",
    background: colors.light[100],
    color: colors.dark[700],
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: `1px solid ${colors.light[300]}`,
    ":hover": {
      background: colors.light[200],
    },
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
    color: colors.white,
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "8px",
    position: "relative",
    overflow: "hidden",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: shadows.neon,
    },
  },
  buttonLoading: {
    opacity: 0.8,
    cursor: "not-allowed",
  },
  loadingContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTopColor: colors.white,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorAlert: {
    background: `${colors.danger}15`,
    color: colors.danger,
    padding: "12px 16px",
    borderRadius: "12px",
    marginBottom: "24px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: `1px solid ${colors.danger}30`,
  },
  errorIcon: {
    fontSize: "18px",
  },
  switchText: {
    marginTop: "28px",
    fontSize: "15px",
    color: colors.dark[500],
  },
  linkButton: {
    background: "none",
    border: "none",
    color: colors.primary,
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
    textDecoration: "underline",
    padding: "0 4px",
    ":hover": {
      color: colors.primaryDark,
    },
  },
};

// Add animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  ${animations.fadeIn}
  ${animations.spin}
  
  input:focus {
    border-color: ${colors.primary} !important;
    box-shadow: ${shadows.neon} !important;
  }
  
  button:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.neon};
  }
`;
document.head.appendChild(styleSheet);