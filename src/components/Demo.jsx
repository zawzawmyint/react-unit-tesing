import { useState } from "react";
import UserProfile from "./UserProfile";

const Demo = () => {
  const [selectedUserId, setSelectedUserId] = useState(1);
  const [updateCount, setUpdateCount] = useState(0);

  const handleUserUpdate = (updatedUser) => {
    setUpdateCount((prev) => prev + 1);
    console.log("User updated:", updatedUser);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>React Testing Example - UserProfile Component</h1>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Select User:
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(Number(e.target.value))}
            style={{
              marginLeft: "10px",
              padding: "5px",
              width: "200px",
              borderRadius: "4px",
            }}
          >
            <option value={1}>User 1 (John Doe)</option>
            <option value={2}>User 2 (Jane Smith)</option>
            <option value={999}>Non-existent User (Error Test)</option>
          </select>
        </label>
      </div>

      {updateCount > 0 && (
        <div style={{ marginBottom: "20px", color: "green" }}>
          User has been updated {updateCount} time(s)
        </div>
      )}

      <hr />
      <h2>User Profile</h2>

      <UserProfile
        userId={selectedUserId}
        onUserUpdate={handleUserUpdate}
        theme="light"
        showEditButton={true}
      />

      <div
        style={{
          marginTop: "40px",
          padding: "20px",
        }}
      >
        <h3>Testing Notes:</h3>
        <ul>
          <li>This component demonstrates various testing scenarios</li>
          <li>Try switching between users to test loading states</li>
          <li>Select "Non-existent User" to test error handling</li>
          <li>Click "Edit Profile" to test form interactions</li>
          <li>The component uses proper ARIA labels and test IDs</li>
        </ul>
      </div>
    </div>
  );
};

export default Demo;
