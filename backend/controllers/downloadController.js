const Order = require('../models/Order');
const Product = require('../models/Product');
const { supabaseAdmin } = require('../config/supabase');

const MAX_DOWNLOADS = Number(process.env.MAX_DOWNLOAD_ATTEMPTS) || 5;
const EBOOKS_BUCKET = process.env.SUPABASE_STORAGE_BUCKET_EBOOKS || 'ebooks';

// @GET /api/downloads/:productId
const downloadEbook = async (req, res) => {
  const { productId } = req.params;

  const order = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    status: 'completed',
  });

  if (!order) return res.status(403).json({ success: false, message: 'You have not purchased this ebook' });

  const dlRecord = order.downloads.find(d => d.product.toString() === productId);
  if (dlRecord && dlRecord.count >= MAX_DOWNLOADS) {
    return res.status(403).json({ success: false, message: `Download limit (${MAX_DOWNLOADS}) reached. Contact support.` });
  }

  const product = await Product.findById(productId).select('file title');
  if (!product?.file?.path) return res.status(404).json({ success: false, message: 'File not found' });

  // Generate a signed URL valid for 60 minutes
  const { data, error } = await supabaseAdmin.storage
    .from(EBOOKS_BUCKET)
    .createSignedUrl(product.file.path, 3600);

  if (error) return res.status(500).json({ success: false, message: 'Could not generate download link' });

  // Update download count
  if (dlRecord) {
    dlRecord.count += 1;
    dlRecord.lastDownloadedAt = new Date();
  } else {
    order.downloads.push({ product: productId, count: 1, lastDownloadedAt: new Date() });
  }
  await order.save();

  res.json({
    success: true,
    downloadUrl: data.signedUrl,
    filename: `${product.title.replace(/[^a-z0-9]/gi, '_')}.${product.file.format}`,
    expiresIn: 3600,
    downloadsRemaining: MAX_DOWNLOADS - (dlRecord ? dlRecord.count : 1),
  });
};

// @GET /api/downloads/library
const getLibrary = async (req, res) => {
  const orders = await Order.find({ user: req.user._id, status: 'completed' })
    .populate('items.product', 'title slug coverImage author category rating');

  const library = [];
  const seen = new Set();

  for (const order of orders) {
    for (const item of order.items) {
      if (!item.product || seen.has(item.product._id.toString())) continue;
      seen.add(item.product._id.toString());
      const dlRecord = order.downloads.find(d => d.product.toString() === item.product._id.toString());
      library.push({
        product: item.product,
        purchasedAt: order.createdAt,
        orderNumber: order.orderNumber,
        pricePaid: item.price,
        downloadsUsed: dlRecord?.count || 0,
        downloadsRemaining: MAX_DOWNLOADS - (dlRecord?.count || 0),
        lastDownloadedAt: dlRecord?.lastDownloadedAt,
      });
    }
  }

  res.json({ success: true, library });
};

module.exports = { downloadEbook, getLibrary };
