const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const Post = require('../models/Post');
const User = require('../models/User');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// -----------------
// Multer storage (local only)
// -----------------
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

// -----------------
// Helpers
// -----------------
const fileToMediaEntry = (file) => {
  // Determine type by mimetype
  const mime = (file.mimetype || '').toLowerCase();
  let type = 'image';
  if (mime.startsWith('video/')) type = 'video';
  
  // Return local file path
  return { 
    url: `/uploads/${file.filename}`, 
    type, 
    filename: file.filename,
    originalName: file.originalname
  };
};

// -----------------
// Routes
// -----------------

/**
 * POST /api/posts
 * Create a post (protected)
 * multipart/form-data:
 * - text: string
 * - files[]: media files (multiple)
 * - location: JSON string { placeName, latitude, longitude }
 * - tags: comma separated or JSON array
 */
router.post('/', requireAuth(), upload.array('files', 6), async (req, res) => {
  try {
    const authorId = req.user._id;
    const { text = '' } = req.body;

    // Parse tags
    let tags = [];
    if (req.body.tags) {
      try {
        tags = typeof req.body.tags === 'string' && req.body.tags.startsWith('[')
          ? JSON.parse(req.body.tags)
          : String(req.body.tags).split(',').map((t) => t.trim()).filter(Boolean);
      } catch (e) {
        tags = String(req.body.tags).split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    // Parse location
    let location = null;
    if (req.body.location) {
      try {
        const loc = typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location;
        location = {
          placeName: loc.placeName || '',
          latitude: loc.latitude ? Number(loc.latitude) : undefined,
          longitude: loc.longitude ? Number(loc.longitude) : undefined,
        };
      } catch (e) {
        // ignore parse errors
      }
    }

    // Handle media uploads (local only)
    const media = [];
    const files = req.files || [];
    for (const file of files) {
      const mediaEntry = fileToMediaEntry(file);
      media.push(mediaEntry);
    }

    const post = new Post({
      author: authorId,
      text: String(text).slice(0, 5000),
      media,
      location,
      tags: tags.map((t) => t.toLowerCase()),
      visibility: 'public',
    });

    await post.save();

    // Populate author for response
    const populated = await Post.findById(post._id).populate({ 
      path: 'author', 
      select: 'username name avatar' 
    });

    return res.status(201).json({ post: populated });
  } catch (err) {
    console.error('POST /api/posts error:', err);
    
    // Clean up uploaded files if there was an error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkErr) {
          console.error('Error cleaning up file:', unlinkErr);
        }
      });
    }
    
    return res.status(500).json({ error: 'Server error creating post' });
  }
});

/**
 * GET /api/posts/feed
 * Get feed posts for current user (protected).
 * Query: page, limit
 * Feed = posts from people the user follows + user's own posts
 */
router.get('/feed', requireAuth(), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const skip = (page - 1) * limit;

    // Get list of ids to include: following + self
    const me = await User.findById(req.user._id).select('following');
    const includeIds = (me.following || []).map((id) => id.toString());
    includeIds.push(req.user._id.toString());

    const posts = await Post.find({ author: { $in: includeIds }, visibility: 'public' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'author', select: 'username name avatar' })
      .lean();

    const total = await Post.countDocuments({ author: { $in: includeIds }, visibility: 'public' });

    res.json({ posts, meta: { total, page, limit } });
  } catch (err) {
    console.error('GET /api/posts/feed error:', err);
    res.status(500).json({ error: 'Server error fetching feed' });
  }
});

/**
 * GET /api/posts/explore
 * Explore public posts. Optional query q (text or tag), tag filter, page/limit
 */
router.get('/explore', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const tag = (req.query.tag || '').trim().toLowerCase();
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const skip = (page - 1) * limit;

    const filter = { visibility: 'public' };
    if (tag) filter.tags = tag;
    else if (q) {
      filter.$or = [
        { text: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'author', select: 'username name avatar' })
      .lean();

    const total = await Post.countDocuments(filter);
    res.json({ posts, meta: { total, page, limit } });
  } catch (err) {
    console.error('GET /api/posts/explore error:', err);
    res.status(500).json({ error: 'Server error fetching explore posts' });
  }
});

/**
 * GET /api/posts/user/:userId
 * Get posts by specific user
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: userId, visibility: 'public' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'author', select: 'username name avatar' })
      .lean();

    const total = await Post.countDocuments({ author: userId, visibility: 'public' });

    res.json({ 
      posts, 
      meta: { 
        total, 
        page, 
        limit,
        hasMore: total > page * limit
      } 
    });
  } catch (err) {
    console.error('GET /api/posts/user/:userId error:', err);
    res.status(500).json({ error: 'Server error fetching user posts' });
  }
});

/**
 * GET /api/posts/:id
 * Get a single post with populated author and comments authors
 */
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({ path: 'author', select: 'username name avatar' })
      .populate({ path: 'comments.author', select: 'username name avatar' });

    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    console.error('GET /api/posts/:id error:', err);
    res.status(500).json({ error: 'Server error fetching post' });
  }
});

/**
 * POST /api/posts/:id/like
 * Toggle like (protected)
 */
router.post('/:id/like', requireAuth(), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const result = await post.toggleLike(req.user._id);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('POST /api/posts/:id/like error:', err);
    res.status(500).json({ error: 'Server error toggling like' });
  }
});

/**
 * POST /api/posts/:id/comment
 * Add comment (protected)
 * body: { text }
 */
router.post('/:id/comment', requireAuth(), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !String(text).trim()) return res.status(400).json({ error: 'Comment text required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await post.addComment(req.user._id, String(text).slice(0, 1000));
    
    // Populate comment author for response
    const populatedComment = await Post.findOne(
      { 'comments._id': comment._id },
      { 'comments.$': 1 }
    ).populate({ path: 'comments.author', select: 'username name avatar' });

    return res.status(201).json({ comment: populatedComment.comments[0] });
  } catch (err) {
    console.error('POST /api/posts/:id/comment error:', err);
    res.status(500).json({ error: 'Server error adding comment' });
  }
});

/**
 * POST /api/posts/:id/repost
 * Repost (protected)
 */
router.post('/:id/repost', requireAuth(), async (req, res) => {
  try {
    const original = await Post.findById(req.params.id);
    if (!original) return res.status(404).json({ error: 'Original post not found' });

    // Create repost entry that references original
    const repost = new Post({
      author: req.user._id,
      text: req.body.text ? String(req.body.text).slice(0, 5000) : '',
      media: original.media,
      isRepost: true,
      repostOf: original._id,
      visibility: original.visibility,
      tags: original.tags,
    });

    await repost.save();
    
    // increment repostsCount on original
    original.repostsCount = (original.repostsCount || 0) + 1;
    await original.save();

    const populated = await Post.findById(repost._id).populate({ 
      path: 'author', 
      select: 'username name avatar' 
    });
    
    return res.status(201).json({ post: populated });
  } catch (err) {
    console.error('POST /api/posts/:id/repost error:', err);
    res.status(500).json({ error: 'Server error creating repost' });
  }
});

/**
 * DELETE /api/posts/:id
 * Delete post (protected, only author or admin)
 */
router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const isAuthor = post.author.equals(req.user._id);
    if (!isAuthor && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete associated media files
    if (post.media && post.media.length > 0) {
      post.media.forEach(mediaItem => {
        if (mediaItem.filename) {
          const filePath = path.join(uploadsDir, mediaItem.filename);
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (unlinkErr) {
            console.error('Error deleting media file:', unlinkErr);
          }
        }
      });
    }

    await Post.deleteOne({ _id: post._id });

    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/posts/:id error:', err);
    res.status(500).json({ error: 'Server error deleting post' });
  }
});

module.exports = router;