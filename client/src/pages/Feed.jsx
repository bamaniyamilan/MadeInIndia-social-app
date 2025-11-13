// client/src/pages/Feed.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed, createPost, toggleLike, addComment } from '../features/posts/postsSlice';
import { selectAuth } from '../features/auth/authSlice';
import { getMediaUrl } from '../utils/urlHelpers';
/**
 * Enhanced PostCard component
 */
function PostCard({ post, onLike, onComment }) {
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [showComments, setShowComments] = useState(false);
  
  const handleComment = (e) => {
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
          <form onSubmit={handleComment} className="mt-3 flex gap-3">
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
 * Enhanced CreatePost component
 */
function CreatePost({ onCreate }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFiles = (e) => {
    const newFiles = Array.from(e.target.files || []).slice(0, 6);
    setFiles(prev => [...prev, ...newFiles].slice(0, 6));
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) {
      alert('Add text or images to post');
      return;
    }

    const formData = new FormData();
    formData.append('text', text.trim());
    files.forEach((file) => formData.append('files', file));

    try {
      setSubmitting(true);
      await onCreate(formData);
      setText('');
      setFiles([]);
      setIsExpanded(false);
    } catch (err) {
      console.error('Create post failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <img 
            src=""
           alt=""
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="What's happening?"
              rows={isExpanded ? 4 : 2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            
            {/* File Previews */}
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">Video</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Action Bar */}
            {isExpanded && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*,video/*" 
                      onChange={handleFiles} 
                      className="hidden" 
                    />
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </label>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {files.length}/6 files
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false);
                      setFiles([]);
                      setText('');
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting || (!text.trim() && files.length === 0)}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Posting...
                      </div>
                    ) : (
                      'Post'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

/**
 * Enhanced Feed page
 */
export default function FeedPage() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const { posts, meta, status, error } = useSelector((s) => s.posts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadFeed = useCallback(async (p = 1) => {
    try {
      const result = await dispatch(fetchFeed({ page: p, limit: 10 })).unwrap();
      if (!result.posts || result.posts.length === 0) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load feed', err);
    }
  }, [dispatch]);

  useEffect(() => {
    loadFeed(1);
  }, [loadFeed]);

  const handleCreate = async (formData) => {
    const created = await dispatch(createPost(formData)).unwrap();
    return created;
  };

  const handleLike = async (postId) => {
    try {
      await dispatch(toggleLike({ postId })).unwrap();
    } catch (err) {
      console.error('Like failed', err);
    }
  };

  const handleComment = async (postId, text) => {
    try {
      await dispatch(addComment({ postId, text })).unwrap();
    } catch (err) {
      console.error('Add comment failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Feed
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Latest updates from people you follow
          </p>
        </div>

        {/* Create Post */}
        <CreatePost onCreate={handleCreate} />

        {/* Feed Content */}
        {status === 'loading' && posts.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 dark:text-red-300">
                {typeof error === 'string' ? error : error?.error || 'Failed to load feed'}
              </span>
            </div>
          </div>
        )}

        {/* Posts */}
        <section>
          {posts.length === 0 && status === 'succeeded' && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Follow people to see their posts in your feed
              </p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                Discover People
              </button>
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
              onClick={() => {
                const next = page + 1;
                setPage(next);
                loadFeed(next);
              }}
              disabled={status === 'loading'}
              className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all duration-200"
            >
              {status === 'loading' ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}