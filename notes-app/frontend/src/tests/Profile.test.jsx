import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Profile from "../pages/Profile";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

vi.mock("../services/authService", () => ({
  authService: {
    getProfile: vi.fn(),
    updateInfo: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockUser = {
  id: "1",
  name: "Arbab Hussain",
  email: "arbab@example.com",
};

const mockAuthContext = {
  user: mockUser,
  token: "fake-token",
  login: vi.fn(),
  logout: vi.fn(),
  updateUser: vi.fn(),
};

const mockThemeContext = {
  theme: "light",
  toggleTheme: vi.fn(),
};

const renderProfile = async () => {
  const result = render(
    <BrowserRouter>
      <ThemeContext.Provider value={mockThemeContext}>
        <AuthContext.Provider value={mockAuthContext}>
          <Profile />
        </AuthContext.Provider>
      </ThemeContext.Provider>
    </BrowserRouter>,
  );
  await waitFor(() => screen.getByText("Arbab Hussain"));
  return result;
};

describe("Profile Page", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { authService } = await import("../services/authService");
    authService.getProfile.mockResolvedValue({
      id: "1",
      name: "Arbab Hussain",
      email: "arbab@example.com",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
  });

  it("should render the profile page correctly", async () => {
    await renderProfile();
    await waitFor(() => {
      expect(screen.getByText("Arbab Hussain")).toBeInTheDocument();
    });
  });

  it("should render the Noted logo", async () => {
    await renderProfile();
    expect(screen.getByText("Noted")).toBeInTheDocument();
  });

  it("should render back to notes button", async () => {
    await renderProfile();
    expect(screen.getByText("Back to notes")).toBeInTheDocument();
  });

  it("should render user email", async () => {
    await renderProfile();
    await waitFor(() => {
      expect(screen.getByText("arbab@example.com")).toBeInTheDocument();
    });
  });

  it("should render account info and change password tabs", async () => {
    await renderProfile();
    expect(screen.getByText("Account Info")).toBeInTheDocument();
    expect(screen.getByText("Change password")).toBeInTheDocument();
  });

  it("should render user avatar with first letter of name", async () => {
    await renderProfile();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("should switch to change password tab on click", async () => {
    await renderProfile();
    fireEvent.click(screen.getByText("Change password"));
    expect(
      screen.getByPlaceholderText("Enter current password"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Min. 6 characters"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Repeat new password"),
    ).toBeInTheDocument();
  });

  it("should show error when new passwords do not match", async () => {
    await renderProfile();
    fireEvent.click(screen.getByText("Change password"));
    fireEvent.change(screen.getByPlaceholderText("Enter current password"), {
      target: { value: "oldpassword" },
    });
    fireEvent.change(screen.getByPlaceholderText("Min. 6 characters"), {
      target: { value: "newpassword" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repeat new password"), {
      target: { value: "differentpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    await waitFor(() => {
      expect(
        screen.getByText("New passwords do not match"),
      ).toBeInTheDocument();
    });
  });

  it("should show error when new password is too short", async () => {
    await renderProfile();
    fireEvent.click(screen.getByText("Change password"));
    fireEvent.change(screen.getByPlaceholderText("Enter current password"), {
      target: { value: "oldpassword" },
    });
    fireEvent.change(screen.getByPlaceholderText("Min. 6 characters"), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repeat new password"), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    await waitFor(() => {
      expect(
        screen.getByText("New password must be at least 6 characters"),
      ).toBeInTheDocument();
    });
  });

  it("should show success message after name update", async () => {
    const { authService } = await import("../services/authService");
    authService.updateInfo.mockResolvedValueOnce({
      message: "Info updated successfully",
      user: { id: "1", name: "New Name", email: "arbab@example.com" },
    });
    await renderProfile();
    await waitFor(() => screen.getByText("Arbab Hussain"));
    const nameInput = screen.getByDisplayValue("Arbab Hussain");
    fireEvent.change(nameInput, { target: { value: "New Name" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
    await waitFor(() => {
      expect(
        screen.getByText("Info updated successfully!"),
      ).toBeInTheDocument();
    });
  });

  it("should show error when update info fails", async () => {
    const { authService } = await import("../services/authService");
    authService.updateInfo.mockRejectedValueOnce(
      new Error("Email already in use"),
    );
    await renderProfile();
    await waitFor(() => screen.getByText("Arbab Hussain"));
    const nameInput = screen.getByDisplayValue("Arbab Hussain");
    fireEvent.change(nameInput, { target: { value: "New Name" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeInTheDocument();
    });
  });

  it("should toggle password visibility on current password field", async () => {
    await renderProfile();
    fireEvent.click(screen.getByText("Change password"));
    const currentPasswordInput = screen.getByPlaceholderText(
      "Enter current password",
    );
    expect(currentPasswordInput.type).toBe("password");
    const toggleBtn =
      currentPasswordInput.parentElement.querySelector("button");
    fireEvent.click(toggleBtn);
    expect(currentPasswordInput.type).toBe("text");
  });

  it("should call updatePassword service with correct data", async () => {
    const { authService } = await import("../services/authService");
    authService.updatePassword.mockResolvedValueOnce({
      message: "Password updated successfully",
    });
    await renderProfile();
    fireEvent.click(screen.getByText("Change password"));
    fireEvent.change(screen.getByPlaceholderText("Enter current password"), {
      target: { value: "oldpassword123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Min. 6 characters"), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repeat new password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
    await waitFor(() => {
      expect(authService.updatePassword).toHaveBeenCalledWith(
        "oldpassword123",
        "newpassword123",
      );
    });
  });
});
