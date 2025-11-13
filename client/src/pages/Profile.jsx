// client/src/pages/Profile.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth, setUser } from '../features/auth/authSlice';
import { fetchFeed } from '../features/posts/postsSlice'; // optional, used to refresh feed if needed

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function safeParseLocation(locStr) {
  try {
    if (!locStr) return null;
    if (typeof locStr === 'object') return locStr;
    return JSON.parse(locStr);
  } catch {
    return null;
  }
}

export default function ProfilePage() {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { user: me, token } = useSelector(selectAuth);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', location: null });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  const isMe = me && (me.username === username || username === 'me');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const uname = isMe ? me?.username : username;
      const res = await axios.get(`${API}/users/${uname}`);
      setProfile(res.data.user);
      // set form defaults
      setForm({
        name: res.data.user.name || '',
        bio: res.data.user.bio || '',
        location: res.data.user.location || null,
      });
      // fetch user's posts (simple explore by author: we don't have direct endpoint, use explore filter by tag not ideal.
      // Instead we can fetch posts and filter on client (inefficient but fine for demo).
      const postsRes = await axios.get(`${API}/posts/explore?limit=20`);
      const all = postsRes.data.posts || [];
      setUserPosts(all.filter((p) => p.author?.username === res.data.user.username));
    } catch (err) {
      console.error('fetchProfile error', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [username, me, isMe]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // Edit handlers
  const handleChange = (field) => (e) => {
    setForm((s) => ({ ...s, [field]: e.target.value }));
  };

  const handleLocationChange = (e) => {
    // user may enter JSON or simple "City, Country"
    const value = e.target.value;
    // keep as string for now — convert on submit
    setForm((s) => ({ ...s, location: value }));
  };

  const handleAvatarSelect = (e) => {
    const f = e.target.files?.[0] || null;
    setAvatarFile(f);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      if (form.name !== undefined) fd.append('name', form.name);
      if (form.bio !== undefined) fd.append('bio', form.bio);
      // if location is a string attempt to parse JSON, otherwise if it's plain text send as JSON object with city
      const loc = safeParseLocation(form.location) || (typeof form.location === 'string' && form.location.trim() ? { city: form.location.trim(), country: '' } : null);
      if (loc) fd.append('location', JSON.stringify(loc));
      if (avatarFile) fd.append('avatar', avatarFile);

      const res = await axios.put(`${API}/users/`, fd, getAuthHeaders());
      setProfile(res.data.user);
      // update auth user if editing self
      if (isMe) {
        dispatch(setUser(res.data.user));
      }
      setEditing(false);
    } catch (err) {
      console.error('save profile error', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!token) return alert('Login required');
    setActionLoading(true);
    setError(null);
    try {
      const target = profile.username;
      // check if already following
      const isFollowing = profile.followers?.some((id) => String(id) === String(me?._id));
      const path = isFollowing ? 'unfollow' : 'follow';
      await axios.post(`${API}/users/${target}/${path}`, {}, getAuthHeaders());
      // refresh profile
      await fetchProfile();
      // optionally refresh feed
      dispatch(fetchFeed({ page: 1, limit: 20 }));
    } catch (err) {
      console.error('follow toggle error', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading profile…</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!profile) return <div className="text-center py-8">Profile not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-center gap-4">
          <img
            src={avatarPreview || profile.avatar || '/placeholder-avatar.png'}
            alt="avatar"
            className="avatar"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">{profile.name || profile.username}</h2>
              <div className="text-sm text-slate-500">@{profile.username}</div>
            </div>

            <p className="mt-2 text-sm text-slate-700">{profile.bio || 'No bio yet.'}</p>

            <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
              <div>{profile.followers?.length || 0} followers</div>
              <div>{profile.following?.length || 0} following</div>
              <div>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ''}</div>
            </div>
          </div>

          <div>
            {isMe ? (
              <div className="flex gap-2">
                <button onClick={() => setEditing((s) => !s)} className="px-3 py-1 rounded-xl border">
                  {editing ? 'Cancel' : 'Edit profile'}
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={handleFollowToggle}
                  disabled={actionLoading}
                  className="px-3 py-1 rounded-xl bg-indigo-600 text-white"
                >
                  {profile.followers?.some((id) => String(id) === String(me?._id)) ? 'Following' : 'Follow'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {editing && isMe && (
        <form className="card" onSubmit={handleSave}>
          <h3 className="font-semibold mb-3">Edit profile</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Full name</label>
              <input value={form.name} onChange={handleChange('name')} className="w-full px-3 py-2 rounded-xl border" />
            </div>

            <div>
              <label className="block text-sm mb-1">Bio</label>
              <textarea value={form.bio} onChange={handleChange('bio')} rows={3} className="w-full px-3 py-2 rounded-xl border" />
            </div>

            <div>
              <label className="block text-sm mb-1">Location (JSON or text)</label>
              <input
                value={typeof form.location === 'string' ? form.location : JSON.stringify(form.location || {})}
                onChange={handleLocationChange}
                className="w-full px-3 py-2 rounded-xl border"
                placeholder='{"city":"Ahmedabad","country":"India","latitude":23.0225,"longitude":72.5714} or "Ahmedabad, India"'
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Avatar</label>
              <input type="file" accept="image/*" onChange={handleAvatarSelect} />
              {avatarPreview && <div className="mt-2"><img src={avatarPreview} alt="preview" className="avatar" /></div>}
            </div>

            <div className="flex justify-end gap-2">
              <button type="submit" disabled={actionLoading} className="px-4 py-2 rounded-2xl bg-indigo-600 text-white">
                {actionLoading ? 'Saving…' : 'Save profile'}
              </button>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>
        </form>
      )}

      <section>
        <h3 className="text-lg font-semibold mb-3">Recent posts</h3>
        {userPosts.length === 0 ? (
          <div className="text-sm text-slate-600">No posts yet.</div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((p) => (
              <div key={p._id} className="card">
                <div className="flex items-start gap-3">
                  <img src={p.author?.avatar || '/placeholder-avatar.png'} alt="avatar" className="avatar" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.author?.name || p.author?.username}</div>
                        <div className="text-xs text-slate-500">@{p.author?.username} · {new Date(p.createdAt).toLocaleString()}</div>
                      </div>
                    </div>

                    {p.text && <p className="mt-2 text-slate-700">{p.text}</p>}
                    {p.media?.length > 0 && (
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {p.media.map((m, i) => (
                          <div key={i} className="rounded overflow-hidden">
                            {m.type === 'image' ? <img src={m.url} alt="" className="w-full object-cover max-h-72" /> : <video controls src={m.url} className="w-full max-h-72" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
