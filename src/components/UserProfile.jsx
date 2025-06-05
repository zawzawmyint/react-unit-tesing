import { useEffect, useState } from "react";
import userAPI from "./userAPI";

// Main component we'll be testing
const UserProfile = ({
  userId,
  onUserUpdate,
  theme = "light",
  showEditButton = true,
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  // Fetch user data on component mount or when userId changes
  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await userAPI.fetchUser(userId);
      setUser(userData);
      setEditForm({ name: userData.name, email: userData.email });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleUpdate = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await userAPI.updateUser(userId, editForm);
      setUser(updatedUser);
      setEditing(false);
      onUserUpdate?.(updatedUser);
    } catch (err) {
      setError("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({ name: user.name, email: user.email });
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="user-profile" data-testid="user-profile">
        <div className="loading" data-testid="loading">
          Loading user data...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="user-profile error" data-testid="user-profile">
        <div className="error-message" data-testid="error-message">
          Error: {error}
        </div>
        <button onClick={fetchUserData} data-testid="retry-button">
          Retry
        </button>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="user-profile" data-testid="user-profile">
        <div data-testid="no-user">No user data available</div>
      </div>
    );
  }

  // Main user profile display
  return (
    <div
      className={`user-profile ${theme}`}
      data-testid="user-profile"
      role="main"
      aria-label="User Profile"
    >
      <div className="user-header">
        <h4 data-testid="user-name">
          {editing ? (
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              data-testid="name-input"
              aria-label="Edit user name"
            />
          ) : (
            user.name
          )}
        </h4>

        <div className="user-details">
          <p data-testid="user-email">
            Email:{" "}
            {editing ? (
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                data-testid="email-input"
                aria-label="Edit user email"
              />
            ) : (
              user.email
            )}
          </p>

          <p data-testid="user-role">
            Role: <span className={`role ${user.role}`}>{user.role}</span>
          </p>
        </div>
      </div>

      {showEditButton && (
        <div className="actions">
          {editing ? (
            <>
              <button
                onClick={handleUpdate}
                data-testid="save-button"
                disabled={loading}
                className="save-btn"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                data-testid="cancel-button"
                className="cancel-btn"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              data-testid="edit-button"
              className="edit-btn"
            >
              Edit Profile
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
