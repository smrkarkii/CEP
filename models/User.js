// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    no_of_likes: {
      type: Number,
      default: 0,
    },
    no_of_comments: {
      type: Number,
      default: 0,
    },
    total_followers: {
      type: Number,
      default: 0,
    },
    total_following: {
      type: Number,
      default: 0,
    },
    total_engagement: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);