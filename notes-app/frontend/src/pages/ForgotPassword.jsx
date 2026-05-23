import { useState } from "react";
import { Link } from "react-router-dom";
import {
  NotebookPen,
  ArrowLeft,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { authService } from "../services/authService";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp + new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setStep(2);
      startResendTimer();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setResendLoading(true);
    setError("");
    try {
      await authService.forgotPassword(email);
      startResendTimer();
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      setSuccess("Password reset successfully!");
    } catch (err) {
      setError(err.message);
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

        {/* Step 1 — Enter email */}
        {step === 1 && (
          <>
            <div style={styles.header}>
              <div style={styles.iconCircle}>
                <Mail
                  size={20}
                  strokeWidth={1.5}
                  color="var(--text-secondary)"
                />
              </div>
              <h1 style={styles.title}>Forgot password?</h1>
              <p style={styles.subtitle}>
                Enter your email and we'll send you a 6-digit OTP to reset your
                password.
              </p>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSendOTP} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  style={styles.input}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                style={{ ...styles.btn, opacity: loading || !email ? 0.6 : 1 }}
                disabled={loading || !email}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {/* Step 2 — Enter OTP + new password */}
        {step === 2 && !success && (
          <>
            <div style={styles.header}>
              <div style={styles.iconCircle}>
                <KeyRound
                  size={20}
                  strokeWidth={1.5}
                  color="var(--text-secondary)"
                />
              </div>
              <h1 style={styles.title}>Check your email</h1>
              <p style={styles.subtitle}>
                We sent a 6-digit OTP to <strong>{email}</strong>. Enter it
                below along with your new password.
              </p>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleResetPassword} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>OTP code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  placeholder="123456"
                  style={{
                    ...styles.input,
                    letterSpacing: "4px",
                    fontSize: "18px",
                    textAlign: "center",
                  }}
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>New password</label>
                <div style={styles.inputWrapper}>
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Min. 6 characters"
                    style={{ ...styles.input, paddingRight: "40px" }}
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
                      setError("");
                    }}
                    placeholder="Repeat new password"
                    style={{ ...styles.input, paddingRight: "40px" }}
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
                style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
                disabled={loading}>
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>

            <div style={styles.resendRow}>
              <span style={styles.resendText}>Didn't receive it?</span>
              <button
                style={{
                  ...styles.resendBtn,
                  opacity: resendTimer > 0 || resendLoading ? 0.5 : 1,
                  cursor: resendTimer > 0 ? "default" : "pointer",
                }}
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || resendLoading}>
                {resendLoading ?
                  "Sending..."
                : resendTimer > 0 ?
                  `Resend in ${resendTimer}s`
                : "Resend OTP"}
              </button>
            </div>

            <button
              style={styles.changeEmailBtn}
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
                setNewPassword("");
                setConfirmPassword("");
              }}>
              <ArrowLeft size={13} strokeWidth={1.5} />
              Use a different email
            </button>
          </>
        )}

        {/* Success state */}
        {success && (
          <div style={styles.successState}>
            <div
              style={{
                ...styles.iconCircle,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
              }}>
              <Check size={20} strokeWidth={2} color="#16a34a" />
            </div>
            <h1 style={styles.title}>Password reset!</h1>
            <p style={styles.subtitle}>
              Your password has been reset successfully. You can now sign in
              with your new password.
            </p>
          </div>
        )}

        <p style={styles.footer}>
          <Link to="/login" style={styles.link}>
            <ArrowLeft size={13} strokeWidth={1.5} />
            Back to sign in
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
  iconCircle: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "500",
    color: "var(--text-primary)",
    marginBottom: "8px",
  },
  subtitle: {
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
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
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
    outline: "none",
    fontFamily: "var(--font)",
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
    width: "100%",
    padding: "10px",
    background: "var(--accent)",
    color: "var(--bg-primary)",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font)",
    marginTop: "4px",
    transition: "opacity 0.15s ease",
  },
  resendRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    marginTop: "16px",
  },
  resendText: {
    fontSize: "13px",
    color: "var(--text-secondary)",
  },
  resendBtn: {
    fontSize: "13px",
    color: "var(--text-primary)",
    fontWeight: "500",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font)",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  changeEmailBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "var(--text-tertiary)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font)",
    margin: "12px auto 0",
  },
  successState: {
    textAlign: "center",
    marginBottom: "24px",
  },
  footer: {
    textAlign: "center",
    marginTop: "24px",
  },
  link: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "var(--text-secondary)",
    textDecoration: "none",
  },
};

export default ForgotPassword;
