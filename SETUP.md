# MoneyMakers Hub v2 — Setup Guide
## Auth: Supabase (free) | Payments: Razorpay | DB: MongoDB | Storage: Supabase

---

## Step 1 — Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## Step 2 — Set up Supabase (FREE, takes 3 minutes)

1. Go to **https://supabase.com** → Sign up → New Project
2. Choose a name (e.g. `moneymakers-hub`) and a strong DB password → Create
3. Wait ~1 minute for it to spin up
4. Go to **Project Settings → API**
5. Copy these 3 values:

| Value | Where to paste |
|-------|---------------|
| Project URL | `SUPABASE_URL` in backend `.env` AND `VITE_SUPABASE_URL` in frontend `.env` |
| `anon` `public` key | `SUPABASE_ANON_KEY` in backend AND `VITE_SUPABASE_ANON_KEY` in frontend |
| `service_role` `secret` key | `SUPABASE_SERVICE_ROLE_KEY` in backend only (never expose this to frontend!) |

6. **Enable Email Auth**: Authentication → Providers → Email → Enable
7. **Enable Google Auth (optional)**: Authentication → Providers → Google → Enable → paste your Google OAuth credentials
8. **Set Site URL**: Authentication → URL Configuration → Site URL = `http://localhost:5173`
9. Add `http://localhost:5173/**` to Redirect URLs

---

## Step 3 — Set up MongoDB (FREE)

### Option A: Local MongoDB (easiest for development)
```bash
# Install MongoDB: https://www.mongodb.com/docs/manual/installation/
# Then just use:
MONGODB_URI=mongodb://localhost:27017/moneymakers-hub
```

### Option B: MongoDB Atlas (free cloud, for production)
1. Go to **https://mongodb.com/atlas** → Sign up → Free cluster
2. Create cluster → Connect → Drivers → copy the connection string
3. Replace `<password>` with your password
4. Use that as `MONGODB_URI`

---

## Step 4 — Set up Razorpay (FREE test mode)

1. Go to **https://dashboard.razorpay.com** → Sign up
2. Settings → API Keys → Generate Test Key
3. Copy `Key ID` and `Key Secret`

---

## Step 5 — Create your .env files

### backend/.env
```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/moneymakers-hub

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx

FRONTEND_URL=http://localhost:5173
MAX_DOWNLOAD_ATTEMPTS=5
```

### frontend/.env
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxx
```

---

## Step 6 — Seed the database

```bash
cd backend
node utils/seed.js
```

This will:
- Create Supabase storage buckets (`ebooks` and `covers`)
- Create admin and test users in Supabase Auth + MongoDB
- Insert 6 sample ebook products

Login credentials after seed:
- **Admin**: admin@moneymakershub.com / Admin@123456
- **User**: user@test.com / Test@123456

---

## Step 7 — Run the app

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → API running on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → App running on http://localhost:5173
```

---

## What Supabase handles automatically (zero code needed)

| Feature | How it works |
|---------|-------------|
| Email/password login | Built-in |
| Email verification | Supabase sends the email automatically |
| Forgot/reset password | Supabase sends the reset email automatically |
| Google OAuth | One toggle in Supabase dashboard |
| JWT token management | Supabase JS SDK handles refresh automatically |
| File storage | Supabase Storage (like S3, free 1GB) |

---

## Project structure

```
moneymakers-hub-v2/
├── backend/
│   ├── config/
│   │   ├── supabase.js        ← Supabase admin + anon clients
│   │   └── database.js        ← MongoDB connection
│   ├── controllers/           ← Business logic
│   ├── middleware/
│   │   └── auth.js            ← Verifies Supabase JWT
│   ├── models/                ← MongoDB schemas (User, Product, Order)
│   ├── routes/                ← Express routes
│   ├── utils/seed.js          ← Database seeder
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── services/
    │   │   ├── supabase.js    ← Supabase client
    │   │   └── api.js         ← Axios + all API calls
    │   ├── context/
    │   │   ├── useAuthStore.js ← Supabase auth state (Zustand)
    │   │   └── useCartStore.js ← Cart state
    │   └── pages/
    │       ├── LoginPage.jsx   ← Email + Google login
    │       ├── RegisterPage.jsx
    │       └── PasswordPages.jsx
    └── index.html
```

---

## Making a user admin

After a user registers, run this in your backend or MongoDB shell:

```js
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "someone@example.com" },
  { $set: { role: "admin" } }
)
```

Or use the admin panel at `/admin/users` (once you're logged in as admin).

---

## Razorpay Webhook (for production)

1. Deploy your backend to Railway/Render
2. Razorpay Dashboard → Settings → Webhooks → Add webhook
3. URL: `https://your-backend.com/api/payments/webhook`
4. Events: `payment.captured`, `payment.failed`
