// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/user/:user_address
router.get('/:user_address', async (req, res) => {
  try {
    const user = await User.findOne({ address: req.params.user_address });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/user/update
router.post('/update', async (req, res) => {
  try {
    const { user_address, field, value } = req.body;
    
    if (!user_address || !field || value === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate field to update
    const validFields = ['no_of_likes', 'no_of_comments', 'total_followers', 'total_following', 'total_engagement'];
    if (!validFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field to update' });
    }
    
    // Find user or create if not exists
    let user = await User.findOne({ address: user_address });
    
    if (!user) {
      user = new User({ address: user_address });
    }
    
    // Update field
    user[field] = value;
    
    // Recalculate total engagement
    user.total_engagement = user.no_of_likes + user.no_of_comments + user.total_followers;
    
    await user.save();
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
