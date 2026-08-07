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
  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regSocietyName, setRegSocietyName] = useState('');
  const [regAdminName, setRegAdminName] = useState('');
  const [regAdminEmail, setRegAdminEmail] = useState('');
  const [regAdminMobile, setRegAdminMobile] = useState('');
  const [regAdminPassword, setRegAdminPassword] = useState('');

  const fetchSocieties = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/societies/active');
      const data = await response.json();
      if (data.status === 'success') {
        setSocieties(data.data.societies);
        if (data.data.societies.length > 0 && !selectedSociety) {
          setSelectedSociety(data.data.societies[0].databaseName);
        }
      }
    } catch (err) {
      console.error("Failed to fetch societies:", err);
      // Don't show error here to avoid blocking UI if it's just a network hiccup
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      setIsLoginMode(true);
      fetchSocieties();
    }
  }, [isOpen]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!selectedSociety) {
      setError("Please select a society.");
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-database-name': selectedSociety
        },
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSuccessMsg("Login Successful!");
        
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('permissions', JSON.stringify(data.data.permissions));
        localStorage.setItem('societyDatabase', selectedSociety);
        
        const societyObj = societies.find(s => s.databaseName === selectedSociety);
        if (societyObj) {
          localStorage.setItem('societyName', societyObj.name);
        }
        
        setTimeout(() => {
          onClose();
          navigate(`/${selectedSociety}/dashboard`);
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/v1/societies/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          societyName: regSocietyName,
          adminName: regAdminName,
          adminEmail: regAdminEmail,
          adminMobile: regAdminMobile,
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
      setError('An error occurred during registration. Please try again.');
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
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              isLoginMode ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLoginMode(false); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              !isLoginMode ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'
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
                <label className="text-sm font-medium text-gray-300 pl-1">Select Society</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <FaBuilding />
                  </div>
                  <select
                    value={selectedSociety}
                    onChange={(e) => setSelectedSociety(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white appearance-none focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                    required
                  >
                    <option value="" disabled>Select your society...</option>
                    {societies.map((soc) => (
                      <option key={soc._id} value={soc.databaseName}>
                        {soc.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

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

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 pl-1">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    value={regAdminEmail}
                    onChange={(e) => setRegAdminEmail(e.target.value)}
                    placeholder="admin@sunrisetowers.com"
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 pl-1">Admin Mobile</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <FaPhone />
                  </div>
                  <input
                    type="tel"
                    value={regAdminMobile}
                    onChange={(e) => setRegAdminMobile(e.target.value)}
                    placeholder="9876543210"
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit mobile number"
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
