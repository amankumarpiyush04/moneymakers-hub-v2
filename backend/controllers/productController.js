const Product = require('../models/Product');
const { supabaseAdmin } = require('../config/supabase');

const COVERS_BUCKET = process.env.SUPABASE_STORAGE_BUCKET_COVERS || 'covers';
const EBOOKS_BUCKET = process.env.SUPABASE_STORAGE_BUCKET_EBOOKS || 'ebooks';

// Upload buffer to Supabase Storage, return public URL
const uploadToSupabase = async (bucket, path, buffer, mimetype) => {
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
    contentType: mimetype,
    upsert: true,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
};

// @GET /api/products
const getProducts = async (req, res) => {
  const { page = 1, limit = 12, category, search, sort = '-createdAt', minPrice, maxPrice, featured } = req.query;
  const query = { isPublished: true };
  if (category) query.category = category;
  if (featured === 'true') query.isFeatured = true;
  if (search) query.$text = { $search: search };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = +minPrice;
    if (maxPrice) query.price.$lte = +maxPrice;
  }

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(query).select('-file -reviews').sort(sort).skip(skip).limit(+limit),
    Product.countDocuments(query),
  ]);

  res.json({ success: true, products, pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / limit) } });
};

// @GET /api/products/:slug
const getProduct = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isPublished: true })
    .select('-file')
    .populate('reviews.user', 'name avatar');

  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

  let userHasPurchased = false;
  if (req.user) userHasPurchased = await req.user.hasPurchased(product._id);

  res.json({ success: true, product, userHasPurchased });
};

// @POST /api/products (admin)
const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
};

// @PUT /api/products/:id (admin)
const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
};

// @DELETE /api/products/:id (admin)
const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, message: 'Product deleted' });
};

// @POST /api/products/:id/cover (admin)
const uploadCover = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const path = `${req.params.id}/cover-${Date.now()}.jpg`;
  const { url } = await uploadToSupabase(COVERS_BUCKET, path, req.file.buffer, req.file.mimetype);
  const product = await Product.findByIdAndUpdate(req.params.id, { coverImage: { url, path } }, { new: true });
  res.json({ success: true, coverImage: product.coverImage });
};

// @POST /api/products/:id/file (admin)
const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const ext = req.file.originalname.split('.').pop().toLowerCase();
  if (!['pdf', 'epub'].includes(ext)) {
    return res.status(400).json({ success: false, message: 'Only PDF and EPUB files allowed' });
  }
  const path = `${req.params.id}/ebook-${Date.now()}.${ext}`;
  await uploadToSupabase(EBOOKS_BUCKET, path, req.file.buffer, req.file.mimetype);
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { file: { path, format: ext, size: req.file.size } },
    { new: true }
  );
  res.json({ success: true, file: { format: product.file.format, size: product.file.size } });
};

// @POST /api/products/:id/reviews
const addReview = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const purchased = await req.user.hasPurchased(product._id);
  if (!purchased) return res.status(403).json({ success: false, message: 'Purchase required to review' });

  const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) return res.status(400).json({ success: false, message: 'Already reviewed' });

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: req.body.rating, comment: req.body.comment });
  product.calcAverageRating();
  await product.save();

  res.status(201).json({ success: true, rating: product.rating, numReviews: product.numReviews });
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, uploadCover, uploadFile, addReview };
