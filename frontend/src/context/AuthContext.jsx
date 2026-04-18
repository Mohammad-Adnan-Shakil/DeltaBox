import { createContext, useContext, useEffect, useState } from "react";

// Create Context
const AuthContext = createContext();

// Custom Hook (clean access)
export const useAuth = () => useContext(AuthContext);

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // 🔄 Load user on app start if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:9090/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Auth error:", err);
        logout(); // invalid token fallback
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // 🔐 Login
  const login = (data) => {
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser({
      username: data.username,
      role: data.role,
    });
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};