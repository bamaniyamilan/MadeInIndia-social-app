// client/src/pages/Feed.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed, createPost, toggleLike, addComment } from '../features/posts/postsSlice';
import { selectAuth } from '../features/auth/authSlice';

/**
 * Simple PostCard component (inline)
 * Props: post, onLike(postId), onComment(postId, text)
 */
function PostCard({ post, onLike, onComment }) {
  const [commentText, setCommentText] = useState('');

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post._id, commentText.trim());
    setCommentText('');
  };

  return (
    <article className="card mb-4">
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
            <button onClick={() => onLike(post._id)} className="clickable">
              👍 {post.likesCount || 0}
            </button>
            <div>💬 {post.commentsCount || 0}</div>
            <div>🔁 {post.repostsCount || 0}</div>
          </div>

          <form onSubmit={handleComment} className="mt-3 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200"
            />
            <button type="submit" className="px-3 py-2 rounded-xl bg-indigo-600 text-white">
              Comment
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

/**
 * CreatePost component (inline)
 * Allows text + multiple images (up to 6)
 */
function CreatePost({ onCreate }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files || []).slice(0, 6));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return alert('Add text or images to post');

    const formData = new FormData();
    formData.append('text', text.trim());
    files.forEach((file) => formData.append('files', file));
    // tags or location can be appended by client later: formData.append('tags', JSON.stringify([...]));

    try {
      setSubmitting(true);
      await onCreate(formData);
      setText('');
      setFiles([]);
      // reset file input value manually (if needed)
      const input = document.getElementById('create-post-files');
      if (input) input.value = '';
    } catch (err) {
      console.error('Create post failed', err);
      alert('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card mb-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's happening?"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 resize-none"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="clickable text-sm">
              <input id="create-post-files" type="file" multiple accept="image/*,video/*" onChange={handleFiles} className="hidden" />
              <span className="px-3 py-2 rounded-xl border border-slate-200">📎 Add</span>
            </label>
            <div className="text-xs text-slate-500">{files.length} selected</div>
          </div>

          <div className="flex items-center gap-2">
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-2xl bg-indigo-600 text-white">
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/**
 * Feed page - main export
 */
export default function FeedPage() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const { posts, meta, status, error } = useSelector((s) => s.posts);
  const [page, setPage] = useState(1);

  const loadFeed = useCallback(async (p = 1) => {
    try {
      await dispatch(fetchFeed({ page: p, limit: 20 })).unwrap();
    } catch (err) {
      console.error('Failed to load feed', err);
    }
  }, [dispatch]);

  useEffect(() => {
    // initial load
    loadFeed(1);
  }, [loadFeed]);

  const handleCreate = async (formData) => {
    // dispatch createPost thunk (FormData)
    const created = await dispatch(createPost(formData)).unwrap();
    // optionally scroll to top or insert created (postsSlice already prepends)
    return created;
  };

  const handleLike = async (postId) => {
    try {
      await dispatch(toggleLike({ postId })).unwrap();
      // Optionally re-fetch single post or rely on optimistic update from slice
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
    <div className="max-w-2xl mx-auto">
      <CreatePost onCreate={handleCreate} />

      {status === 'loading' && posts.length === 0 && <div className="text-center py-10">Loading feed…</div>}
      {error && <div className="text-sm text-red-600">{error?.error || error}</div>}

      <section>
        {posts.length === 0 && status === 'succeeded' && <div className="text-center py-8 text-slate-600">No posts yet — follow people to see their posts.</div>}
        {posts.map((p) => (
          <PostCard key={p._id} post={p} onLike={handleLike} onComment={handleComment} />
        ))}
      </section>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => {
            const next = page + 1;
            setPage(next);
            loadFeed(next);
          }}
          className="px-4 py-2 rounded-2xl border"
        >
          Load more
        </button>
      </div>
    </div>
  );
}
