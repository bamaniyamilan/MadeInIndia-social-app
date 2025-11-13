const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true }, // public URL (Cloudinary / CDN / uploads)
  type: { type: String, enum: ['image', 'video', 'other'], default: 'image' },
  meta: { type: Object, default: {} }, // width/height/duration etc.
});

const locationSchema = new mongoose.Schema({
  placeName: { type: String }, // e.g., "Ahmedabad, India"
  latitude: { type: Number },
  longitude: { type: Number },
});

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, maxlength: 5000, default: '' },
    media: [mediaSchema], // images/videos
    location: { type: locationSchema, default: null },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // list of users who liked
    comments: [commentSchema], // embedded comments for faster reads (denormalized)
    isRepost: { type: Boolean, default: false },
    repostOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    isPrivate: { type: Boolean, default: false }, // future: follower-only posts
    tags: [{ type: String, lowercase: true, trim: true }], // hashtags
    visibility: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
    // aggregate counters (optional but helpful)
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    repostsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for feed & search
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

// Instance method: toggle like by userId
postSchema.methods.toggleLike = async function (userId) {
  const idx = this.likes.findIndex((id) => id.equals(userId));
  if (idx === -1) {
    this.likes.push(userId);
    this.likesCount = this.likes.length;
    await this.save();
    return { liked: true, likesCount: this.likesCount };
  } else {
    this.likes.splice(idx, 1);
    this.likesCount = this.likes.length;
    await this.save();
    return { liked: false, likesCount: this.likesCount };
  }
};

// Instance method: add comment
postSchema.methods.addComment = async function (authorId, text) {
  const comment = { author: authorId, text };
  this.comments.push(comment);
  this.commentsCount = this.comments.length;
  await this.save();
  // return last comment (with _id and createdAt)
  return this.comments[this.comments.length - 1];
};

// Optionally, when adding comment or repost, update counters separately if using atomic ops in controllers.

// Remove __v when toJSON
postSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
