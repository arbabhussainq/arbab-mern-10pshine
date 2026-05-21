import { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Lock,
  Check,
  Eye,
  EyeOff,
  NotebookPen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useTheme from "../hooks/useTheme";
import { authService } from "../services/authService";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("name");

  // Name form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState("");
  const [nameError, setNameError] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Stats
  const [stats, setStats] = useState({ notes: 0, joined: "" });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setName(user.name || "");
      const loadProfile = async () => {
        try {
          const data = await authService.getProfile();
          setStats({
            notes: 0,
            joined: new Date(data.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            }),
          });
        } catch (err) {
          console.error(err);
        }
      };
      loadProfile();
    }
  }, [user]);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setNameError("Please enter a valid email address");
      return;
    }

    if (name.trim() === user.name && email.trim() === user.email) {
      setNameError("No changes detected");
      return;
    }

    setNameLoading(true);
    setNameError("");
    setNameSuccess("");
    try {
      const data = await authService.updateInfo(name.trim(), email.trim());
      updateUser(data.user);
      setNameSuccess("Info updated successfully!");
      setTimeout(() => setNameSuccess(""), 3000);
    } catch (err) {
      setNameError(err.message);
    } finally {
      setNameLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.updatePassword(currentPassword, newPassword);
      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div
      style={{
        ...styles.page,
        background: "var(--bg-secondary)",
      }}>
      {/* Top bar */}
      <div
        style={{
          ...styles.topbar,
          background: "var(--bg-primary)",
          borderColor: "var(--border-primary)",
        }}>
        <div style={styles.topbarLeft}>
          <div style={styles.logo}>
            <NotebookPen size={18} strokeWidth={1.5} />
            <span style={styles.logoText}>Noted</span>
          </div>
        </div>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={15} strokeWidth={1.5} />
          Back to notes
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Profile header card */}
        <div
          style={{
            ...styles.card,
            background: "var(--bg-primary)",
            borderColor: "var(--border-primary)",
          }}>
          <div style={styles.profileHeader}>
            <div style={styles.avatarLarge}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={styles.profileName}>{user?.name}</h1>
              <p style={styles.profileEmail}>{user?.email}</p>
              {stats.joined && (
                <p style={styles.profileJoined}>Member since {stats.joined}</p>
              )}
            </div>
          </div>
        </div>

        {/* Settings card */}
        <div
          style={{
            ...styles.card,
            background: "var(--bg-primary)",
            borderColor: "var(--border-primary)",
            padding: 0,
            overflow: "hidden",
          }}>
          {/* Tabs */}
          <div
            style={{
              ...styles.tabs,
              borderColor: "var(--border-primary)",
            }}>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === "name" ? styles.tabActive : {}),
                borderColor:
                  activeTab === "name" ? "var(--text-primary)" : "transparent",
              }}
              onClick={() => setActiveTab("name")}>
              <User size={14} strokeWidth={1.5} />
              Update Account Info
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === "password" ? styles.tabActive : {}),
                borderColor:
                  activeTab === "password" ?
                    "var(--text-primary)"
                  : "transparent",
              }}
              onClick={() => setActiveTab("password")}>
              <Lock size={14} strokeWidth={1.5} />
              Change password
            </button>
          </div>

          <div style={styles.tabContent}>
            {/* Name tab */}
            {activeTab === "name" && (
              <form onSubmit={handleUpdateInfo} style={styles.form}>
                <p style={styles.formDesc}>
                  Update your display name and email address.
                </p>

                {nameError && <div style={styles.error}>{nameError}</div>}
                {nameSuccess && (
                  <div style={styles.success}>
                    <Check size={14} strokeWidth={2} />
                    {nameSuccess}
                  </div>
                )}

                <div style={styles.field}>
                  <label style={styles.label}>Full name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError("");
                    }}
                    placeholder="Your name"
                    style={{
                      ...styles.input,
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-primary)",
                    }}
                    required
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setNameError("");
                    }}
                    placeholder="you@example.com"
                    style={{
                      ...styles.input,
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-primary)",
                    }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    ...styles.btn,
                    opacity:
                      nameLoading || !name.trim() || !email.trim() ? 0.6 : 1,
                  }}
                  disabled={nameLoading || !name.trim() || !email.trim()}>
                  {nameLoading ? "Updating..." : "Save changes"}
                </button>
              </form>
            )}

            {/* Password tab */}
            {activeTab === "password" && (
              <form onSubmit={handleUpdatePassword} style={styles.form}>
                <p style={styles.formDesc}>
                  Choose a strong password. You must enter your current password
                  to confirm.
                </p>

                {passwordError && (
                  <div style={styles.error}>{passwordError}</div>
                )}
                {passwordSuccess && (
                  <div style={styles.success}>
                    <Check size={14} strokeWidth={2} />
                    {passwordSuccess}
                  </div>
                )}

                <div style={styles.field}>
                  <label style={styles.label}>Current password</label>
                  <div style={styles.inputWrapper}>
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setPasswordError("");
                      }}
                      placeholder="Enter current password"
                      style={{
                        ...styles.input,
                        paddingRight: "40px",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-primary)",
                      }}
                      required
                    />
                    <button
                      type="button"
                      style={styles.eyeBtn}
                      onClick={() => setShowCurrent(!showCurrent)}>
                      {showCurrent ?
                        <EyeOff size={14} strokeWidth={1.5} />
                      : <Eye size={14} strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>New password</label>
                  <div style={styles.inputWrapper}>
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError("");
                      }}
                      placeholder="Min. 6 characters"
                      style={{
                        ...styles.input,
                        paddingRight: "40px",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-primary)",
                      }}
                      required
                    />
                    <button
                      type="button"
                      style={styles.eyeBtn}
                      onClick={() => setShowNew(!showNew)}>
                      {showNew ?
                        <EyeOff size={14} strokeWidth={1.5} />
                      : <Eye size={14} strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Confirm new password</label>
                  <div style={styles.inputWrapper}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError("");
                      }}
                      placeholder="Repeat new password"
                      style={{
                        ...styles.input,
                        paddingRight: "40px",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-primary)",
                      }}
                      required
                    />
                    <button
                      type="button"
                      style={styles.eyeBtn}
                      onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ?
                        <EyeOff size={14} strokeWidth={1.5} />
                      : <Eye size={14} strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    ...styles.btn,
                    opacity: passwordLoading ? 0.6 : 1,
                  }}
                  disabled={passwordLoading}>
                  {passwordLoading ? "Updating..." : "Update password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    height: "52px",
    borderBottom: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    flexShrink: 0,
  },
  topbarLeft: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "var(--text-primary)",
  },
  logoText: {
    fontSize: "15px",
    fontWeight: "500",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    color: "var(--text-secondary)",
    background: "none",
    border: "1px solid var(--border-primary)",
    cursor: "pointer",
    fontFamily: "var(--font)",
    transition: "all 0.15s ease",
  },
  content: {
    flex: 1,
    maxWidth: "560px",
    width: "100%",
    margin: "40px auto",
    padding: "0 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    borderRadius: "12px",
    border: "1px solid",
    padding: "24px",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  avatarLarge: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "500",
    color: "var(--text-secondary)",
    flexShrink: 0,
  },
  profileName: {
    fontSize: "18px",
    fontWeight: "500",
    color: "var(--text-primary)",
    marginBottom: "4px",
  },
  profileEmail: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    marginBottom: "4px",
  },
  profileJoined: {
    fontSize: "12px",
    color: "var(--text-tertiary)",
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid",
    padding: "0 24px",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "14px 4px",
    marginRight: "24px",
    fontSize: "13px",
    color: "var(--text-secondary)",
    background: "none",
    border: "none",
    borderBottom: "2px solid",
    cursor: "pointer",
    fontFamily: "var(--font)",
    transition: "all 0.15s ease",
  },
  tabActive: {
    color: "var(--text-primary)",
    fontWeight: "500",
  },
  tabContent: {
    padding: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  formDesc: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
  },
  error: {
    background: "#fff0f0",
    border: "1px solid #fcc",
    color: "#c00",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
  },
  success: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#16a34a",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
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
    border: "1px solid",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    fontFamily: "var(--font)",
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
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  btn: {
    padding: "10px 20px",
    background: "var(--accent)",
    color: "var(--bg-primary)",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    fontFamily: "var(--font)",
    alignSelf: "flex-start",
    transition: "opacity 0.15s ease",
  },
};

export default Profile;
