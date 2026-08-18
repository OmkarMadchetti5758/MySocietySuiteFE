import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

const OtpVerificationStep = ({
  identifier,
  purpose,
  societyId,
  onVerified,
  onCancel,
  otpApi
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    // Send initial OTP
    handleSendOtp();
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async () => {
    setResending(true);
    setError('');
    try {
      const data = await otpApi.sendOtp({ identifier, purpose, societyId });
      if (data?.data?.devOtpCode) {
        console.log(`%c🔑 DEV OTP: ${data.data.devOtpCode}`, 'color: #10b981; font-weight: bold; font-size: 16px;');
      }
      setTimer(30);
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (otpCode) => {
    setLoading(true);
    setError('');
    try {
      const res = await otpApi.verifyOtp({ identifier, code: otpCode, purpose, societyId });
      if (res?.data?.verified || res?.verified) {
        onVerified();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
      // clear code on error
      setCode(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    
    if (pasted.length === 6) {
      inputsRef.current[5]?.focus();
      handleVerify(pasted);
    } else {
      inputsRef.current[pasted.length]?.focus();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-bold text-white mb-2">Verify Your Identity</h2>
        <p className="text-white/60 text-sm">
          We've sent a 6-digit code to <br />
          <span className="text-white font-medium">{identifier}</span>
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {code.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputsRef.current[idx] = el)}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onPaste={handlePaste}
            disabled={loading}
            className="w-12 h-14 text-center text-xl font-bold bg-white/8 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 transition-all"
          />
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          disabled={timer > 0 || resending || loading}
          onClick={handleSendOtp}
          className="text-sm text-orange-400 hover:text-orange-300 disabled:text-white/30 transition-colors font-medium"
        >
          {resending ? 'Sending...' : timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
        </button>
        
        {loading && (
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
          </div>
        )}
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="text-white/50 hover:text-white text-xs mt-4 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default OtpVerificationStep;
