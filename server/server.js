// Express server entry point — security, logging, rate limiting & OAuth
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const cookieParser = require('cookie-parser');

// Dev-only: handle SSL cert chain issues (antivirus/proxy MITM)
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
  console.warn('⚠️  TLS certificate verification disabled (development only)');
}

const passport = require('./config/passport');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { startJobExpirationChecker } = require('./utils/closeExpiredJobs');

// Route imports
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const placementHeadRoutes = require('./routes/placementHeadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Connect to MongoDB
connectDB();

// --- AUTO-SEED ADMIN AND PLACEMENT HEAD TO LIVE ATLAS DB ---
// ✅ FIX: Credentials are now read exclusively from environment variables.
// Hardcoded default passwords (admin123, placement123) have been removed —
// they were a backdoor for anyone who read the source code.
const seedAdmins = async () => {
  const User = require('./models/User');

  const adminEmail    = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const phEmail       = process.env.PH_EMAIL;
  const phPassword    = process.env.PH_PASSWORD;

  if (!adminEmail || !adminPassword || !phEmail || !phPassword) {
    console.warn('⚠️  Seed skipped: ADMIN_EMAIL / ADMIN_PASSWORD / PH_EMAIL / PH_PASSWORD env vars not set.');
    return;
  }

  try {
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log('✅ Live DB Seed: Admin user created!');
    }

    const headExists = await User.findOne({ email: phEmail });
    if (!headExists) {
      await User.create({
        name: 'Dr. Placement Officer',
        email: phEmail,
        password: phPassword,
        role: 'placementHead',
        department: 'Placement Cell',
      });
      console.log('✅ Live DB Seed: Placement Head user created!');
    }
  } catch (error) {
    console.error('Live DB Seed Error:', error.message);
  }
};
seedAdmins();
// -----------------------------------------------------------


// Start automatic job expiration checker
startJobExpirationChecker();

const app = express();

// Trust proxy for Render deployment (required for express-rate-limit)
app.set('trust proxy', 1);

// --------------- Security Middleware ---------------
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));

// Rate limiting — 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter limiter for auth routes (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts, please try again after 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);

// --------------- Body Parsing & CORS ---------------
app.use(cors({
  origin: [
    'https://internship-placement-portal-kappa.vercel.app',
    'http://localhost:3001',
    'http://localhost:3002'
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------- Passport OAuth ---------------
app.use(passport.initialize());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------- API Routes ---------------
app.use('/api/auth', authRoutes);
app.get('/api/settings', require('./controllers/adminController').getSettings);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/placement-head', placementHeadRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// Root route welcome message (fixes "Cannot GET /" in browser)
app.get('/', (req, res) => {
  res.status(200).send(`
    <html>
      <head>
        <title>Internship Placement Portal API</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; }
          .container { text-align: center; background: white; padding: 3rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
          h1 { color: #4f46e5; margin-bottom: 0.5rem; }
          p { color: #64748b; margin-top: 0; }
          .badge { display: inline-block; padding: 0.25rem 0.75rem; background: #dcfce7; color: #166534; border-radius: 9999px; font-weight: 600; font-size: 0.875rem; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Placement Portal API</h1>
          <p>The backend server is running successfully!</p>
          <div class="badge">System Online V1.0.0</div>
          <br/><br/>
          <a href="/api/health" style="color: #6366f1; text-decoration: none; font-size: 0.9rem;">View Health Check &rarr;</a>
        </div>
      </body>
    </html>
  `);
});

// --------------- Error Handler ---------------
app.use(errorHandler);

// --------------- Start Server ---------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
