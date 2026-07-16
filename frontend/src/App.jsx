import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./routes/ProtectedRoute";
import RequireFeatureAccess from "./routes/RequireFeatureAccess";
import MainLayout from "./layout/MainLayout";
import Logo from "./components/Logo";

// Lazy load pages for code splitting
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AIPage = lazy(() => import("./pages/AIPage"));
const Drivers = lazy(() => import("./pages/Drivers"));
const Races = lazy(() => import("./pages/Races"));
const RaceDetails = lazy(() => import("./pages/RaceDetails"));
const Constructors = lazy(() => import("./pages/Teams"));
const Profile = lazy(() => import("./pages/Profile"));
const RaceEngineerPage = lazy(() => import("./pages/RaceEngineerPage"));
const DeltaAnalyst = lazy(() => import("./pages/DeltaAnalyst"));

const LoadingFallback = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-base)]">
    <div className="relative">
      <Logo size={48} className="animate-pulse [animation-duration:2s]" />
      <div className="absolute inset-0 bg-accentRed/20 blur-2xl rounded-full -z-10" />
    </div>
    <p className="mt-6 font-display font-semibold text-sm uppercase tracking-[0.3em] text-text-muted animate-pulse">
      Loading
    </p>
    <div className="mt-4 flex gap-1.5">
      {[0,1,2].map(i => (
        <div key={i} className="h-1.5 w-1.5 rounded-full bg-accentRed animate-bounce"
             style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>

      {/* Public Routes - Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public Routes - F1 Stats (No login required) */}
      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        }
      />

      <Route
        path="/drivers"
        element={
          <MainLayout>
            <Drivers />
          </MainLayout>
        }
      />

      <Route
        path="/races"
        element={
          <MainLayout>
            <Races />
          </MainLayout>
        }
      />

      <Route
        path="/races/:raceId"
        element={
          <MainLayout>
            <RaceDetails />
          </MainLayout>
        }
      />

      <Route
        path="/constructors"
        element={
          <MainLayout>
            <Constructors />
          </MainLayout>
        }
      />

      <Route
        path="/delta-analyst"
        element={
          <MainLayout>
            <DeltaAnalyst />
          </MainLayout>
        }
      />

      {/* Account-required Routes - Locked screen for guests */}
      <Route
        path="/ai"
        element={
          <RequireFeatureAccess featureName="AI Race Predictions">
            <MainLayout>
              <AIPage />
            </MainLayout>
          </RequireFeatureAccess>
        }
      />

      
      <Route
        path="/race-engineer"
        element={
          <RequireFeatureAccess featureName="Race Engineer">
            <MainLayout>
              <RaceEngineerPage />
            </MainLayout>
          </RequireFeatureAccess>
        }
      />

      {/* Protected Routes - Authenticated Users Only */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Landing / Marketing */}
      <Route path="/" element={<Landing />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" />} />

    </Routes>
    </Suspense>
  );
}

export default App;
