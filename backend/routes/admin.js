const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

router.use(protect, authorize('admin'));

router.get('/stats', async (req, res) => {
  const [totalUsers, totalProducts, orders] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isPublished: true }),
    Order.find({ status: 'completed' }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalSales   = orders.reduce((sum, o) => sum + o.items.length, 0);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Order.aggregate([
    { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const topProducts = await Product.find().select('title totalSales totalRevenue coverImage').sort('-totalSales').limit(5);

  res.json({ success: true, stats: { totalUsers, totalProducts, totalRevenue, totalSales, totalOrders: orders.length }, monthlyRevenue, topProducts });
});

router.get('/users', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const users = await User.find().sort('-createdAt').skip((page-1)*limit).limit(+limit);
  const total = await User.countDocuments();
  res.json({ success: true, users, total });
});

router.put('/users/:id/role', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  res.json({ success: true, user });
});

router.get('/orders', async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { status } : {};
  const orders = await Order.find(query).populate('user', 'name email').sort('-createdAt').skip((page-1)*limit).limit(+limit);
  const total = await Order.countDocuments(query);
  res.json({ success: true, orders, total });
});

module.exports = router;
