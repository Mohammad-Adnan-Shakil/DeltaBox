import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", form);

      login(res.data); // store token + user
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex">

      {/* LEFT SIDE — BRANDING */}
      <div className="hidden md:flex w-1/2 bg-background items-center justify-center relative">

        {/* Red vertical stripe */}
        <div className="absolute right-0 top-0 h-full w-[3px] bg-primary"></div>

        <div className="px-12">
          <h1 className="font-display text-6xl text-textPrimary tracking-widePlus">
            F1 PULSE
          </h1>

          <div className="racing-divider mt-4 mb-6"></div>

          <p className="text-textSecondary text-lg max-w-md">
            AI-powered Formula 1 intelligence platform for race prediction,
            performance insights, and strategic simulation.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE — FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-background px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6"
        >
          <h2 className="font-display text-3xl tracking-widePlus">
            LOGIN
          </h2>

          <div className="racing-divider"></div>

          {/* Email */}
          <div>
            <label className="text-sm text-textSecondary mb-1 block">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-textSecondary mb-1 block">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-danger text-sm">{error}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>

          {/* Register Link */}
          <p className="text-sm text-textSecondary text-center">
            Don’t have an account?{" "}
            <span
              className="text-primary cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;