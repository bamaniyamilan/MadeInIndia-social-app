import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

export const loginUser = createAsyncThunk('auth/login', async (creds) => {
    const res = await axios.post(`${API}/auth/login`, creds);
    return res.data;
});

const authSlice = createSlice({
    name: 'auth',
    initialState: { user: null, token: null, status: 'idle' },
    reducers: { logout(state) { state.user = null; state.token = null; } },
    extraReducers: (builder) => {
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
        });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;