// client/src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-12">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">MadeInIndia — Connect, Share, Celebrate</h1>
          <p className="mt-4 text-lg text-slate-600">
            A social network built by Indians, for Indians. Share moments, follow friends, discover trends,
            and find local places — all with a fast, clean interface.
          </p>

          <ul className="mt-6 space-y-3 text-slate-700">
            <li>• Real-time feed & notifications</li>
            <li>• Posts with images & location tags (OpenStreetMap)</li>
            <li>• Follow users, comment, like, and repost</li>
            <li>• Simple, privacy-respecting architecture</li>
          </ul>

          <div className="mt-8 flex gap-3">
            <Link
              to="/signup"
              className="px-5 py-2 rounded-2xl bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700"
            >
              Create account
            </Link>
            <Link to="/login" className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-700">
              Log in
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Built with Tailwind • Redux • Node • MongoDB • Work Sans
          </p>
        </div>

        <div className="hidden lg:flex items-center justify-center">
          <div className="w-full card p-6">
            <h3 className="text-xl font-semibold mb-3">What people post</h3>

            <div className="space-y-3 text-sm text-slate-700">
              <div className="p-3 rounded-lg bg-slate-50">
                <div className="font-medium">@rajan</div>
                <div className="mt-1 text-slate-600">Exploring the street food lanes of Ahmedabad — must try the khandvi!</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50">
                <div className="font-medium">@neha</div>
                <div className="mt-1 text-slate-600">Shared a quick recipe video — dal with a twist. #homecooking</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50">
                <div className="font-medium">@milanb</div>
                <div className="mt-1 text-slate-600">Launching my first open-source project today 🚀 — MadeInIndia social app.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h4 className="font-semibold mb-2">Local discovery</h4>
          <p className="text-sm text-slate-600">Tag locations and find posts near you using OpenStreetMap data.</p>
        </div>
        <div className="card">
          <h4 className="font-semibold mb-2">Privacy first</h4>
          <p className="text-sm text-slate-600">Choose who sees your posts and control your profile easily.</p>
        </div>
        <div className="card">
          <h4 className="font-semibold mb-2">Fast & modern</h4>
          <p className="text-sm text-slate-600">Built with React, Tailwind and optimized for mobile and desktop.</p>
        </div>
      </section>
    </div>
  );
}
