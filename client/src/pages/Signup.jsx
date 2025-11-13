// client/src/pages/Signup.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signup, selectAuth } from '../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, status, error } = useSelector(selectAuth);

  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); // lowercase, no spaces, 3-30 chars
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // simple client-side username validation
  const usernameValid = /^[a-z0-9_]{3,30}$/.test(username);
  const passwordValid = password.length >= 6;

  useEffect(() => {
    if (token) {
      navigate('/feed', { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameValid) return alert('Username must be 3-30 characters, lowercase letters, numbers or underscores.');
    if (!passwordValid) return alert('Password must be at least 6 characters.');
    try {
      await dispatch(signup({ name, username, email, password })).unwrap();
      // success -> effect above will redirect
    } catch (err) {
      console.error('Signup failed', err);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-2">Create your account</h2>
        <p className="text-sm text-slate-600 mb-4">Join MadeInIndia — connect with people and share moments.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Full name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-200"
              placeholder="Rajan Patel"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className={`w-full px-4 py-2 rounded-xl border ${
                username && !usernameValid ? 'border-red-300' : 'border-slate-200'
              } focus:ring-2 focus:ring-indigo-200`}
              placeholder="choose_a_username"
              required
            />
            <div className="text-xs text-slate-500 mt-1">
              Lowercase letters, numbers, and underscores only. 3–30 characters.
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-200"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl border ${
                password && !passwordValid ? 'border-red-300' : 'border-slate-200'
              } focus:ring-2 focus:ring-indigo-200`}
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {typeof error === 'string' ? error : error?.error || 'Signup failed'}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-4 py-2 rounded-2xl bg-indigo-600 text-white font-medium disabled:opacity-60"
            >
              {status === 'loading' ? 'Creating…' : 'Create account'}
            </button>

            <Link to="/login" className="text-sm text-slate-600 hover:underline">
              Already have an account?
            </Link>
          </div>
        </form>

        <div className="mt-4 text-xs text-slate-500">
          By creating an account you agree to our demo terms. This app is for learning and demo purposes.
        </div>
      </div>
    </div>
  );
}
