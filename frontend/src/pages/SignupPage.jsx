import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    console.log('Signup attempt:', { name, email, password });
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
            Create Account
          </h2>
        </div>

        {/* Signup Card */}
        <div className="backdrop-blur-2xl bg-gray-900/20 border border-gray-700/30 rounded-3xl p-10 shadow-2xl">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-6 py-4 rounded-2xl text-base">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <input
                type="text"
                autoComplete="name"
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
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

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
                autoComplete="new-password"
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

              <input
                type="password"
                autoComplete="new-password"
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
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
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
              Sign Up
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-base text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
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
