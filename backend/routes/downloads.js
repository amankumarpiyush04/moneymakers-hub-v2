// routes/downloads.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { downloadEbook, getLibrary } = require('../controllers/downloadController');

router.get('/library',     protect, getLibrary);
router.get('/:productId',  protect, downloadEbook);

module.exports = router;
