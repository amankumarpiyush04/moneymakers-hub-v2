require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);
connectDB();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));

// Raw body for Razorpay webhooks — must be before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/downloads',require('./routes/downloads'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/orders',   require('./routes/orders'));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MoneyMakers Hub API running on http://localhost:${PORT}`);
});

module.exports = app;
