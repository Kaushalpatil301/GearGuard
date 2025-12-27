import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    console.log('Login attempt:', { email, password });
  };

  return (
    /* 🔹 SAME PAGE BACKGROUND AS DASHBOARD */
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 relative overflow-hidden flex items-center justify-center">
      {/* Indigo glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent pointer-events-none" />

      <div className="relative max-w-lg w-full space-y-10 p-10">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-5xl font-black text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-3 text-lg text-gray-400">
            Sign in to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="backdrop-blur-2xl bg-gray-900/20 border border-gray-700/30 rounded-3xl p-10 shadow-2xl">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-6 py-4 rounded-2xl text-base">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <input
                type="email"
                autoComplete="email"
                required
                className="
                  w-full px-6 py-4
                  bg-gray-900/40
                  border border-gray-700/40
                  rounded-2xl
                  text-gray-100 placeholder-gray-500 text-lg
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                  transition-all
                "
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                autoComplete="current-password"
                required
                className="
                  w-full px-6 py-4
                  bg-gray-900/40
                  border border-gray-700/40
                  rounded-2xl
                  text-gray-100 placeholder-gray-500 text-lg
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                  transition-all
                "
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-base">
              <label className="flex items-center text-gray-400 font-medium">
                <input
                  type="checkbox"
                  className="mr-3 h-5 w-5 rounded bg-gray-900 border-gray-700 text-indigo-500 focus:ring-indigo-500/40"
                />
                Remember me
              </label>

              <a
                href="#"
                className="text-gray-400 hover:text-indigo-400 transition-colors font-medium"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="
                w-full py-4 px-6
                bg-indigo-600 hover:bg-indigo-500
                rounded-2xl
                text-white font-bold text-lg
                transition-all active:scale-95
                shadow-xl shadow-indigo-500/20
              "
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-base text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
