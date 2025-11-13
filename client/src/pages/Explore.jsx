// client/src/pages/Explore.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { toggleLike, addComment } from '../features/posts/postsSlice';
import { getMediaUrl } from '../utils/urlHelpers';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

/**
 * Enhanced PostCard for Explore page
 */
function PostCard({ post, onLike, onComment }) {
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [showComments, setShowComments] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post._id, commentText.trim());
    setCommentText('');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(post._id);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <img 
          src={getMediaUrl(post.author?.avatar) || '/placeholder-avatar.png'} 
          alt={`${post.author?.username}'s avatar`}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {post.author?.name || post.author?.username}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>@{post.author?.username}</span>
                  <span>·</span>
                  <span>{formatTime(post.createdAt)}</span>
                </div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>

          {/* Post Content */}
          {post.text && (
            <p className="text-gray-800 dark:text-gray-200 mb-4 leading-relaxed whitespace-pre-wrap">
              {post.text}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Media Gallery */}
          {post.media && post.media.length > 0 && (
            <div className={`mb-4 rounded-xl overflow-hidden ${
              post.media.length === 1 ? 'max-w-2xl' : 
              post.media.length === 2 ? 'grid grid-cols-2 gap-2' :
              'grid grid-cols-2 gap-2'
            }`}>
              {post.media.map((m, i) => (
                <div key={i} className={`relative ${post.media.length === 3 && i === 0 ? 'col-span-2' : ''}`}>
                  {m.type === 'image' ? (
                    <img 
                      src={getMediaUrl(m.url)} 
                      alt={`Post media ${i + 1}`}
                      className="w-full h-auto object-cover rounded-xl"
                    />
                  ) : (
                    <video 
                      controls 
                      src={getMediaUrl(m.url)} 
                      className="w-full h-auto rounded-xl"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <span>{post.likesCount || 0} likes</span>
            <span>{post.commentsCount || 0} comments</span>
            <span>{post.repostsCount || 0} shares</span>
          </div>

          {/* Actions */}
          <div className="flex border-t border-b border-gray-100 dark:border-gray-700 py-2">
            <button 
              onClick={handleLike}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {isLiked ? (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
              Like
            </button>

            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Comment
            </button>

            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmit} className="mt-3 flex gap-3">
            <img 
              src={getMediaUrl(post.author?.avatar) || '/placeholder-avatar.png'} 
              alt="Your avatar"
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <button 
                type="submit" 
                disabled={!commentText.trim()}
                className="px-4 py-2 rounded-full bg-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </article>
  );
}

/**
 * Popular Tags Component
 */
function PopularTags({ onTagClick, loading }) {
  const [popularTags, setPopularTags] = useState([]);

  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        // This would typically come from your API
        const mockTags = [
          { name: 'travel', count: 142 },
          { name: 'food', count: 89 },
          { name: 'technology', count: 76 },
          { name: 'art', count: 54 },
          { name: 'music', count: 43 },
          { name: 'fitness', count: 38 }
        ];
        setPopularTags(mockTags);
      } catch (err) {
        console.error('Failed to fetch popular tags', err);
      }
    };

    fetchPopularTags();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        Popular Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag, index) => (
          <button
            key={index}
            onClick={() => onTagClick(tag.name)}
            disabled={loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 rounded-full text-sm font-medium transition-colors duration-200"
          >
            #{tag.name}
            <span className="text-xs text-gray-500 dark:text-gray-400">{tag.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const dispatch = useDispatch();
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchExplore = useCallback(async ({ page = 1, q = '', tag = '' } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (tag) params.set('tag', tag);
      params.set('page', page);
      params.set('limit', meta.limit || 10);

      const res = await axios.get(`${API}/posts/explore?${params.toString()}`);
      const newPosts = res.data.posts || [];
      
      if (page === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setMeta(res.data.meta || { page, limit: 10, total: newPosts.length });
      setHasMore(newPosts.length >= (meta.limit || 10));
    } catch (err) {
      console.error('fetchExplore error', err);
      setError(err.response?.data?.error || err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [meta.limit]);

  useEffect(() => {
    fetchExplore({ page: 1, q: '', tag: '' });
  }, [fetchExplore]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setHasMore(true);
    await fetchExplore({ page: 1, q, tag });
  };

  const handleTagClick = (selectedTag) => {
    setTag(selectedTag);
    setHasMore(true);
    fetchExplore({ page: 1, q, tag: selectedTag });
  };

  const clearFilters = () => {
    setQ('');
    setTag('');
    setHasMore(true);
    fetchExplore({ page: 1, q: '', tag: '' });
  };

  const loadMore = async () => {
    const next = (meta.page || 1) + 1;
    await fetchExplore({ page: next, q, tag });
  };

  const handleLike = async (postId) => {
    try {
      await dispatch(toggleLike({ postId })).unwrap();
      setPosts(prev => prev.map(p => p._id === postId ? { 
        ...p, 
        likesCount: (p.likesCount || 0) + (p.isLiked ? -1 : 1),
        isLiked: !p.isLiked 
      } : p));
    } catch (err) {
      console.error('like error', err);
    }
  };

  const handleComment = async (postId, text) => {
    try {
      await dispatch(addComment({ postId, text })).unwrap();
      setPosts(prev => prev.map(p => p._id === postId ? { 
        ...p, 
        commentsCount: (p.commentsCount || 0) + 1 
      } : p));
    } catch (err) {
      console.error('comment error', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Explore
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover amazing content from creators around the world
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <PopularTags onTagClick={handleTagClick} loading={loading} />
            
            {/* Search Tips */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Search Tips
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Use keywords to find specific content</li>
                <li>• Add tags like #travel or #food</li>
                <li>• Combine text and tag filters</li>
                <li>• Click popular tags to quick search</li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search Content
                    </label>
                    <div className="relative">
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search posts, descriptions..."
                        className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Filter by Tag
                    </label>
                    <div className="relative">
                      <input
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        placeholder="e.g. travel, food, art..."
                        className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(q || tag) && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Searching...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Search
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Results Header */}
            {(q || tag) && posts.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Search Results
                  {q && ` for "${q}"`}
                  {tag && ` with tag #${tag}`}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                    ({meta.total || posts.length} posts found)
                  </span>
                </h2>
              </div>
            )}

            {/* Loading State */}
            {loading && posts.length === 0 && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 dark:text-red-300">{error}</span>
                </div>
              </div>
            )}

            {/* Posts Grid */}
            <section>
              {posts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No posts found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {q || tag ? 'Try adjusting your search terms or filters' : 'Be the first to create amazing content!'}
                  </p>
                  {q || tag ? (
                    <button
                      onClick={clearFilters}
                      className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      Clear Search
                    </button>
                  ) : null}
                </div>
              )}

              {posts.map((post) => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onLike={handleLike} 
                  onComment={handleComment} 
                />
              ))}
            </section>

            {/* Load More */}
            {hasMore && posts.length > 0 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  ) : (
                    'Load More Posts'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}