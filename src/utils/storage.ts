// Storage utility functions
export const storage = {
  // Safely get item from localStorage
  getItem: (key: string): string | null => {
    try {
      const item = localStorage.getItem(key);
      return item === "undefined" ? null : item;
    } catch (error) {
      console.error(`Error getting item from localStorage:`, error);
      return null;
    }
  },

  // Safely set item in localStorage
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item in localStorage:`, error);
    }
  },

  // Safely remove item from localStorage
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage:`, error);
    }
  },

  // Clear all auth-related data
  clearAuthData: (): void => {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      console.log("Auth data cleared from localStorage");
    } catch (error) {
      console.error(`Error clearing auth data:`, error);
    }
  },

  // Get parsed JSON safely
  getJSON: <T>(key: string): T | null => {
    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error parsing JSON from localStorage:`, error);
      storage.removeItem(key); // Remove corrupted data
      return null;
    }
  },

  // Set JSON safely
  setJSON: <T>(key: string, value: T): void => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting JSON in localStorage:`, error);
    }
  },
};
