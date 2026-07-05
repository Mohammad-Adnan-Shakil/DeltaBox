import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  useEffect(() => {
    document.title = "Login | DeltaBox";
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", loginForm);
      login(res.data);
      const from = location.state?.from || "/dashboard";
      navigate(from);
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/register", {
        username: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      });
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        setIsLogin(true);
        setRegisterForm({ name: "", email: "", password: "", confirmPassword: "" });
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] overflow-x-hidden">
      <div className="flex min-h-screen">
        {/* LEFT PANEL - BRANDING */}
        <div className="hidden lg:flex w-1/2 bg-[var(--color-bg-elevated)] items-center justify-center relative"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(232, 0, 45, 0.1) 0%, transparent 50%), linear-gradient(45deg, transparent 50%, rgba(232, 0, 45, 0.05) 100%)",
          }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex items-baseline gap-0 tracking-tight">
              <h1 className="text-[80px] font-black text-accentRed m-0" style={{ textShadow: "0 0 40px rgba(232, 0, 45, 0.5)" }}>
                Delta
              </h1>
              <h1 className="text-[80px] font-black text-whitePrimary m-0" style={{ textShadow: "0 0 40px rgba(255, 255, 255, 0.3)" }}>
                Box
              </h1>
            </div>

            <p className="mt-6 text-xl font-medium text-whitePrimary">AI-Powered F1 Intelligence</p>

            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              {["Race Prediction", "Performance Insights", "What-if Simulation"].map((feat) => (
                <div key={feat} className="px-5 py-2.5 rounded-full border border-accentRed/50 bg-accentRed/15 text-whitePrimary text-xs font-semibold shadow-[0_0_20px_rgba(232,0,45,0.3)]">
                  {feat}
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm text-text-muted tracking-widest">
              Your Edge in Formula 1 Analytics
            </p>

            <p className="absolute bottom-8 text-xs text-text-muted/50">
              DeltaBox · 2026 Season
            </p>
          </div>

          {/* Decorative track lines */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-px bg-white" style={{ marginTop: `${i * 5}%` }} />
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - FORM */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-[var(--color-bg-base)]">
          <div className="w-full max-w-sm">
            {/* Mobile Logo */}
            <div className="flex items-baseline gap-0 tracking-tight justify-center mb-8 lg:hidden">
              <h1 className="text-5xl font-black text-accentRed" style={{ textShadow: "0 0 40px rgba(232, 0, 45, 0.5)" }}>
                Delta
              </h1>
              <h1 className="text-5xl font-black text-whitePrimary" style={{ textShadow: "0 0 40px rgba(255, 255, 255, 0.3)" }}>
                Box
              </h1>
            </div>

            {/* Tab Switch */}
            <div className="flex mb-8 bg-[var(--color-bg-elevated)] rounded-[var(--radius-md)] p-1 border border-[var(--color-border-default)]">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-[var(--radius-sm)] transition-all duration-200 ${isLogin ? 'bg-accentRed text-white shadow-md' : 'text-text-secondary hover:text-whitePrimary'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-[var(--radius-sm)] transition-all duration-200 ${!isLogin ? 'bg-accentRed text-white shadow-md' : 'text-text-secondary hover:text-whitePrimary'}`}
              >
                Register
              </button>
            </div>

            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-default)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-lg)]">
              <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted font-semibold">
                {isLogin ? "Member Access" : "New Member"}
              </p>

              <h2 className="mt-2 text-3xl font-bold text-whitePrimary">
                {isLogin ? "Welcome back" : "Create Account"}
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                {isLogin ? "Access your F1 intelligence dashboard" : "Join DeltaBox for the 2026 season"}
              </p>

              <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} className="mt-8 flex flex-col gap-3">
                {!isLogin && (
                  <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    required={!isLogin}
                    autoFocus={!isLogin}
                    className="surface-input"
                  />
                )}

                <input
                  type="text"
                  name="email"
                  placeholder="Email or username"
                  value={isLogin ? loginForm.email : registerForm.email}
                  onChange={isLogin ? handleLoginChange : handleRegisterChange}
                  required
                  autoFocus={isLogin}
                  className="surface-input"
                />

                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={isLogin ? loginForm.password : registerForm.password}
                    onChange={isLogin ? handleLoginChange : handleRegisterChange}
                    required
                    className="surface-input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-whitePrimary transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {isLogin && (
                  <div className="text-right">
                    <button type="button" className="text-xs text-text-muted hover:text-accentRed transition">
                      Forgot password?
                    </button>
                  </div>
                )}

                {!isLogin && (
                  <div className="relative w-full">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      required={!isLogin}
                      className="surface-input pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-whitePrimary transition"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}

                {error && (
                  <p className="mt-3 text-center text-sm text-accentRed/90">{error}</p>
                )}

                {success && (
                  <p className="mt-3 text-center text-sm text-[var(--color-accent-green)]">{success}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full py-3.5 bg-accentRed text-white font-bold rounded-[var(--radius-md)] transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed active:scale-[0.97] hover:shadow-[0_0_20px_rgba(232,0,45,0.3)] uppercase tracking-wider"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      PROCESSING...
                    </span>
                  ) : isLogin ? (
                    "Access Dashboard"
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--color-border-default)]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-[var(--color-bg-card)] text-text-muted">or continue with</span>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <div id="google-login-button"></div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-text-muted">
              DeltaBox · 2026 Season
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
