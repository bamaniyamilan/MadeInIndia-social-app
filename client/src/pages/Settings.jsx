// client/src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAuth, setUser, logout } from '../features/auth/authSlice';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export default function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector(selectAuth);
  
  const [activeSection, setActiveSection] = useState('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    mentions: true,
    follows: true,
    likes: true,
    comments: true,
    messages: true,
    announcements: false,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowTagging: true,
    allowMessages: 'everyone',
    searchVisibility: true,
  });

  // Account settings
  const [account, setAccount] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Theme settings
  const [theme, setTheme] = useState({
    darkMode: false,
    reduceMotion: false,
    highContrast: false,
    fontSize: 'medium',
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const loadSettings = () => {
      try {
        // Notifications
        const savedNotifications = localStorage.getItem('user_notifications');
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }

        // Privacy
        const savedPrivacy = localStorage.getItem('user_privacy');
        if (savedPrivacy) {
          setPrivacy(JSON.parse(savedPrivacy));
        }

        // Theme
        const savedTheme = localStorage.getItem('user_theme');
        if (savedTheme) {
          const themeData = JSON.parse(savedTheme);
          setTheme(themeData);
          // Apply theme
          document.documentElement.classList.toggle('dark', themeData.darkMode);
          document.documentElement.classList.toggle('reduce-motion', themeData.reduceMotion);
          document.documentElement.classList.toggle('high-contrast', themeData.highContrast);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = (category, data) => {
    try {
      localStorage.setItem(`user_${category}`, JSON.stringify(data));
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    }
  };

  const handleNotificationChange = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    saveSettings('notifications', updated);
  };

  const handlePrivacyChange = (key, value) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    saveSettings('privacy', updated);
  };

  const handleThemeChange = (key, value) => {
    const updated = { ...theme, [key]: value };
    setTheme(updated);
    
    // Apply theme changes immediately
    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark', value);
    } else if (key === 'reduceMotion') {
      document.documentElement.classList.toggle('reduce-motion', value);
    } else if (key === 'highContrast') {
      document.documentElement.classList.toggle('high-contrast', value);
    }
    
    saveSettings('theme', updated);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (account.newPassword !== account.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (account.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API}/users/password`, {
        currentPassword: account.currentPassword,
        newPassword: account.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setAccount({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API}/users/account`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      dispatch(logout());
      navigate('/');
      setMessage({ type: 'success', text: 'Account deleted successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to delete account' });
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/users/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Create and download JSON file
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `madeinindia-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'privacy', name: 'Privacy', icon: '🔒' },
    { id: 'appearance', name: 'Appearance', icon: '🎨' },
    { id: 'account', name: 'Account', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sticky top-6">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="font-medium">{section.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              
              {/* General Settings */}
              {activeSection === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span>⚙️</span>
                    General Settings
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Language</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred language</p>
                      </div>
                      <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Time Zone</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Set your local time zone</p>
                      </div>
                      <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>UTC</option>
                        <option>IST (India)</option>
                        <option>EST</option>
                        <option>PST</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Email Frequency</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">How often to receive email updates</p>
                      </div>
                      <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                        <option>Never</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span>🔔</span>
                    Notification Settings
                  </h2>

                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {key === 'email' && 'Receive notifications via email'}
                            {key === 'push' && 'Receive push notifications'}
                            {key === 'mentions' && 'When someone mentions you'}
                            {key === 'follows' && 'When someone follows you'}
                            {key === 'likes' && 'When someone likes your post'}
                            {key === 'comments' && 'When someone comments on your post'}
                            {key === 'messages' && 'When you receive a message'}
                            {key === 'announcements' && 'Important updates and announcements'}
                          </p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={value}
                            onChange={() => handleNotificationChange(key)}
                          />
                          <span className={`relative w-12 h-6 rounded-full transition-colors ${
                            value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              value ? 'transform translate-x-6' : ''
                            }`} />
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeSection === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span>🔒</span>
                    Privacy Settings
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Profile Visibility</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Who can see your profile</p>
                      <div className="space-y-2">
                        {['public', 'followers', 'private'].map((option) => (
                          <label key={option} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="profileVisibility"
                              checked={privacy.profileVisibility === option}
                              onChange={() => handlePrivacyChange('profileVisibility', option)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700 dark:text-gray-300 capitalize">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Messages</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Who can send you messages</p>
                      <div className="space-y-2">
                        {['everyone', 'followers', 'none'].map((option) => (
                          <label key={option} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="allowMessages"
                              checked={privacy.allowMessages === option}
                              onChange={() => handlePrivacyChange('allowMessages', option)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700 dark:text-gray-300 capitalize">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: 'showOnlineStatus', label: 'Show Online Status', description: 'Let others see when you are online' },
                        { key: 'allowTagging', label: 'Allow Tagging', description: 'Allow others to tag you in posts' },
                        { key: 'searchVisibility', label: 'Search Visibility', description: 'Include your profile in search results' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{item.label}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                          </div>
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={privacy[item.key]}
                              onChange={() => handlePrivacyChange(item.key, !privacy[item.key])}
                            />
                            <span className={`relative w-12 h-6 rounded-full transition-colors ${
                              privacy[item.key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}>
                              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                privacy[item.key] ? 'transform translate-x-6' : ''
                              }`} />
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeSection === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span>🎨</span>
                    Appearance
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Dark Mode</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark theme</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={theme.darkMode}
                          onChange={(e) => handleThemeChange('darkMode', e.target.checked)}
                        />
                        <span className={`relative w-12 h-6 rounded-full transition-colors ${
                          theme.darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                          <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            theme.darkMode ? 'transform translate-x-6' : ''
                          }`} />
                        </span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Reduce Motion</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Minimize animations and transitions</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={theme.reduceMotion}
                          onChange={(e) => handleThemeChange('reduceMotion', e.target.checked)}
                        />
                        <span className={`relative w-12 h-6 rounded-full transition-colors ${
                          theme.reduceMotion ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                          <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            theme.reduceMotion ? 'transform translate-x-6' : ''
                          }`} />
                        </span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">High Contrast</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Increase color contrast for better readability</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={theme.highContrast}
                          onChange={(e) => handleThemeChange('highContrast', e.target.checked)}
                        />
                        <span className={`relative w-12 h-6 rounded-full transition-colors ${
                          theme.highContrast ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                          <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            theme.highContrast ? 'transform translate-x-6' : ''
                          }`} />
                        </span>
                      </label>
                    </div>

                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Font Size</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Adjust the text size</p>
                      <div className="flex gap-4">
                        {['small', 'medium', 'large', 'x-large'].map((size) => (
                          <button
                            key={size}
                            onClick={() => handleThemeChange('fontSize', size)}
                            className={`px-4 py-2 rounded-lg border capitalize ${
                              theme.fontSize === size
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings */}
              {activeSection === 'account' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span>👤</span>
                    Account Settings
                  </h2>

                  {/* Change Password */}
                  <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={account.currentPassword}
                          onChange={(e) => setAccount({ ...account, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={account.newPassword}
                          onChange={(e) => setAccount({ ...account, newPassword: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={account.confirmPassword}
                          onChange={(e) => setAccount({ ...account, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>

                  {/* Data Management */}
                  <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
                    <div className="space-y-4">
                      <button
                        onClick={handleExportData}
                        disabled={loading}
                        className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">Export Data</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Download a copy of your data
                          </div>
                        </div>
                        <span className="text-2xl">📥</span>
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-6 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">Danger Zone</h3>
                    <div className="space-y-4">
                      <button
                        onClick={handleAccountDeletion}
                        disabled={loading}
                        className="w-full flex items-center justify-between p-4 border border-red-300 dark:border-red-700 rounded-xl bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                      >
                        <div className="text-left">
                          <div className="font-medium">Delete Account</div>
                          <div className="text-sm">
                            Permanently delete your account and all data
                          </div>
                        </div>
                        <span className="text-2xl">🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}