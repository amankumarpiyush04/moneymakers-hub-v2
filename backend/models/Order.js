const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    default: () => `MMH-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: String,
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    price: Number,
    coverImage: String,
  }],
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  payment: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    method: String,
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paidAt: Date,
  },
  downloads: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    count: { type: Number, default: 0 },
    lastDownloadedAt: Date,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
