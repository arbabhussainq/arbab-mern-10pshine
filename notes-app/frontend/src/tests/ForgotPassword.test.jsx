import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ForgotPassword from "../pages/ForgotPassword";
import { ThemeContext } from "../context/ThemeContext";

vi.mock("../services/authService", () => ({
  authService: {
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

const mockThemeContext = {
  theme: "light",
  toggleTheme: vi.fn(),
};

const renderForgotPassword = () => {
  return render(
    <BrowserRouter>
      <ThemeContext.Provider value={mockThemeContext}>
        <ForgotPassword />
      </ThemeContext.Provider>
    </BrowserRouter>,
  );
};

describe("Forgot Password Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render step 1 email form correctly", () => {
    renderForgotPassword();
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send otp/i }),
    ).toBeInTheDocument();
  });

  it("should render back to sign in link", () => {
    renderForgotPassword();
    expect(screen.getByText("Back to sign in")).toBeInTheDocument();
  });

  it("should render the Noted logo", () => {
    renderForgotPassword();
    expect(screen.getByText("Noted")).toBeInTheDocument();
  });

  it("should update email field when typed into", () => {
    renderForgotPassword();
    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com");
  });

  it("should move to step 2 after sending OTP", async () => {
    const { authService } = await import("../services/authService");
    authService.forgotPassword.mockResolvedValueOnce({ message: "OTP sent" });
    renderForgotPassword();
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));
    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument();
    });
  });

  it("should show OTP input and password fields in step 2", async () => {
    const { authService } = await import("../services/authService");
    authService.forgotPassword.mockResolvedValueOnce({ message: "OTP sent" });
    renderForgotPassword();
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText("123456")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Min. 6 characters"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Repeat new password"),
      ).toBeInTheDocument();
    });
  });

  it("should show error when passwords do not match", async () => {
    const { authService } = await import("../services/authService");
    authService.forgotPassword.mockResolvedValueOnce({ message: "OTP sent" });
    renderForgotPassword();
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));
    await waitFor(() => screen.getByPlaceholderText("123456"));
    fireEvent.change(screen.getByPlaceholderText("123456"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText("Min. 6 characters"), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repeat new password"), {
      target: { value: "differentpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  it("should show success state after password reset", async () => {
    const { authService } = await import("../services/authService");
    authService.forgotPassword.mockResolvedValueOnce({ message: "OTP sent" });
    authService.resetPassword.mockResolvedValueOnce({
      message: "Password reset successful",
    });
    renderForgotPassword();
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));
    await waitFor(() => screen.getByPlaceholderText("123456"));
    fireEvent.change(screen.getByPlaceholderText("123456"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText("Min. 6 characters"), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repeat new password"), {
      target: { value: "newpass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      expect(screen.getByText("Password reset!")).toBeInTheDocument();
    });
  });
});
