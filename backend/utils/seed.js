require('dotenv').config();
const connectDB = require('../config/database');
const { supabaseAdmin } = require('../config/supabase');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding...');

  // Clear collections
  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});

  // ── Create Supabase storage buckets ───────────────────────
  for (const bucket of ['ebooks', 'covers']) {
    const { error } = await supabaseAdmin.storage.createBucket(bucket, { public: true });
    if (error && !error.message.includes('already exists')) {
      console.warn(`Bucket "${bucket}" warning:`, error.message);
    } else {
      console.log(`✅ Bucket "${bucket}" ready`);
    }
  }

  // Helper function to create or fetch a user if they already exist
  const getOrCreateUser = async (email, password, name) => {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (!error && data && data.user) {
      return data.user;
    }

    if (error && (error.message.includes('already exists') || error.message.includes('registered') || error.message.includes('email_exists'))) {
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 1000
      });
      if (listError) throw listError;
      const existing = listData.users.find(u => u.email === email);
      if (existing) return existing;
    }
    throw error || new Error(`Failed to create or retrieve user ${email}`);
  };

  // ── Create Supabase auth users ─────────────────────────────
  console.log('Creating auth users...');
  const adminUser = await getOrCreateUser('admin@moneymakershub.com', 'Admin@123456', 'Admin User');
  const testUser = await getOrCreateUser('user@test.com', 'Test@123456', 'Test User');

  // ── Create MongoDB profiles ────────────────────────────────
  await User.create({
    supabaseId: adminUser.id,
    email: 'admin@moneymakershub.com',
    name: 'Admin User',
    role: 'admin',
  });
  console.log('✅ Admin: admin@moneymakershub.com / Admin@123456');

  await User.create({
    supabaseId: testUser.id,
    email: 'user@test.com',
    name: 'Test User',
    role: 'user',
  });
  console.log('✅ User:  user@test.com / Test@123456');

  // ── Sample products ────────────────────────────────────────
  const products = [
    {
      title: 'The Wealth Blueprint: Building Passive Income from Zero',
      slug: 'wealth-blueprint-passive-income',
      description: 'A comprehensive 300-page guide to building multiple income streams from scratch. Covers dividend investing, real estate, digital products, and affiliate marketing with real Indian examples.',
      shortDescription: 'Build passive income streams with proven frameworks used by millionaires.',
      price: 499, originalPrice: 999,
      category: 'finance', author: 'Rajesh Sharma', pages: 312,
      isFeatured: true, isPublished: true,
      learningPoints: ['Set up your first dividend portfolio', 'Create digital products that sell', 'Real estate investing with ₹5 lakh', 'Affiliate marketing step by step'],
      tags: ['passive income', 'investing', 'wealth'],
    },
    {
      title: 'Crypto Mastery: From Beginner to Pro Trader',
      slug: 'crypto-mastery-beginner-to-pro',
      description: 'Master cryptocurrency trading with technical analysis, DeFi strategies, and risk management. Includes step-by-step guides for Indian exchanges like WazirX and CoinDCX.',
      shortDescription: 'Learn crypto trading on Indian exchanges with real strategies.',
      price: 799, originalPrice: 1499,
      category: 'crypto', author: 'Priya Nair', pages: 256,
      isFeatured: true, isPublished: true,
      tags: ['crypto', 'bitcoin', 'trading'],
    },
    {
      title: "Stock Market Secrets: The Indian Investor's Edge",
      slug: 'stock-market-secrets-india',
      description: 'Deep dive into NSE/BSE investing, fundamental analysis of Indian companies, sector rotation, and how to identify multibagger stocks before the crowd.',
      shortDescription: 'Indian stock market investing — fundamental and technical analysis.',
      price: 649,
      category: 'investing', author: 'Vikram Mehta', pages: 288,
      isPublished: true,
      tags: ['stocks', 'NSE', 'BSE', 'investing'],
    },
    {
      title: 'Freelancer to ₹1 Lakh/Month: The Complete Roadmap',
      slug: 'freelancer-to-1-lakh-month',
      description: 'Actionable guide to building a high-income freelance career in India. Covers finding clients on Upwork and LinkedIn, pricing, contracts, and scaling to an agency.',
      shortDescription: 'Scale your freelance income to ₹1 lakh/month in 6 months.',
      price: 399,
      category: 'business', author: 'Ananya Singh', pages: 198,
      isPublished: true, isFeatured: true,
      tags: ['freelancing', 'income', 'business'],
    },
    {
      title: 'Digital Marketing Playbook 2024',
      slug: 'digital-marketing-playbook-2024',
      description: 'Complete guide to SEO, Meta Ads, Google Ads, content marketing, and email marketing for Indian businesses. Includes templates and campaign blueprints.',
      shortDescription: 'Master digital marketing with proven strategies for 2024.',
      price: 549,
      category: 'marketing', author: 'Rohan Kapoor', pages: 334,
      isPublished: true,
      tags: ['marketing', 'SEO', 'ads'],
    },
    {
      title: 'The Millionaire Mindset: Psychology of Wealth',
      slug: 'millionaire-mindset-psychology-wealth',
      description: 'Understand the mental frameworks, habits, and daily rituals that separate the wealthy from everyone else. Science-backed strategies for financial transformation.',
      shortDescription: 'Rewire your mind for abundance and financial success.',
      price: 299,
      category: 'mindset', author: 'Deepika Rao', pages: 176,
      isPublished: true,
      tags: ['mindset', 'wealth', 'psychology'],
    },
  ];

  await Product.insertMany(products);
  console.log(`✅ ${products.length} sample products created`);
  console.log('\n🎉 Seed complete!');
  process.exit(0);
};

seed().catch(err => { console.error('❌ Seed error:', err.message); process.exit(1); });
