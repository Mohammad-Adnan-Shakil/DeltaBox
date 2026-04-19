import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

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

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          // ❌ DO NOT logout here
          console.warn("User fetch failed, but keeping token");
        }
      } catch (err) {
        console.error("Auth error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    setToken(data.token);

    // optional
    setUser({
      username: data.username,
      role: data.role,
    });
  };

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