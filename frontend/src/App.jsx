import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

// Pages (we will create these next)
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AIPage from "./pages/AIPage";
import Drivers from "./pages/Drivers";
import Races from "./pages/Races";
import Constructors from "./pages/Constructors";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai"
        element={
          <ProtectedRoute>
            <AIPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/drivers"
        element={
          <ProtectedRoute>
            <Drivers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/races"
        element={
          <ProtectedRoute>
            <Races />
          </ProtectedRoute>
        }
      />

      <Route
        path="/constructors"
        element={
          <ProtectedRoute>
            <Constructors />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/dashboard" />} />

    </Routes>
  );
}

export default App;