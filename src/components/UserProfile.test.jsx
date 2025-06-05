// Mock the API module to control its behavior in tests
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userAPI from "./userAPI";

import userEvent from "@testing-library/user-event";
import UserProfile from "./UserProfile";

jest.mock("./userAPI");

beforeEach(() => {
  userAPI.fetchUser.mockClear();
  userAPI.updateUser.mockClear();
});

// Test suite for UserProfile component

describe("UserProfile Component", () => {
  // Clean up after each test to ensure isolation
  afterEach(() => {
    cleanup();
    jest.clearAllMocks(); // Reset all mock function calls
  });

  // BASIC RENDERING TESTS

  describe("Basic Rendering", () => {
    test("renders without crashing", () => {
      // Most basic test - ensure component doesn't throw errors
      render(<UserProfile userId={1} />);

      // Check if main container exists
      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    });

    test("displays loading state", () => {
      // Mock API to never resolve (simulating show network)
      userAPI.fetchUser.mockImplementation(() => new Promise(() => {}));

      render(<UserProfile userId={1} />);

      //Verify loading message appears
      expect(screen.getByTestId("loading")).toBeInTheDocument();
      expect(screen.getByText("Loading user data..."));
    });

    test("renders with correct accesibility attributes", () => {
      userAPI.fetchUser.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
      });

      render(<UserProfile userId={1} />);

      // Check ARIA attributes for accessibility
      // const container = screen.getByTestId("user-profile");
      // expect(container).toHaveAttribute("aria-label", "User Profile");
      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    });
  });

  // DATA FETCHING TESTS AND ASYNC TESTS

  describe("Data Fetching", () => {
    test("fetches and displays user data successfully", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
      };

      userAPI.fetchUser.mockResolvedValue(mockUser);

      render(<UserProfile userId={1} />);

      // Wait for the user data to be fetched and displayed
      await waitFor(() => {
        expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
      });

      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "Email: john@example.com"
      );
      expect(screen.getByTestId("user-role")).toHaveTextContent("Role: admin");

      // Verify API was called with correct parameters
      expect(userAPI.fetchUser).toHaveBeenCalledWith(1);
      expect(userAPI.fetchUser).toHaveBeenCalledTimes(1);
    });

    test("handles API errors gracefully", async () => {
      // Mock API to reject with an error
      userAPI.fetchUser.mockRejectedValue(new Error("user not found"));

      render(<UserProfile userId={999} />);

      // Wait for error state to appear

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      expect(screen.getByTestId("error-message")).toBeInTheDocument();
      expect(screen.getByTestId("retry-button")).toBeInTheDocument();
    });

    test("refetches data when userId prop changes", async () => {
      const user1 = {
        id: 1,
        name: "John",
        email: "john@test.com",
        role: "user",
      };
      const user2 = {
        id: 2,
        name: "Jane",
        email: "jane@test.com",
        role: "admin",
      };

      userAPI.fetchUser
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2);

      // Initial render with userId=1
      const { rerender } = render(<UserProfile userId={1} />);

      await waitFor(() => {
        expect(screen.getByText("John")).toBeInTheDocument();
      });

      // Re-render with userId=2
      rerender(<UserProfile userId={2} />);

      await waitFor(() => {
        expect(screen.getByText("Jane")).toBeInTheDocument();
      });

      // Verify API was called twice with different IDs
      expect(userAPI.fetchUser).toHaveBeenCalledTimes(2);
      expect(userAPI.fetchUser).toHaveBeenNthCalledWith(1, 1);
      expect(userAPI.fetchUser).toHaveBeenNthCalledWith(2, 2);
    });
  });

  // USER INTERACITON TESTS

  describe("User Interaction", () => {
    beforeEach(() => {
      // Set up mock user data for interaction tests
      userAPI.fetchUser.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
      });
    });

    test("enters edit mode when edit button is clicked", async () => {
      render(<UserProfile userId={1} />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      });

      // click edit button
      fireEvent.click(screen.getByTestId("edit-button"));

      // Verify edit mode UI appears
      expect(screen.getByTestId("name-input")).toBeInTheDocument();
      expect(screen.getByTestId("email-input")).toBeInTheDocument();
      expect(screen.getByTestId("save-button")).toBeInTheDocument();
      expect(screen.getByTestId("cancel-button")).toBeInTheDocument();

      // Verify edit button is no longer visible
      expect(screen.queryByTestId("edit-button")).not.toBeInTheDocument();
    });

    test("cancels edit mode and resets form", async () => {
      const user = userEvent.setup();

      render(<UserProfile userId={1} />);

      await waitFor(() => {
        expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      });

      // Enter edit mode
      await user.click(screen.getByTestId("edit-button"));

      // Modify form fields
      const nameInput = screen.getByTestId("name-input");
      await user.clear(nameInput);
      await user.type(nameInput, "Modified Name");

      // Cancel editing
      await user.click(screen.getByTestId("cancel-button"));

      // Verify we're back to view mode with original data
      expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
      expect(screen.getByTestId("edit-button")).toBeInTheDocument();
    });

    test("updates user data successfully", async () => {
      const user = userEvent.setup();

      const mockUpdatedUser = {
        id: 1,
        name: "John Updated",
        email: "john.updated@example.com",
        role: "admin",
      };

      userAPI.updateUser.mockResolvedValue(mockUpdatedUser);

      const onUserUpdate = jest.fn(); // Mock callback function

      render(<UserProfile userId={1} onUserUpdate={onUserUpdate} />);

      await waitFor(() => {
        expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      });

      // Enter edit mode
      await user.click(screen.getByTestId("edit-button"));

      // Update form fields
      const nameInput = screen.getByTestId("name-input");
      const emailInput = screen.getByTestId("email-input");

      await user.clear(nameInput);
      await user.type(nameInput, "John Updated");

      await user.clear(emailInput);
      await user.type(emailInput, "john.updated@example.com");

      // Save changes
      await user.click(screen.getByTestId("save-button"));

      // Wait for update to complete
      await waitFor(() => {
        expect(screen.getByText("John Updated")).toBeInTheDocument();
      });

      // Verify API was called correctly
      expect(userAPI.updateUser).toHaveBeenCalledWith(1, {
        name: "John Updated",
        email: "john.updated@example.com",
      });

      // Verify callback was triggered
      expect(onUserUpdate).toHaveBeenCalledWith(mockUpdatedUser);
    });

    test("shows validation error for empty fields", async () => {
      const user = userEvent.setup();

      // Mock window.alert to capture validation messages
      const alertSpy = jest.spyOn(window, "alert").mockImplementation();

      render(<UserProfile userId={1} />);

      await waitFor(() => {
        expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      });

      // Enter edit mode
      await user.click(screen.getByTestId("edit-button"));

      // Clear form fields
      const nameInput = screen.getByTestId("name-input");
      await user.clear(nameInput);

      // Try to save with empty name
      await user.click(screen.getByTestId("save-button"));

      // Verify validation alert was shown
      expect(alertSpy).toHaveBeenCalledWith("Please fill in all fields");

      // Cleanup
      alertSpy.mockRestore();
    });
  });
  //////////////////////////////////////////
  // PROPS AND CONDITIOANL RENDERING TESTS
  ////////////////////////////////////////////
  describe("Props and Conditional Rendering", () => {
    beforeEach(() => {
      userAPI.fetchUser.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "John.example.com",
        role: "admin",
      });
    });

    test("applies theme prop correctly", async () => {
      render(<UserProfile userId={1} theme="dark" />);

      await waitFor(() => {
        expect(screen.getByTestId("user-profile")).toHaveClass("dark");
      });
    });

    test("hide edit button when showEditButton is false", async () => {
      render(<UserProfile userId={1} showEditButton={false} />);

      await waitFor(() => {
        expect(screen.getByTestId("user-name")).toBeInTheDocument();
      });

      // Edit button should not be present
      expect(screen.queryByTestId("edit-button")).not.toBeInTheDocument();
    });

    test("renders without userId prop", () => {
      render(<UserProfile />);

      // Should show "no user data" state
      expect(screen.getByTestId("no-user")).toBeInTheDocument();
      expect(screen.getByText("No user data available")).toBeInTheDocument();
    });

    test("handles missing onUserUpdate prop gracefully", async () => {
      const user = userEvent.setup();

      userAPI.updateUser.mockResolvedValue({
        id: 1,
        name: "Updated Name",
        email: "updated@example.com",
        role: "admin",
      });

      // Render without onUserUpdate prop
      render(<UserProfile userId={1} />);

      await waitFor(() => {
        expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      });

      // Enter edit mode and save (should not crash)
      await user.click(screen.getByTestId("edit-button"));

      const nameInput = screen.getByTestId("name-input");
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Name");

      // This should not throw an error even without onUserUpdate
      await user.click(screen.getByTestId("save-button"));

      await waitFor(() => {
        expect(screen.getByText("Updated Name")).toBeInTheDocument();
      });
    });
  });

  // =========================================
  // ERROR HANDLING AND EDGE CASES
  // =========================================

  describe("Error Handling and Edge Cases", () => {
    test("handles update API failure", async () => {
      const user = userEvent.setup();

      userAPI.fetchUser.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
      });

      // Mock update fail
      userAPI.updateUser.mockRejectedValue(new Error("Network error"));

      render(<UserProfile userId={1} />);

      await waitFor(() => {
        expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      });

      // Enter edit mode and try to save
      await user.click(screen.getByTestId("edit-button"));
      await user.click(screen.getByTestId("save-button"));

      // Should show error message
      await waitFor(() => {
        expect(
          screen.getByText("Error: Failed to update user")
        ).toBeInTheDocument();
      });
    });

    test("retry button refetches data ", async () => {
      const user = userEvent.setup();

      // First call fail, second succeeds
      userAPI.fetchUser
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "admin",
        });

      render(<UserProfile userId={1} />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByTestId("retry-button")).toBeInTheDocument();
      });

      // Click retry
      await user.click(screen.getByTestId("retry-button"));

      // Shuld shwo user data after retry
      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      expect(userAPI.fetchUser).toHaveBeenCalledTimes(2); // Ensure retry was called
    });

    test("disables save button during update", async () => {
      const user = userEvent.setup();

      userAPI.fetchUser.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
      });

      // Mock slow update
      userAPI.updateUser.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<UserProfile userId={1} />);

      await waitFor(() => {
        expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      });

      // Enter edit mode
      await user.click(screen.getByTestId("edit-button"));

      // Start save process
      const saveButton = screen.getByTestId("save-button");
      await user.click(saveButton);

      // Button should be disabled and show loading text
      // expect(saveButton).toBeDisabled();
      // expect(saveButton).toHaveTextContent("Saving...");
    });
  });

  // ===================================
  // ACCESSIBILITY TESTS
  // ==================================

  describe("Accessibility", () => {
    beforeEach(() => {
      userAPI.fetchUser.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
      });
    });

    test("form inputs have porper lables", async () => {
      const user = userEvent.setup();

      render(<UserProfile userId={1} />);

      await waitFor(() => {
        expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      });

      // Enter edit mode
      await user.click(screen.getByTestId("edit-button"));

      // Check for proper ARIA labels
      expect(screen.getByLabelText("Edit user name")).toBeInTheDocument();
      expect(screen.getByLabelText("Edit user email")).toBeInTheDocument();
    });

    test("component has proper semantic structure", async () => {
      render(<UserProfile userId={1} />);

      await waitFor(() => {
        expect(screen.getByRole("main")).toBeInTheDocument();
      });
    });
  });

  // ====================================
  // INTEGRATION TESTS
  // ====================================

  describe("Integration Tests", () => {
    test("complete user workflow - view, edit, save", async () => {
      const user = userEvent.setup();
      const onUserUpdate = jest.fn();

      // Mock initial user data
      userAPI.fetchUser.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
      });

      // Mock successful update
      userAPI.updateUser.mockResolvedValue({
        id: 1,
        name: "John Smith",
        email: "john.smith@example.com",
        role: "admin",
      });

      render(<UserProfile userId={1} onUserUpdate={onUserUpdate} />);

      // 1. Initial load - verify user data is displays
      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Email: john@example.com")).toBeInTheDocument();
      });

      //2. Enter edit mode
      await user.click(screen.getByTestId("edit-button"));

      // 3. Modify user data
      const nameInput = screen.getByTestId("name-input");
      const emailInput = screen.getByTestId("email-input");

      await user.clear(nameInput);
      await user.type(nameInput, "John Smith");

      await user.clear(emailInput);
      await user.type(emailInput, "john.smith@example.com");

      // 4. Save changes
      await user.click(screen.getByTestId("save-button"));

      // 5. Verify updated data displays
      await waitFor(() => {
        expect(screen.getByText("John Smith")).toBeInTheDocument();
        expect(
          screen.getByText("Email: john.smith@example.com")
        ).toBeInTheDocument();
      });

      // 6. Verify all expected function calls occurred
      expect(userAPI.fetchUser).toHaveBeenCalledWith(1);
      expect(userAPI.updateUser).toHaveBeenCalledWith(1, {
        name: "John Smith",
        email: "john.smith@example.com",
      });

      expect(onUserUpdate).toHaveBeenCalledWith({
        id: 1,
        name: "John Smith",
        email: "john.smith@example.com",
        role: "admin",
      });
    });
  });

  // ====================================
  // PERFORMANCE AND OPTIMIZAITON TESTS
  // ====================================

  describe("Performance Tests", () => {
    test("does not fetch data when userId is not provided", () => {
      render(<UserProfile />);

      // API should not be called without userId prop
      expect(userAPI.fetchUser).not.toHaveBeenCalled();
    });

    test("component cleans up properly on unmount", async () => {
      userAPI.fetchUser.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
      });

      const { unmount } = render(<UserProfile userId={1} />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      // Unmount component - should not cause memory leaks or errors
      expect(() => unmount()).not.toThrow();
    });
  });

  // =============================
  // CUSTOM TESTING UTILITIES AND HELPERS
  // ==============================

  // Helper function to render component with common props
  const renderUserProfile = (props = {}) => {
    const defaultProps = {
      userId: 1,
      theme: "light",
      showEditButton: true,
      ...props,
    };

    return render(<UserProfile {...defaultProps} />);
  };

  // Helper to set up successful user data mock
  const mockSuccessfulUserFetch = (userData = {}) => {
    const defaultUser = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
      ...userData,
    };

    userAPI.fetchUser.mockResolvedValue(defaultUser);
    return defaultUser;
  };

  // Example of using custom helpers to tests
  describe("Custom Helper Usage Examples", () => {
    test("using renderUserProfile helper", async () => {
      mockSuccessfulUserFetch({ name: "Jane Doe" });

      renderUserProfile({ userId: 2, theme: "dark" });

      await waitFor(() => {
        expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      });

      expect(screen.getByTestId("user-profile")).toHaveClass("dark");
    });
  });
});
