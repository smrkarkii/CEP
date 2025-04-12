// routes/contentRoutes.js
const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const User = require('../models/User');

// GET /api/content/:content_id
router.get('/:content_id', async (req, res) => {
  try {
    const content = await Content.findOne({ content_id: req.params.content_id });
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// POST /api/content/update
router.post('/update', async (req, res) => {
  try {
    const { content_id, action, data } = req.body;
    
    if (!content_id || !action) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Find content or create if not exists
    let content = await Content.findOne({ content_id });
    
    if (!content) {
      content = new Content({ content_id });
    }
    
    // Process different action types
    switch (action) {
      case 'add_like':
        content.total_likes += 1;
        content.total_engagement += 1;
        
        // Update user stats if user_address is provided in data
        if (data && data.user_address) {
          await User.findOneAndUpdate(
            { address: data.user_address },
            { $inc: { no_of_likes: 1, total_engagement: 1 } },
            { upsert: true, new: true }
          );
        }
        break;
        
      case 'add_comment':
        if (!data || !data.user_address || !data.text) {
          return res.status(400).json({ message: 'Missing comment data' });
        }
        
        content.comments.push({
          user_address: data.user_address,
          text: data.text
        });
        
        content.total_engagement += 1;
        
        // Update user stats
        await User.findOneAndUpdate(
          { address: data.user_address },
          { $inc: { no_of_comments: 1, total_engagement: 1 } },
          { upsert: true, new: true }
        );
        break;
        
      case 'remove_like':
        if (content.total_likes > 0) {
          content.total_likes -= 1;
          content.total_engagement = Math.max(0, content.total_engagement - 1);
          
          // Update user stats if user_address is provided
          if (data && data.user_address) {
            await User.findOneAndUpdate(
              { address: data.user_address },
              { 
                $inc: { no_of_likes: -1 },
                $set: { 
                  no_of_likes: { $max: [0, "$no_of_likes"] },
                  total_engagement: { $max: [0, "$total_engagement"] }
                }
              },
              { new: true }
            );
          }
        }
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid action type' });
    }
    
    await content.save();
    
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;