// models/Content.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user_address: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const contentSchema = new mongoose.Schema(
  {
    content_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    comments: [commentSchema],
    total_likes: {
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

module.exports = mongoose.model('Content', contentSchema);
