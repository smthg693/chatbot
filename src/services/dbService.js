// Universal Database Service (LocalStorage + IndexedDB abstraction)

const STORAGE_KEYS = {
  USERS: 'memoriflow_db_users',
  SESSION: 'memoriflow_db_session',
  CHATS: 'memoriflow_db_chats_',
  MEMORIES: 'memoriflow_db_memories_'
};

// Default Demo User
const DEFAULT_USER = {
  id: 'usr_soham_01',
  name: 'Soham Gopal Shirse',
  email: 'soham@memoriflow.ai',
  avatarColor: '#10A37F',
  createdAt: new Date().toISOString()
};

export const dbService = {
  // Initialize Database defaults
  init() {
    const existingUsers = this.getUsers();
    if (existingUsers.length === 0) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([DEFAULT_USER]));
    }
  },

  // Get all registered users
  getUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error("Error reading users from DB", err);
      return [];
    }
  },

  // Register a new user
  registerUser({ name, email, password }) {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: name.trim() || 'User',
      email: email.trim().toLowerCase(),
      passwordHash: btoa(password), // simple client hashing demo
      avatarColor: getRandomColor(),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentSession(newUser);
    return newUser;
  },

  // Login existing user
  loginUser({ email, password }) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error("No account found with this email address.");
    }

    // Verify password if set
    if (user.passwordHash && user.passwordHash !== btoa(password)) {
      throw new Error("Invalid password provided.");
    }

    this.setCurrentSession(user);
    return user;
  },

  // Login as Guest
  loginAsGuest() {
    const guestUser = {
      id: 'usr_guest_' + Date.now(),
      name: 'Guest User',
      email: 'guest@memoriflow.ai',
      isGuest: true,
      avatarColor: '#38bdf8',
      createdAt: new Date().toISOString()
    };
    this.setCurrentSession(guestUser);
    return guestUser;
  },

  // Get active session user
  getCurrentSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      return null;
    }
  },

  // Set active session user
  setCurrentSession(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  },

  // Clear session (Logout)
  logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // Save chat messages for user
  saveUserChats(userId, messages) {
    if (!userId) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CHATS + userId, JSON.stringify(messages));
    } catch (err) {
      console.error("Error saving user chat history", err);
    }
  },

  // Load chat messages for user
  getUserChats(userId) {
    if (!userId) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHATS + userId);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      return [];
    }
  },

  // Save memories for user
  saveUserMemories(userId, memories) {
    if (!userId) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIES + userId, JSON.stringify(memories));
    } catch (err) {
      console.error("Error saving user memories", err);
    }
  },

  // Load memories for user
  getUserMemories(userId) {
    if (!userId) return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMORIES + userId);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      return null;
    }
  }
};

function getRandomColor() {
  const colors = ['#10A37F', '#38bdf8', '#c084fc', '#fbbf24', '#f43f5e', '#34d399'];
  return colors[Math.floor(Math.random() * colors.length)];
}
