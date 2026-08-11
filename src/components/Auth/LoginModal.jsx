import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaEnvelope, FaLock, FaBuilding, FaUser, FaPhone } from 'react-icons/fa';

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  // Toggle Mode
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Common State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regSocietyName, setRegSocietyName] = useState('');
  const [regAdminName, setRegAdminName] = useState('');
  const [regContact, setRegContact] = useState(''); // email or phone
  const [regAdminPassword, setRegAdminPassword] = useState('');

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      setIsLoginMode(true);
    }
  }, [isOpen]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSuccessMsg("Login Successful!");

        const { user, accessToken, refreshToken, permissions } = data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('permissions', JSON.stringify(permissions));
        localStorage.setItem('societyDatabase', user.societyId);
        localStorage.setItem('societyName', user.societyName || '');

        setTimeout(() => {
          onClose();
          navigate(`/${user.societyId}/dashboard`);
        }, 1000);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetOtp = async () => {
    if (!regContact.trim()) {
      setError('Please enter your email or phone number first.');
      return;
    }
    setError('');
    setOtpLoading(true);

    // Generate a mock 6-digit OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);

    // Simulate a short network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log(`OTP for ${regContact}:`, mockOtp);
    setOtpSent(true);
    setOtpLoading(false);
    setSuccessMsg(`OTP sent to ${regContact}`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!otpSent) {
      setError('Please verify your email/phone via OTP before registering.');
      return;
    }

    setError('');
    setLoading(true);

    // Detect if contact is email or phone
    const isEmail = regContact.includes('@');

    try {
      const response = await fetch('http://localhost:5000/api/v1/societies/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          societyName: regSocietyName,
          adminName: regAdminName,
          adminEmail: isEmail ? regContact : undefined,
          adminMobile: isEmail ? undefined : regContact,
          adminPassword: regAdminPassword
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSuccessMsg("Society registered! Please log in.");

        // Refresh societies list so the new one appears
        await fetchSocieties();

        // Auto select the new society (generate rough db name based on logic)
        const cleanName = regSocietyName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        setSelectedSociety(`society_${cleanName}`);

        // Switch to login tab after brief delay
        setTimeout(() => {
          setSuccessMsg('');
          setIsLoginMode(true);
        }, 2000);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error("Register error:", err);
      // Try to surface the server's error message if available
      const serverMsg = err?.response?.data?.message || err?.message;
      setError(
        serverMsg && !serverMsg.includes('fetch')
          ? serverMsg
          : 'Registration failed. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#161616] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
        >
          <FaTimes />
        </button>

        {/* Header Tabs */}
        <div className="flex border-b border-white/10 shrink-0 pt-2">
          <button
            onClick={() => { setIsLoginMode(true); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-4 text-center font-medium transition-colors ${isLoginMode ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLoginMode(false); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-4 text-center font-medium transition-colors ${!isLoginMode ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            Register Society
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="p-8 overflow-y-auto custom-scrollbar">

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLoginMode ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isLoginMode ? 'Sign in to your society portal' : 'Onboard your society to MySocietySuite'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMsg}
            </div>
          )}

          {/* Login Form */}
          {isLoginMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 pl-1">Email or Mobile</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <FaEnvelope />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin@greenvalley.com"
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 pl-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <FaLock />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-semibold rounded-xl py-3.5 hover:bg-gray-200 active:bg-gray-300 transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 pl-1">Society Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <FaBuilding />
                  </div>
                  <input
                    type="text"
                    value={regSocietyName}
                    onChange={(e) => setRegSocietyName(e.target.value)}
                    placeholder="Sunrise Towers"
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 pl-1">Admin Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <FaUser />
                  </div>
                  <input
                    type="text"
                    value={regAdminName}
                    onChange={(e) => setRegAdminName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email / Phone + Get OTP */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 pl-1">Email / Phone Number</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                      <FaEnvelope />
                    </div>
                    <input
                      type="text"
                      value={regContact}
                      onChange={(e) => { setRegContact(e.target.value); setOtpSent(false); setOtp(''); setGeneratedOtp(null); }}
                      placeholder="xyz@gmail.com or 9876543210"
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGetOtp}
                    disabled={otpLoading || otpSent}
                    className="shrink-0 px-4 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: otpSent ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', color: otpSent ? '#4ade80' : '#fff', border: otpSent ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.15)' }}
                  >
                    {otpLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : otpSent ? (
                      '✓ Sent'
                    ) : (
                      'Get OTP'
                    )}
                  </button>
                </div>
              </div>

              {/* Enter OTP — shown only after OTP is sent */}
              {otpSent && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-sm font-medium text-gray-300">Enter OTP</label>
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtp(''); setGeneratedOtp(null); }}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Resend
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit OTP"
                      maxLength={6}
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all tracking-[0.4em] text-center text-lg font-semibold"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Check your browser console for the OTP (demo mode)
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 pl-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <FaLock />
                  </div>
                  <input
                    type="password"
                    value={regAdminPassword}
                    onChange={(e) => setRegAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-semibold rounded-xl py-3.5 hover:bg-gray-200 active:bg-gray-300 transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Register Society"
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginModal;
