// client/src/features/posts/postsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { selectToken } from '../auth/authSlice';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper to get auth headers
const authConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    // Note: when sending FormData, don't set Content-Type here; browser will set boundary
  },
});

/**
 * Thunks
 */

// Fetch feed (protected)
export const fetchFeed = createAsyncThunk(
  'posts/fetchFeed',
  async ({ page = 1, limit = 20 } = {}, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState());
      const res = await axios.get(`${API}/posts/feed?page=${page}&limit=${limit}`, authConfig(token));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: err.message });
    }
  }
);

// Create a post (protected) - payload should be FormData
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState());
      const res = await axios.post(`${API}/posts`, formData, authConfig(token));
      return res.data.post;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: err.message });
    }
  }
);

// Toggle like
export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async ({ postId }, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState());
      const res = await axios.post(`${API}/posts/${postId}/like`, {}, authConfig(token));
      return { postId, result: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: err.message });
    }
  }
);

// Add comment
export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, text }, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState());
      const res = await axios.post(`${API}/posts/${postId}/comment`, { text }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { postId, comment: res.data.comment };
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: err.message });
    }
  }
);

/**
 * Slice
 */
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    meta: { total: 0, page: 1, limit: 20 },
    status: 'idle',
    error: null,
    creating: false,
  },
  reducers: {
    // local optimistic updates can be added here if desired
    prependPost(state, action) {
      state.posts.unshift(action.payload);
      state.meta.total += 1;
    },
    updatePostInList(state, action) {
      const updated = action.payload;
      const idx = state.posts.findIndex((p) => p._id === updated._id);
      if (idx !== -1) state.posts[idx] = { ...state.posts[idx], ...updated };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchFeed
      .addCase(fetchFeed.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.posts = action.payload.posts || [];
        state.meta = action.payload.meta || state.meta;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.error || action.error?.message;
      })

      // createPost
      .addCase(createPost.pending, (state) => {
        state.creating = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.creating = false;
        // new post returned; add to start of feed
        state.posts.unshift(action.payload);
        state.meta.total += 1;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload?.error || action.error?.message;
      })

      // toggleLike
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, result } = action.payload;
        const idx = state.posts.findIndex((p) => p._id === postId);
        if (idx !== -1) {
          // result includes likesCount and liked boolean
          state.posts[idx].likesCount = result.likesCount ?? state.posts[idx].likesCount;
          // update likes array locally if possible (coarse)
          if (result.liked) {
            state.posts[idx].likes = state.posts[idx].likes || [];
            // You might push current user id, but client may not have it here — keep count as source of truth
          } else {
            // can't reliably remove specific id without knowing it here
          }
        }
      })

      // addComment
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const idx = state.posts.findIndex((p) => p._id === postId);
        if (idx !== -1) {
          state.posts[idx].comments = state.posts[idx].comments || [];
          state.posts[idx].comments.push(comment);
          state.posts[idx].commentsCount = (state.posts[idx].commentsCount || 0) + 1;
        }
      });
  },
});

export const { prependPost, updatePostInList } = postsSlice.actions;
export default postsSlice.reducer;
