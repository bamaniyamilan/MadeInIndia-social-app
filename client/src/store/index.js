// client/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';

// TODO: create these slices next (I'll provide them) and import here.
// For now create placeholder reducers or simple slices to avoid runtime errors.
// e.g. import authReducer from '../features/auth/authSlice';
import authReducer from '../features/auth/authSlice'; // will be created next
import postsReducer from '../features/posts/postsSlice'; // will be created later

const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    // add other slices here: users, ui, notifications, chat, etc.
  },
  devTools: process.env.NODE_ENV !== 'production',
  // You can add middleware here (e.g. for sockets or logging) if needed:
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(customMiddleware),
});

export default store;
