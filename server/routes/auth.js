const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const TOKEN_EXPIRY = '7d'; // token lifetime

// --- Simple auth middleware (keeps this file self-contained for now) ---
router.get('/me', authMiddleware, async (req, res) => {
  return res.json({ user: req.user });
});

// --- Helpers ---
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

// --- Routes ---

// Signup
// POST /api/auth/signup
// body: { name, username, email, password }
router.post('/signup', async (req, res) => {
  try {
    const { name = '', username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email and password are required' });
    }

    // check unique username/email
    const existingUser = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    });
    if (existingUser) {
      if (existingUser.username === username.toLowerCase()) {
        return res.status(409).json({ error: 'Username already taken' });
      }
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = new User({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
    });

    await user.save();

    const token = generateToken(user);
    return res.status(201).json({ user: user.toJSON(), token });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login
// POST /api/auth/login
// body: { email, password }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    return res.json({ user: user.toJSON(), token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user
// GET /api/auth/me
// Header: Authorization: Bearer <token>
router.get('/me', authMiddleware, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
