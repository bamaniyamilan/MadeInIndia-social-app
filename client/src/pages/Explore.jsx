// client/src/pages/Explore.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { toggleLike, addComment } from '../features/posts/postsSlice';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Inline PostCard for Explore page (keeps this file self-contained)
 */
function PostCard({ post, onLike, onComment }) {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post._id, commentText.trim());
    setCommentText('');
  };

  return (
    <article className="card">
      <div className="flex items-start gap-3">
        <img src={post.author?.avatar || '/placeholder-avatar.png'} alt="avatar" className="avatar" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{post.author?.name || post.author?.username}</div>
              <div className="text-xs text-slate-500">@{post.author?.username} · {new Date(post.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-sm text-slate-500 clickable">...</div>
          </div>

          {post.text && <p className="mt-3 text-slate-700">{post.text}</p>}

          {post.media && post.media.length > 0 && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {post.media.map((m, i) => (
                <div key={i} className="rounded overflow-hidden">
                  {m.type === 'image' ? (
                    <img src={m.url} alt={`media-${i}`} className="w-full object-cover max-h-80" />
                  ) : (
                    <video controls src={m.url} className="w-full max-h-80" />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
            <button onClick={() => onLike(post._id)} className="clickable">👍 {post.likesCount || 0}</button>
            <div>💬 {post.commentsCount || 0}</div>
            <div>🔁 {post.repostsCount || 0}</div>
          </div>

          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200"
            />
            <button type="submit" className="px-3 py-2 rounded-xl bg-indigo-600 text-white">Comment</button>
          </form>
        </div>
      </div>
    </article>
  );
}

export default function ExplorePage() {
  const dispatch = useDispatch();
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExplore = useCallback(async ({ page = 1, q = '', tag = '' } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (tag) params.set('tag', tag);
      params.set('page', page);
      params.set('limit', meta.limit || 20);

      const res = await axios.get(`${API}/posts/explore?${params.toString()}`);
      setPosts((page === 1) ? (res.data.posts || []) : (prev => [...prev, ...(res.data.posts || [])]));
      setMeta(res.data.meta || { page, limit: 20, total: (res.data.posts || []).length });
    } catch (err) {
      console.error('fetchExplore error', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [meta.limit]);

  useEffect(() => {
    fetchExplore({ page: 1, q: '', tag: '' });
  }, [fetchExplore]);

  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchExplore({ page: 1, q, tag });
  };

  const loadMore = async () => {
    const next = (meta.page || 1) + 1;
    await fetchExplore({ page: next, q, tag });
    setMeta((m) => ({ ...m, page: next }));
  };

  const handleLike = async (postId) => {
    try {
      await dispatch(toggleLike({ postId })).unwrap();
      // update local likesCount optimistically by re-fetching single post or simple local adjustment:
      setPosts((prev) => prev.map(p => p._id === postId ? { ...p, likesCount: (p.likesCount||0) + 1 } : p));
    } catch (err) {
      console.error('like error', err);
    }
  };

  const handleComment = async (postId, text) => {
    try {
      await dispatch(addComment({ postId, text })).unwrap();
      // naive: increase local commentsCount
      setPosts((prev) => prev.map(p => p._id === postId ? { ...p, commentsCount: (p.commentsCount||0) + 1 } : p));
    } catch (err) {
      console.error('comment error', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-3 items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search text or hashtags"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200"
          />
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Filter by tag (e.g. travel)"
            className="px-3 py-2 rounded-xl border border-slate-200"
          />
          <button type="submit" className="px-4 py-2 rounded-2xl bg-indigo-600 text-white">Search</button>
        </form>
      </div>

      {loading && posts.length === 0 && <div className="text-center py-8">Loading explore…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <section className="space-y-4">
        {posts.length === 0 && !loading && <div className="text-center text-slate-600 py-8">No posts found.</div>}
        {posts.map((p) => (
          <PostCard key={p._id} post={p} onLike={handleLike} onComment={handleComment} />
        ))}
      </section>

      {posts.length > 0 && (
        <div className="flex justify-center mt-4">
          <button onClick={loadMore} className="px-4 py-2 rounded-2xl border">
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
