import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // ⏳ Still checking auth (initial load)
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-textPrimary font-display">
        LOADING...
      </div>
    );
  }

  // 🚫 Not logged in → redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Authorized → render page
  return children;
};

export default ProtectedRoute;