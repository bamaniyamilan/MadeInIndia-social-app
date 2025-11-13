// client/src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Read token/user from localStorage if present
const savedToken = localStorage.getItem('mi_token') || null;
const savedUser = localStorage.getItem('mi_user') ? JSON.parse(localStorage.getItem('mi_user')) : null;

// Async thunks
export const signup = createAsyncThunk('auth/signup', async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API}/auth/signup`, payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: err.message });
  }
});

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API}/auth/login`, payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: err.message });
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    if (!token) return rejectWithValue({ error: 'No token' });
    const res = await axios.get(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: err.message });
  }
});

const initialState = {
  user: savedUser,
  token: savedToken,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      localStorage.removeItem('mi_token');
      localStorage.removeItem('mi_user');
    },
    setToken(state, action) {
      state.token = action.payload;
      localStorage.setItem('mi_token', action.payload);
    },
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('mi_user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // signup
      .addCase(signup.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
        if (action.payload.token) localStorage.setItem('mi_token', action.payload.token);
        if (action.payload.user) localStorage.setItem('mi_user', JSON.stringify(action.payload.user));
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.error || action.error?.message;
      })

      // login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
        if (action.payload.token) localStorage.setItem('mi_token', action.payload.token);
        if (action.payload.user) localStorage.setItem('mi_user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.error || action.error?.message;
      })

      // fetchMe
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user || state.user;
        if (action.payload.user) localStorage.setItem('mi_user', JSON.stringify(action.payload.user));
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.error || action.error?.message;
        // If token invalid, clear it
        if (action.payload?.error === 'Invalid token' || action.payload?.error === 'No token') {
          state.token = null;
          localStorage.removeItem('mi_token');
        }
      });
  },
});

export const { logout, setToken, setUser } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
