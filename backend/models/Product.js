const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000 },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true, maxlength: 5000 },
  shortDescription: { type: String, maxlength: 300 },
  price: { type: Number, required: true, min: 0 },
  originalPrice: Number,
  category: {
    type: String,
    required: true,
    enum: ['finance', 'business', 'investing', 'crypto', 'real-estate', 'mindset', 'marketing', 'other'],
  },
  tags: [String],
  coverImage: { url: String, path: String },  // Supabase storage path
  file: {
    path: String,      // Supabase storage path
    format: { type: String, enum: ['pdf', 'epub'] },
    size: Number,
  },
  author: { type: String, required: true },
  pages: Number,
  language: { type: String, default: 'English' },
  isFeatured: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  reviews: [reviewSchema],
  numReviews: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  learningPoints: [String],
}, { timestamps: true });

productSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

productSchema.methods.calcAverageRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0; this.numReviews = 0;
  } else {
    this.rating = this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isPublished: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
