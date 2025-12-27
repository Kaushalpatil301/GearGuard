import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../hooks/useAuth";

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Use auth hook to store user data
        login(data.data);
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setError(data.error?.message || "Signup failed");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 to-transparent" />

      <div className="relative max-w-lg w-full space-y-10 p-10">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-100 tracking-tight">
            Create Account
          </h2>
        </div>

        <div className="backdrop-blur-lg bg-gray-800/30 border border-gray-600/40 rounded-3xl p-10 shadow-2xl shadow-black/30">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-600/10 border border-red-600/30 text-red-300 px-6 py-4 rounded-2xl text-base backdrop-blur-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full px-6 py-4 bg-gray-700/20 border border-gray-600/30 rounded-2xl text-gray-100 placeholder-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-transparent transition-all duration-300"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-6 py-4 bg-gray-700/20 border border-gray-600/30 rounded-2xl text-gray-100 placeholder-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-transparent transition-all duration-300"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-6 py-4 bg-gray-700/20 border border-gray-600/30 rounded-2xl text-gray-100 placeholder-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-transparent transition-all duration-300"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-6 py-4 bg-gray-700/20 border border-gray-600/30 rounded-2xl text-gray-100 placeholder-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-transparent transition-all duration-300"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gray-700/30 border border-gray-600/40 rounded-2xl text-gray-100 font-bold text-lg backdrop-blur-sm hover:bg-gray-600/40 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-base text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-gray-300 hover:text-gray-100 transition-colors duration-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
