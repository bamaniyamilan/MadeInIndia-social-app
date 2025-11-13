const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const User = require('../models/User');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// -----------------
// Storage setup (multer) - store locally, we'll optionally upload to Cloudinary
// -----------------
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// -----------------
// Cloudinary config (optional)
// -----------------
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Helper: upload buffer to Cloudinary (returns secure_url)
const uploadBufferToCloudinary = (buffer, folder = 'madeinindia') =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err);
      resolve(result.secure_url);
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

// -----------------
// Routes
// -----------------

/**
 * GET /api/users
 * Query: ?q=search&page=1&limit=20
 * List users (search by name or username) with simple pagination
 */
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const skip = (page - 1) * limit;

    const filter = q
      ? {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { name: { $regex: q, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({ users, meta: { total, page, limit } });
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

/**
 * GET /api/users/:username
 * Get user profile by username
 */
router.get('/:username', async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const user = await User.findOne({ username }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('GET /api/users/:username error:', err);
    res.status(500).json({ error: 'Server error fetching user' });
  }
});

/**
 * PUT /api/users/
 * Protected - update current user's profile
 * multipart/form-data with optional `avatar` file and JSON fields in text fields
 */
router.put('/', requireAuth(), upload.single('avatar'), async (req, res) => {
  try {
    const user = req.user; // from requireAuth()
    // Accept simple fields: name, bio, location{city,country,latitude,longitude}
    const { name, bio } = req.body;

    if (name !== undefined) user.name = String(name).trim().slice(0, 80);
    if (bio !== undefined) user.bio = String(bio).slice(0, 320);

    // If location provided as JSON string (client may send JSON)
    if (req.body.location) {
      try {
        const loc = typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location;
        user.location = {
          city: loc.city || user.location?.city || '',
          country: loc.country || user.location?.country || '',
          latitude: loc.latitude ? Number(loc.latitude) : user.location?.latitude,
          longitude: loc.longitude ? Number(loc.longitude) : user.location?.longitude,
        };
      } catch (e) {
        // ignore location parse errors
      }
    }

    // Avatar handling: Cloudinary preferred if configured, else use local file path
    if (req.file) {
      if (cloudinary.config().cloud_name) {
        // Upload local file buffer to Cloudinary (stream) then delete local file
        const buffer = fs.readFileSync(req.file.path);
        try {
          const secureUrl = await uploadBufferToCloudinary(buffer, 'madeinindia/avatars');
          user.avatar = secureUrl;
        } catch (err) {
          console.error('Cloudinary upload failed:', err);
          // fallback: use local path
          user.avatar = `/uploads/${req.file.filename}`;
        } finally {
          // remove local file
          try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
      } else {
        // No cloudinary -> use local upload URL
        user.avatar = `/uploads/${req.file.filename}`;
      }
    }

    await user.save();
    const safeUser = user.toJSON();
    res.json({ user: safeUser });
  } catch (err) {
    console.error('PUT /api/users error:', err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

/**
 * POST /api/users/:username/follow
 * Protected - follow target user
 */
router.post('/:username/follow', requireAuth(), async (req, res) => {
  try {
    const targetUsername = req.params.username.toLowerCase();
    const target = await User.findOne({ username: targetUsername });
    if (!target) return res.status(404).json({ error: 'Target user not found' });

    const me = await User.findById(req.user._id);

    // Prevent self-follow
    if (me._id.equals(target._id)) return res.status(400).json({ error: 'Cannot follow yourself' });

    // Add if not already following
    if (!me.following.some((id) => id.equals(target._id))) {
      me.following.push(target._id);
      target.followers.push(me._id);
      await me.save();
      await target.save();
    }

    return res.json({ success: true, following: true });
  } catch (err) {
    console.error('POST follow error:', err);
    res.status(500).json({ error: 'Server error following user' });
  }
});

/**
 * POST /api/users/:username/unfollow
 * Protected - unfollow target user
 */
router.post('/:username/unfollow', requireAuth(), async (req, res) => {
  try {
    const targetUsername = req.params.username.toLowerCase();
    const target = await User.findOne({ username: targetUsername });
    if (!target) return res.status(404).json({ error: 'Target user not found' });

    const me = await User.findById(req.user._id);

    me.following = me.following.filter((id) => !id.equals(target._id));
    target.followers = target.followers.filter((id) => !id.equals(me._id));

    await me.save();
    await target.save();

    return res.json({ success: true, following: false });
  } catch (err) {
    console.error('POST unfollow error:', err);
    res.status(500).json({ error: 'Server error unfollowing user' });
  }
});

module.exports = router;
