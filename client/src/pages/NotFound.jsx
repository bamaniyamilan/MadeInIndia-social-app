// client/src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <h1 className="text-4xl font-extrabold mb-4">404</h1>
      <p className="text-lg text-slate-600 mb-6">Sorry — the page you were looking for doesn't exist.</p>
      <div className="flex items-center justify-center gap-3">
        <Link to="/" className="px-4 py-2 rounded-2xl bg-indigo-600 text-white">Go home</Link>
        <Link to="/explore" className="px-4 py-2 rounded-2xl border">Explore</Link>
      </div>
    </div>
  );
}
