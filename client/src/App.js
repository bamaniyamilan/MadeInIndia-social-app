// client/src/App.js
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectToken, selectUser } from './features/auth/authSlice';

// Lazy pages (we'll add these files next)
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Feed = lazy(() => import('./pages/Feed'));
const Profile = lazy(() => import('./pages/Profile'));
const Explore = lazy(() => import('./pages/Explore'));
const NotFound = lazy(() => import('./pages/NotFound'));

/**
 * RequireAuth - wrapper for protecting routes
 * If no token -> redirect to /login with `from` state
 */
function RequireAuth({ children }) {
  const token = useSelector(selectToken);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

/**
 * Simple top navigation (replace/stylize later)
 */
function TopNav() {
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);

  return (
    <header className="bg-white border-b">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="text-2xl font-semibold">MadeInIndia</div>
          <div className="text-sm text-slate-500">@IndianMade</div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/explore" className="text-sm clickable">Explore</Link>
          {token ? (
            <>
              <Link to="/feed" className="text-sm clickable">Feed</Link>
              <Link to={`/profile/${user?.username || 'me'}`} className="text-sm clickable">
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm clickable">Login</Link>
              <Link to="/signup" className="text-sm clickable">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-1 py-8">
        <div className="container">
          <Suspense fallback={<div className="text-center py-10">Loading…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route
                path="/feed"
                element={
                  <RequireAuth>
                    <Feed />
                  </RequireAuth>
                }
              />

              <Route path="/explore" element={<Explore />} />
              <Route path="/profile/:username" element={<Profile />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      <footer className="border-t py-4">
        <div className="container text-center text-sm text-slate-500">
          © {new Date().getFullYear()} MadeInIndia — Built with ❤️ in India
        </div>
      </footer>
    </div>
  );
}
