const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Called after Supabase login to sync/fetch MongoDB profile
// Frontend sends the Supabase access_token; middleware creates the profile if missing
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'title slug coverImage price');
  res.json({ success: true, user });
});

// Update display name / avatar
router.put('/profile', protect, async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user });
});

module.exports = router;
