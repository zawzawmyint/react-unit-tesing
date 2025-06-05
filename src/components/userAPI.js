const userAPI = {
  fetchUser: async (id) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock user data
    const users = {
      1: { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
      2: { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" },
    };

    if (users[id]) {
      return users[id];
    } else {
      throw new Error("User not found");
    }
  },

  updateUser: async (id, userData) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { ...userData, id };
  },
};

export default userAPI;
