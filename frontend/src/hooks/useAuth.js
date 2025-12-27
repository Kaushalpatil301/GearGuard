import { useState, useEffect } from "react";

// Custom hook for authentication context
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error parsing auth data:", error);
      // Clear corrupted data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (authData) => {
    const { token: newToken, user: newUser } = authData;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const isAuthenticated = () => {
    return !!(token && user);
  };

  const getUserId = () => {
    return user?.id || null;
  };

  const getUserRole = () => {
    return user?.role || null;
  };

  const getUserEmail = () => {
    return user?.email || null;
  };

  const getUserName = () => {
    return user?.name || null;
  };

  // Check if user can perform certain actions based on role
  const canAssignRequests = () => {
    const role = getUserRole();
    return role === "TECHNICIAN" || role === "MANAGER" || role === "ADMIN";
  };

  const canCreatePreventive = () => {
    const role = getUserRole();
    return role === "MANAGER" || role === "ADMIN";
  };

  const canAccessTeamManagement = () => {
    const role = getUserRole();
    return role === "MANAGER" || role === "ADMIN";
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    getUserId,
    getUserRole,
    getUserEmail,
    getUserName,
    canAssignRequests,
    canCreatePreventive,
    canAccessTeamManagement,
  };
};

export default useAuth;
