const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');

router.get('/orders', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product', 'title slug coverImage')
    .sort('-createdAt');
  res.json({ success: true, orders });
});

router.put('/wishlist/:productId', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.indexOf(req.params.productId);
  if (idx > -1) user.wishlist.splice(idx, 1);
  else user.wishlist.push(req.params.productId);
  await user.save();
  res.json({ success: true, wishlist: user.wishlist, added: idx === -1 });
});

module.exports = router;
