const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');

router.get('/:id', protect, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    .populate('items.product', 'title slug coverImage');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
});

module.exports = router;
