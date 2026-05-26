import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Signup from "../pages/Signup";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

vi.mock("../services/authService", () => ({
  authService: {
    register: vi.fn(),
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

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

const renderSignup = () => {
  return render(
    <BrowserRouter>
      <ThemeContext.Provider value={mockThemeContext}>
        <AuthContext.Provider value={mockAuthContext}>
          <Signup />
        </AuthContext.Provider>
      </ThemeContext.Provider>
    </BrowserRouter>,
  );
};

describe("Signup Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the signup form correctly", () => {
    renderSignup();
    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Arbab Hussain")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Min. 6 characters"),
    ).toBeInTheDocument();
  });

  it("should render the Noted logo", () => {
    renderSignup();
    expect(screen.getByText("Noted")).toBeInTheDocument();
  });

  it("should render sign in link", () => {
    renderSignup();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("should update name field when typed into", () => {
    renderSignup();
    const nameInput = screen.getByPlaceholderText("Arbab Hussain");
    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    expect(nameInput.value).toBe("John Doe");
  });

  it("should update email field when typed into", () => {
    renderSignup();
    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    expect(emailInput.value).toBe("john@example.com");
  });

  it("should show error when password is less than 6 characters", async () => {
    renderSignup();
    fireEvent.change(screen.getByPlaceholderText("Arbab Hussain"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Min. 6 characters"), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters"),
      ).toBeInTheDocument();
    });
  });

  it("should toggle password visibility", () => {
    renderSignup();
    const passwordInput = screen.getByPlaceholderText("Min. 6 characters");
    expect(passwordInput.type).toBe("password");
    const toggleBtn = passwordInput.parentElement.querySelector("button");
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("text");
  });

  it("should call register service on valid form submit", async () => {
    const { authService } = await import("../services/authService");
    authService.register.mockResolvedValueOnce({
      token: "fake-token",
      user: { id: "1", name: "John Doe", email: "john@example.com" },
    });
    renderSignup();
    fireEvent.change(screen.getByPlaceholderText("Arbab Hussain"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Min. 6 characters"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        password: "123456",
      });
    });
  });

  it("should show error on failed registration", async () => {
    const { authService } = await import("../services/authService");
    authService.register.mockRejectedValueOnce(
      new Error("User already exists"),
    );
    renderSignup();
    fireEvent.change(screen.getByPlaceholderText("Arbab Hussain"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Min. 6 characters"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText("User already exists")).toBeInTheDocument();
    });
  });
});
