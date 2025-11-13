import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth, setUser } from '../features/auth/authSlice';
import { fetchFeed } from '../features/posts/postsSlice';
import { getMediaUrl } from '../utils/urlHelpers';
import { logout } from '../features/auth/authSlice';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

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
  const navigate = useNavigate();
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
  const [activeTab, setActiveTab] = useState('posts');

  const isMe = me && (me.username === username || username === 'me');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const uname = isMe ? me?.username : username;
      const res = await axios.get(`${API}/users/${uname}`);
      setProfile(res.data.user);
      setForm({
        name: res.data.user.name || '',
        bio: res.data.user.bio || '',
        location: res.data.user.location || null,
      });

      // Fetch user's posts
      const postsRes = await axios.get(`${API}/posts/user/${res.data.user._id}?limit=20`);
      setUserPosts(postsRes.data.posts || []);
    } catch (err) {
      console.error('fetchProfile error', err);
      setError(err.response?.data?.error || err.message || 'Failed to load profile');
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

  // Add this logout handler function inside the component
const handleLogout = () => {
  dispatch(logout());
  navigate('/');
};

  const handleLocationChange = (e) => {
    const value = e.target.value;
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
      const loc = safeParseLocation(form.location) || (typeof form.location === 'string' && form.location.trim() ? { city: form.location.trim(), country: '' } : null);
      if (loc) fd.append('location', JSON.stringify(loc));
      if (avatarFile) fd.append('avatar', avatarFile);

      const res = await axios.put(`${API}/users/`, fd, getAuthHeaders());
      setProfile(res.data.user);
      if (isMe) dispatch(setUser(res.data.user));
      setEditing(false);
      setAvatarFile(null);
    } catch (err) {
      console.error('save profile error', err);
      setError(err.response?.data?.error || err.message || 'Could not save');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!token) return navigate('/login');
    setActionLoading(true);
    setError(null);
    try {
      const target = profile.username;
      const isFollowing = profile.followers?.some((id) => String(id) === String(me?._id));
      const path = isFollowing ? 'unfollow' : 'follow';
      await axios.post(`${API}/users/${target}/${path}`, {}, getAuthHeaders());
      await fetchProfile();
      dispatch(fetchFeed({ page: 1, limit: 20 }));
    } catch (err) {
      console.error('follow toggle error', err);
      setError(err.response?.data?.error || err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const formatLocation = (location) => {
    if (!location) return null;
    if (typeof location === 'string') return location;
    if (location.city && location.country) return `${location.city}, ${location.country}`;
    if (location.city) return location.city;
    return JSON.stringify(location);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          <div className="flex gap-4">
            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-full -mt-16 ml-6 border-4 border-white dark:border-gray-900"></div>
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Profile Not Found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Banner */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-200"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 overflow-hidden">
                <img
                  src={getMediaUrl(avatarPreview || profile.avatar)}
                  alt={profile.name || profile.username}
                  className="w-full h-full object-cover"
                />
              </div>
              {editing && (
                <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {profile.name || profile.username}
                    </h1>
                    <span className="text-lg text-gray-500 dark:text-gray-400">@{profile.username}</span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {profile.bio || 'No bio yet. Share something about yourself!'}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {profile.followers?.length || 0} followers
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {userPosts.length} posts
                    </div>
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {formatLocation(profile.location)}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {isMe ? (
    <>
      <button
        onClick={() => setEditing(!editing)}
        className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium"
      >
        {editing ? 'Cancel' : 'Edit Profile'}
      </button>
      <button
        onClick={() => navigate('/settings')}
        className="p-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
        title="Settings"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      <button
        onClick={handleLogout}
        className="p-2 border-2 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-full hover:border-red-500 dark:hover:border-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
        title="Logout"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </>
  ) : (
                    <button
                      onClick={handleFollowToggle}
                      disabled={actionLoading}
                      className={`px-8 py-2 rounded-full font-semibold transition-all duration-200 ${profile.followers?.some((id) => String(id) === String(me?._id))
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      {actionLoading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : profile.followers?.some((id) => String(id) === String(me?._id)) ? (
                        'Following'
                      ) : (
                        'Follow'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {editing && isMe && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    value={form.name}
                    onChange={handleChange('name')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    value={typeof form.location === 'string' ? form.location : JSON.stringify(form.location || {})}
                    onChange={handleLocationChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder='e.g., "Mumbai, India" or JSON'
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={handleChange('bio')}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell everyone about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {avatarPreview && (
                  <div className="mt-3 w-24 h-24 rounded-xl overflow-hidden border-2 border-blue-500">
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'posts'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab('media')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'media'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                Media
              </button>
              <button
                onClick={() => setActiveTab('likes')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'likes'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                Likes
              </button>
            </nav>
          </div>

          {/* Posts Content */}
          <div className="p-6">
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {userPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No posts yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {isMe ? 'Share your first post to get started!' : 'This user hasn\'t posted anything yet.'}
                    </p>
                    {isMe && (
                      <button
                        onClick={() => navigate('/feed')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      >
                        Create Post
                      </button>
                    )}
                  </div>
                ) : (
                  userPosts.map((post) => (
                    <div key={post._id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start gap-3">
                        <img
                          src={getMediaUrl(post.author?.avatar) || '/placeholder-avatar.png'}
                          alt={post.author?.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {post.author?.name}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              @{post.author?.username}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500 text-sm">•</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-3">{post.text}</p>
                          {post.media?.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {post.media.slice(0, 4).map((media, index) => (
                                <div key={index} className="rounded-lg overflow-hidden">
                                  {media.type === 'image' ? (
                                    <img
                                      src={getMediaUrl(media.url)}
                                      alt={`Post media ${index + 1}`}
                                      className="w-full h-32 object-cover"
                                    />
                                  ) : (
                                    <video
                                      src={getMediaUrl(media.url)}
                                      className="w-full h-32 object-cover"
                                      controls
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>❤️ {post.likesCount || 0}</span>
                            <span>💬 {post.commentsCount || 0}</span>
                            <span>🔄 {post.repostsCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'media' && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No media yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {isMe ? 'Share photos and videos in your posts!' : 'This user hasn\'t shared any media yet.'}
                </p>
              </div>
            )}

            {activeTab === 'likes' && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No likes yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {isMe ? 'Like posts to see them here!' : 'This user hasn\'t liked any posts yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}