// client/src/pages/Signup.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signup, selectAuth } from '../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, status, error } = useSelector(selectAuth);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    username: false,
    password: false
  });

  const { name, username, email, password } = formData;

  // Validation
  const usernameValid = /^[a-z0-9_]{3,30}$/.test(username);
  const passwordValid = password.length >= 6;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const showUsernameError = touched.username && username && !usernameValid;
  const showPasswordError = touched.password && password && !passwordValid;

  useEffect(() => {
    if (token) {
      navigate('/feed', { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setFormData(prev => ({ ...prev, [name]: value.toLowerCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!usernameValid) {
      alert('Username must be 3-30 characters, lowercase letters, numbers or underscores.');
      return;
    }
    if (!passwordValid) {
      alert('Password must be at least 6 characters.');
      return;
    }
    
    try {
      await dispatch(signup({ name, username, email, password })).unwrap();
    } catch (err) {
      console.error('Signup failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Join MadeInIndia
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Connect with people and share your moments
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full name <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-all duration-200"
                  placeholder="Rajan Patel"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700
                           text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-all duration-200 pr-10
                           ${showUsernameError 
                             ? 'border-red-500 dark:border-red-400' 
                             : 'border-gray-300 dark:border-gray-600'}`}
                  placeholder="choose_a_username"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                {usernameValid && username && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              {showUsernameError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  Username must be 3-30 characters, lowercase letters, numbers or underscores only.
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Lowercase letters, numbers, and underscores only. 3–30 characters.
              </p>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-all duration-200"
                  placeholder="you@example.com"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700
                           text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-all duration-200 pr-10
                           ${showPasswordError 
                             ? 'border-red-500 dark:border-red-400' 
                             : 'border-gray-300 dark:border-gray-600'}`}
                  placeholder="At least 6 characters"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                {passwordValid && password && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              {showPasswordError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  Password must be at least 6 characters long.
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-700 dark:text-red-300">
                    {typeof error === 'string' ? error : error?.error || 'Signup failed'}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'loading' || !usernameValid || !passwordValid || !email}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 
                       hover:from-indigo-700 hover:to-purple-700
                       disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                       text-white font-medium rounded-xl shadow-lg
                       transform transition-all duration-200 hover:scale-[1.02] 
                       focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                       dark:focus:ring-offset-gray-800"
            >
              {status === 'loading' ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating your account...
                </div>
              ) : (
                'Create account'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 
                           dark:hover:text-indigo-300 transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By creating an account, you agree to our demo terms. This app is for learning and demo purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}