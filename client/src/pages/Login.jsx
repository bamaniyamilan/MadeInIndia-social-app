// client/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuth } from '../features/auth/authSlice';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, status, error } = useSelector(selectAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Where to redirect after login
  const from = location.state?.from?.pathname || '/feed';

  useEffect(() => {
    if (token) {
      // already logged in — go to feed or previous location
      navigate(from, { replace: true });
    }
  }, [token, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
      // on success the useEffect will handle navigate
    } catch (err) {
      // error is handled by slice; optionally you can show toast here
      console.error('Login failed', err);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-2">Welcome back</h2>
        <p className="text-sm text-slate-600 mb-4">Log in to continue to MadeInIndia</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {typeof error === 'string' ? error : error?.error || 'Login failed'}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-4 py-2 rounded-2xl bg-indigo-600 text-white font-medium disabled:opacity-60"
            >
              {status === 'loading' ? 'Logging in…' : 'Log in'}
            </button>

            <Link to="/signup" className="text-sm text-slate-600 hover:underline">
              Create an account
            </Link>
          </div>
        </form>

        <div className="mt-4 text-xs text-slate-500">
          By continuing you agree to our terms. This is a demo app — no real emails will be sent.
        </div>
      </div>
    </div>
  );
}
