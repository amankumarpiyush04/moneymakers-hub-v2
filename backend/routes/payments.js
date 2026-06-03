const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createPaymentOrder, verifyPayment, handleWebhook } = require('../controllers/paymentController');

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify',       protect, verifyPayment);
router.post('/webhook',      handleWebhook); // raw body applied in server.js

module.exports = router;
