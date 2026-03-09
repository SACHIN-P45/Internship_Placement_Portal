// Passport.js OAuth strategies configuration
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production'
        ? 'https://internship-placement-portal-kappa.vercel.app/api/auth/google/callback'
        : (process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'),
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Block company accounts from using OAuth
          if (user.role === 'company') {
            return done(new Error('company_oauth_not_allowed'), null);
          }
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Block company accounts from using OAuth
          if (user.role === 'company') {
            return done(new Error('company_oauth_not_allowed'), null);
          }
          // Link Google account to existing user
          user.googleId = profile.id;
          if (!user.avatar && profile.photos?.[0]?.value) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos?.[0]?.value || '',
          role: 'student', // Default role for OAuth users
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production'
        ? 'https://internship-placement-portal-kappa.vercel.app/api/auth/github/callback'
        : (process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback'),
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('[GitHub OAuth] Profile received:', {
          id: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          emails: profile.emails,
          photos: profile.photos?.map((p) => p.value),
        });

        // Check if user exists with this GitHub ID
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          console.log('[GitHub OAuth] Existing user found by githubId:', user.email);
          // Block company accounts from using OAuth
          if (user.role === 'company') {
            return done(new Error('company_oauth_not_allowed'), null);
          }
          return done(null, user);
        }

        // Get primary email from GitHub
        const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
        console.log('[GitHub OAuth] Resolved email:', email);

        // Check if user exists with same email
        user = await User.findOne({ email });

        if (user) {
          // Block company accounts from using OAuth
          if (user.role === 'company') {
            return done(new Error('company_oauth_not_allowed'), null);
          }
          // Link GitHub account to existing user
          console.log('[GitHub OAuth] Linking GitHub to existing user:', user.email);
          user.githubId = profile.id;
          if (!user.avatar && profile.photos?.[0]?.value) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        // Create new user
        console.log('[GitHub OAuth] Creating new user with email:', email);
        user = await User.create({
          githubId: profile.id,
          name: profile.displayName || profile.username,
          email,
          avatar: profile.photos?.[0]?.value || '',
          role: 'student', // Default role for OAuth users
        });

        console.log('[GitHub OAuth] New user created:', user._id);
        done(null, user);
      } catch (error) {
        console.error('[GitHub OAuth] Strategy error:', error.message, error.stack);
        done(error, null);
      }
    }
  )
);

module.exports = passport;
