const { supabase } = require('../config/supabase');
const User = require('../models/User');

// Verify Supabase token and attach user profile from MongoDB
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  // Verify token with Supabase
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

  if (error || !supabaseUser) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }

  // Get or create MongoDB user profile (synced by email)
  let user = await User.findOne({ supabaseId: supabaseUser.id });

  if (!user) {
    // First time — auto-create profile in MongoDB
    user = await User.create({
      supabaseId: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
      role: 'user',
    });
  }

  req.user = user;
  req.supabaseUser = supabaseUser;
  next();
};

// Optional auth — attach user if token present, don't block
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const { data: { user: sbUser } } = await supabase.auth.getUser(token);
      if (sbUser) {
        req.user = await User.findOne({ supabaseId: sbUser.id });
      }
    } catch (_) {}
  }
  next();
};

// Restrict to roles
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  next();
};

module.exports = { protect, optionalAuth, authorize };
