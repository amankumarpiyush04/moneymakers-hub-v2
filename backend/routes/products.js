const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, uploadCover, uploadFile, addReview
} = require('../controllers/productController');

// Use memory storage — we pipe the buffer to Supabase Storage
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.get('/',    getProducts);
router.get('/:slug', optionalAuth, getProduct);
router.post('/',   protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/:id/cover', protect, authorize('admin'), upload.single('cover'), uploadCover);
router.post('/:id/file',  protect, authorize('admin'), upload.single('ebook'), uploadFile);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
