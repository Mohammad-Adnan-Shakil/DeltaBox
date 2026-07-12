import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthGate from "../components/AuthGate";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accentRed"></div>
          </div>
          <p className="mt-4 text-whiteMuted">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show auth gate
  if (!isAuthenticated) {
    return <AuthGate routeName={location.pathname} />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;