const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @POST /api/payments/create-order
const createPaymentOrder = async (req, res) => {
  const { productIds } = req.body;
  if (!productIds?.length) return res.status(400).json({ success: false, message: 'No products in cart' });

  const products = await Product.find({ _id: { $in: productIds }, isPublished: true }).select('title price coverImage');
  if (products.length !== productIds.length) {
    return res.status(400).json({ success: false, message: 'One or more products not found' });
  }

  // Check for already-purchased items
  for (const p of products) {
    if (await req.user.hasPurchased(p._id)) {
      return res.status(400).json({ success: false, message: `You already own "${p.title}"` });
    }
  }

  const total = products.reduce((sum, p) => sum + p.price, 0);

  // Create Razorpay order (amount in paise)
  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(total * 100),
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
    notes: { userId: req.user._id.toString(), userEmail: req.user.email },
  });

  // Create pending order in MongoDB
  const order = await Order.create({
    user: req.user._id,
    email: req.user.email,
    items: products.map(p => ({ product: p._id, title: p.title, price: p.price, coverImage: p.coverImage?.url })),
    subtotal: total,
    total,
    payment: { razorpayOrderId: rzpOrder.id, status: 'pending' },
  });

  res.json({
    success: true,
    order: { id: order._id, orderNumber: order.orderNumber, total },
    razorpay: {
      key: process.env.RAZORPAY_KEY_ID,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: 'INR',
      name: 'MoneyMakers Hub',
      description: `${products.length} ebook(s)`,
      prefill: { name: req.user.name, email: req.user.email },
      theme: { color: '#10b981' },
    },
  });
};

// @POST /api/payments/verify
const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expected !== razorpaySignature) {
    await Order.findByIdAndUpdate(orderId, { status: 'failed', 'payment.status': 'failed' });
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  const paymentDetails = await razorpay.payments.fetch(razorpayPaymentId);

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      status: 'completed',
      'payment.razorpayPaymentId': razorpayPaymentId,
      'payment.razorpaySignature': razorpaySignature,
      'payment.status': 'paid',
      'payment.method': paymentDetails.method,
      'payment.paidAt': new Date(),
    },
    { new: true }
  );

  // Update product sales stats
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { totalSales: 1, totalRevenue: item.price } });
  }

  res.json({ success: true, message: 'Payment verified!', order: { _id: order._id, orderNumber: order.orderNumber } });
};

// @POST /api/payments/webhook
const handleWebhook = async (req, res) => {
  const sig = req.headers['x-razorpay-signature'];
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(req.body).digest('hex');
  if (sig !== expected) return res.status(400).json({ message: 'Invalid signature' });

  const event = JSON.parse(req.body);
  const payment = event.payload?.payment?.entity;

  if (event.event === 'payment.captured') {
    const order = await Order.findOne({ 'payment.razorpayOrderId': payment.order_id });
    if (order && order.status === 'pending') {
      order.status = 'completed';
      order.payment.status = 'paid';
      order.payment.razorpayPaymentId = payment.id;
      order.payment.paidAt = new Date();
      await order.save();
    }
  } else if (event.event === 'payment.failed') {
    await Order.findOneAndUpdate(
      { 'payment.razorpayOrderId': payment.order_id },
      { status: 'failed', 'payment.status': 'failed' }
    );
  }

  res.json({ received: true });
};

module.exports = { createPaymentOrder, verifyPayment, handleWebhook };
