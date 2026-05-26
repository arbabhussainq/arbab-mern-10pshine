import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "../pages/Login";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";


// Mock useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock("../services/authService", () => ({
  authService: {
    login: vi.fn(),
  },
}));


const mockAuthContext = {
  user: null,
  token: null,
  login: vi.fn(),
  logout: vi.fn(),
  updateUser: vi.fn(),
};

const mockThemeContext = {
  theme: "light",
  toggleTheme: vi.fn(),
};

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <ThemeContext.Provider value={mockThemeContext}>
        <AuthContext.Provider value={mockAuthContext}>
          <Login />
        </AuthContext.Provider>
      </ThemeContext.Provider>
    </BrowserRouter>,
  );
};

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the login form correctly", () => {
    renderLogin();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("should render the Noted logo", () => {
    renderLogin();
    expect(screen.getByText("Noted")).toBeInTheDocument();
  });

  it("should render forgot password link", () => {
    renderLogin();
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
  });

  it("should render sign up link", () => {
    renderLogin();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("should update email field when typed into", () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com");
  });

  it("should update password field when typed into", () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText("••••••••");
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(passwordInput.value).toBe("password123");
  });

  it("should toggle password visibility when eye icon is clicked", () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText("••••••••");
    expect(passwordInput.type).toBe("password");
    const toggleBtn = passwordInput.parentElement.querySelector("button");
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("text");
  });

  it("should show error message on failed login", async () => {
    const { authService } = await import("../services/authService");
    authService.login.mockRejectedValueOnce(
      new Error("Invalid email or password"),
    );
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });
  });

  it("should call login service on form submit", async () => {
    const { authService } = await import("../services/authService");
    authService.login.mockResolvedValueOnce({
      token: "fake-token",
      user: { id: "1", name: "Test", email: "test@example.com" },
    });
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "123456",
      });
    });
  });
});
