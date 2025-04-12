const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const creatorSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  followers: { type: [String], default: [] },
  likes: { type: [String], default: [] },
  comments: { 
    type: [{
      wallet_address: String,
      comment_text: String
    }], 
    default: [] 
  },
  following: { type: [String], default: [] }
});

const contentSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  creator_id: { type: String, required: true },
  likes: { type: [String], default: [] },
  comments: { 
    type: [{
      wallet_address: String,
      comment_text: String
    }], 
    default: [] 
  }
});

// Models
const Creator = mongoose.model('Creator', creatorSchema);
const Content = mongoose.model('Content', contentSchema);

// Routes
app.post('/api/users', async (req, res) => {
  try {
    const { wallet_address, name } = req.body;
    if (!wallet_address || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await Creator.findById(wallet_address);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new Creator({
      _id: wallet_address,
      name,
      ...req.body
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/like', async (req, res) => {
  try {
    const { wallet_address, warlus_blob_id } = req.body;
    
    const [user, content] = await Promise.all([
      Creator.findById(wallet_address),
      Content.findById(warlus_blob_id)
    ]);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!content) return res.status(404).json({ message: 'Content not found' });

    const [updatedContent, updatedUser] = await Promise.all([
      Content.findByIdAndUpdate(
        warlus_blob_id,
        { $addToSet: { likes: wallet_address } },
        { new: true }
      ),
      Creator.findByIdAndUpdate(
        wallet_address,
        { $addToSet: { likes: warlus_blob_id } },
        { new: true }
      )
    ]);

    res.json({ content: updatedContent, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/comment', async (req, res) => {
  try {
    const { wallet_address, warlus_blob_id, comment_text } = req.body;
    if (!wallet_address || !warlus_blob_id || !comment_text) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const content = await Content.findById(warlus_blob_id);
    if (!content) return res.status(404).json({ message: 'Content not found' });

    const comment = { wallet_address, comment_text };
    
    const [updatedContent, updatedCreator] = await Promise.all([
      Content.findByIdAndUpdate(
        warlus_blob_id,
        { $push: { comments: comment } },
        { new: true }
      ),
      Creator.findByIdAndUpdate(
        content.creator_id,
        { $push: { comments: comment } },
        { new: true }
      )
    ]);

    res.json({ content: updatedContent, creator: updatedCreator });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/follow', async (req, res) => {
  try {
    const { wallet_address, target_wallet_address } = req.body;
    
    const [user, target] = await Promise.all([
      Creator.findById(wallet_address),
      Creator.findById(target_wallet_address)
    ]);

    if (!user || !target) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [updatedUser, updatedTarget] = await Promise.all([
      Creator.findByIdAndUpdate(
        wallet_address,
        { $addToSet: { following: target_wallet_address } },
        { new: true }
      ),
      Creator.findByIdAndUpdate(
        target_wallet_address,
        { $addToSet: { followers: wallet_address } },
        { new: true }
      )
    ]);

    res.json({ user: updatedUser, target: updatedTarget });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/total_user_engagement/:wallet_address', async (req, res) => {
  try {
    const user = await Creator.findById(req.params.wallet_address);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const engagement = user.likes.length + user.comments.length + user.following.length;
    res.json({ total_engagement: engagement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/total_post_engagement/:warlus_blob_id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.warlus_blob_id);
    if (!content) return res.status(404).json({ message: 'Content not found' });
    
    const engagement = content.likes.length + content.comments.length;
    res.json({ total_engagement: engagement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Add to index.js after existing routes
app.post('/api/posts', async (req, res) => {
    try {
      const { warlus_blob_id, creator_id } = req.body;
      
      if (!warlus_blob_id || !creator_id) {
        return res.status(400).json({ message: 'Missing required fields: warlus_blob_id and creator_id' });
      }
  
      // Check if creator exists
      const creator = await Creator.findById(creator_id);
      if (!creator) {
        return res.status(404).json({ message: 'Creator not found' });
      }
  
      // Check if post ID already exists
      const existingPost = await Content.findById(warlus_blob_id);
      if (existingPost) {
        return res.status(400).json({ message: 'Post ID already exists' });
      }
  
      const newPost = new Content({
        _id: warlus_blob_id,
        creator_id,
        likes: [],
        comments: []
      });
  
      await newPost.save();
      res.status(201).json(newPost);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});