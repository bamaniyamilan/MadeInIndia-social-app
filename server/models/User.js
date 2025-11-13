const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 80,
      default: '',
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-z0-9_]+$/, 'Username can contain only lowercase letters, numbers and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
      match: [/\S+@\S+\.\S+/, 'Email is invalid'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    bio: {
      type: String,
      maxlength: 320,
      default: '',
    },
    avatar: {
      // store public URL (Cloudinary or CDN)
      type: String,
      default: '',
    },
    location: {
      // optional: store as simple object for display, we will use OpenStreetMap for coords->place
      type: {
        city: { type: String },
        country: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
      },
      default: null,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

// Ensure indexes for faster lookup and uniqueness
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

// Pre-save: hash password if modified or new
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Instance method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
