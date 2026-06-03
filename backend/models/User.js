const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  supabaseId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  avatar: String,
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  lastLogin: Date,
}, { timestamps: true });

// Check if user has a completed order containing a product
userSchema.methods.hasPurchased = async function (productId) {
  const Order = mongoose.model('Order');
  const order = await Order.findOne({
    user: this._id,
    'items.product': productId,
    status: 'completed',
  });
  return !!order;
};

module.exports = mongoose.model('User', userSchema);
