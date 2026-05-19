import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { authService } from "../services/authService";
import { Eye, EyeOff, NotebookPen } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.register(formData);
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <NotebookPen size={24} strokeWidth={1.5} />
          <span style={styles.logoText}>Noted</span>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>Create an account</h1>
          <p style={styles.subtitle}>Start writing your thoughts down today</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Arbab Hussain"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                style={{ ...styles.input, paddingRight: "40px" }}
                required
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ?
                  <EyeOff size={15} strokeWidth={1.5} />
                : <Eye size={15} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={loading ? { ...styles.btn, opacity: 0.6 } : styles.btn}
            disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    background: "var(--bg-primary)",
    border: "1px solid var(--border-primary)",
    borderRadius: "12px",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "32px",
    color: "var(--text-primary)",
  },
  logoText: {
    fontSize: "16px",
    fontWeight: "500",
  },
  header: {
    marginBottom: "28px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "500",
    color: "var(--text-primary)",
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--text-secondary)",
  },
  error: {
    background: "#fff0f0",
    border: "1px solid #fcc",
    color: "#c00",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--text-secondary)",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-primary)",
    borderRadius: "8px",
    fontSize: "14px",
    color: "var(--text-primary)",
    transition: "border-color 0.15s ease",
  },
  inputWrapper: {
    position: "relative",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-tertiary)",
    display: "flex",
    alignItems: "center",
  },
  btn: {
    width: "100%",
    padding: "10px",
    background: "var(--accent)",
    color: "var(--bg-primary)",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    marginTop: "4px",
    transition: "opacity 0.15s ease",
  },
  footer: {
    textAlign: "center",
    fontSize: "13px",
    color: "var(--text-secondary)",
    marginTop: "24px",
  },
  link: {
    color: "var(--text-primary)",
    fontWeight: "500",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
};

export default Signup;
