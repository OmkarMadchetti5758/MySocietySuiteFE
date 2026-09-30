import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiArrowRight,
  FiHeadphones
} from 'react-icons/fi';
import { authApi } from '../services/authApi';
import { usePermissions } from '../context/PermissionsContext';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setPermissionsFromLogin } = usePermissions();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authApi.login(identifier, password);

      if (data.status === 'success') {
        toast.success('Login Successful!');

        const {
          user,
          accessToken,
          refreshToken,
          permissions,
          permissionsVersion,
          roleKeys,
        } = data.data;

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('societyDatabase', user.societyId);
        localStorage.setItem('societyName', user.societyName || '');

        setPermissionsFromLogin({
          permissions,
          permissionsVersion,
          roleKeys: roleKeys || user.roleKeys,
          accessToken,
          refreshToken,
        });

        setTimeout(() => {
          if (user.role === 'vendor' || (user.roleKeys && user.roleKeys.includes('vendor'))) {
            navigate(`/${user.societyId}/dashboard/vendors`);
          } else {
            navigate(`/${user.societyId}/dashboard`);
          }
        }, 1000);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
        toast.error(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.response?.data?.message || 'An error occurred during login. Please try again.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F7] font-sans py-12 px-4 sm:px-6 relative">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 relative z-10">

        {/* Form Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
            <div className="w-[50px] h-[50px] rounded-full border-2 border-[#EA580C] flex items-center justify-center bg-white">
              <FiUser className="text-2xl text-[#EA580C]" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1.5">
            Welcome Back, <span className="text-[#EA580C]">User!</span>
          </h2>
          <p className="text-gray-500 text-sm font-medium">Login to access your society dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5 ml-1">Email / Mobile Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <FiMail className="text-lg" />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-colors"
                placeholder="Enter email or mobile number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <FiLock className="text-lg" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-12 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-colors"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
              </button>
            </div>
          </div>

          {/* <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#EA580C] focus:ring-[#EA580C] accent-[#EA580C] cursor-pointer"
                />
                <span className="text-sm font-bold text-gray-800 group-hover:text-gray-900 transition-colors">Remember Me</span>
              </label>
              <a href="#" className="text-sm font-bold text-[#EA580C] hover:text-[#c24106] transition-colors">Forgot Password?</a>
            </div> */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#EA580C] hover:bg-[#d94f09] text-white font-bold rounded-xl py-3.5 mt-2 transition-all flex items-center justify-center gap-2 shadow-sm shadow-orange-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Login
                <FiArrowRight className="text-lg" />
              </>
            )}
          </button>

          {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-gray-400 font-medium tracking-wide">or login with</span>
              </div>
            </div> */}

          {/* <button
              type="button"
              className="w-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 font-bold rounded-xl py-3.5 transition-all flex items-center justify-center gap-2"
            >
              <div className="w-5 h-5 rounded-full border-[1.5px] border-[#EA580C] flex items-center justify-center">
                <FiShield className="text-[#EA580C] text-[10px]" />
              </div>
              Login with OTP
            </button> */}
        </form>

        {/* Need Help footer inside card */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
            <FiHeadphones className="text-[#EA580C] text-xl" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Need Help?</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Contact Support: <a href="tel:+919226605656" className="text-[#EA580C] font-bold hover:underline">+91 9226605656</a>
            </p>
          </div>
        </div>
      </div>

      {/* Absolute footer */}
      <div className="absolute bottom-6 text-xs text-gray-400 font-medium">
        © 2026 MySocietySuite. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;
