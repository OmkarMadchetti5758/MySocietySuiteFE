import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiClient from '../services/apiClient';
import { otpApi } from '../services/otpApi';
import { usePermissions } from '../context/PermissionsContext';
import OtpVerificationStep from './OtpVerificationStep';

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_BASE });

/* ── Icon helpers (inline SVGs, no extra deps) ─────────────────────────── */
const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);
const AlertIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);
const SpinnerIcon = () => (
    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

/* ── Password strength helper ─────────────────────────────────────────── */
const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
};
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

/* ═══════════════════════════════════════════════════════════════════════ */
export default function ActivateAccount() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setPermissionsFromLogin } = usePermissions();
    const token = searchParams.get('token');

    // UI state machine: 'loading' | 'valid' | 'invalid' | 'otp_verify' | 'activating' | 'success'
    const [phase, setPhase] = useState('loading');
    const [inviteData, setInviteData] = useState(null); // { adminName, societyName, adminEmail }
    const [errorMsg, setErrorMsg] = useState('');

    // Form
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formError, setFormError] = useState('');

    // Resend
    const [resendEmail, setResendEmail] = useState('');
    const [resending, setResending] = useState(false);
    const [resendMsg, setResendMsg] = useState('');

    /* ── Validate token on mount ──────────────────────────────────────── */
    useEffect(() => {
        if (!token) { setPhase('invalid'); setErrorMsg('No invite token found in the URL.'); return; }

        api.get(`/api/v1/auth/invite/validate?token=${token}`)
            .then(res => { 
                const data = res.data.data;
                setInviteData(data); 
                
                if (data.purpose === 'manager' && !data.otpEmailVerified && !data.otpPhoneVerified) {
                    setPhase('otp_verify');
                } else if (data.purpose === 'resident') {
                    setPhase('otp_verify');
                } else {
                    setPhase('valid'); 
                }
            })
            .catch(err => {
                setErrorMsg(err.response?.data?.message || 'This invite link is invalid or has expired.');
                setPhase('invalid');
            });
    }, [token]);

    /* ── Activate account ─────────────────────────────────────────────── */
    const handleActivate = async (e) => {
        e.preventDefault();
        setFormError('');
        if (password.length < 6) { setFormError('Password must be at least 6 characters.'); return; }
        if (password !== confirm) { setFormError('Passwords do not match.'); return; }

        setPhase('activating');
        try {
            const res = await apiClient.post('/auth/invite/activate', { token, password });
            const {
                user,
                accessToken,
                refreshToken,
                permissions,
                permissionsVersion,
                roleKeys,
            } = res.data.data;

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

            setPhase('success');

            setTimeout(() => {
                navigate(`/${user.societyId}/dashboard`);
            }, 1500);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Activation failed. Please try again.');
            setPhase('valid');
        }
    };

    /* ── Resend invite ────────────────────────────────────────────────── */
    const handleResend = async (e) => {
        e.preventDefault();
        setResendMsg('');
        setResending(true);
        try {
            await api.post('/api/v1/auth/invite/resend', { email: resendEmail });
            setResendMsg('A new invite link has been logged to the server console (dev mode). Check your terminal!');
        } catch (err) {
            setResendMsg(err.response?.data?.message || 'Failed to resend. Please contact support.');
        } finally {
            setResending(false);
        }
    };

    const strength = getStrength(password);

    /* ─────────────────────────────────── RENDER ─────────────────────── */
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] flex items-center justify-center p-4 font-sans">

            {/* Background glow orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-600/8 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 text-white font-bold text-2xl">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8800] flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        </div>
                        MySocietySuite
                    </div>
                </div>

                {/* ── LOADING ── */}
                {phase === 'loading' && (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center backdrop-blur-xl">
                        <div className="flex justify-center mb-4">
                            <SpinnerIcon />
                        </div>
                        <p className="text-white/60 text-sm">Validating your invite link…</p>
                    </div>
                )}

                {/* ── INVALID TOKEN ── */}
                {phase === 'invalid' && (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-500/15 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertIcon />
                            </div>
                            <h1 className="text-xl font-bold text-white mb-2">Link Invalid or Expired</h1>
                            <p className="text-white/50 text-sm">{errorMsg}</p>
                        </div>

                        <div className="border-t border-white/10 pt-6">
                            <p className="text-white/60 text-sm text-center mb-4">Request a new invite link by entering your email below.</p>
                            <form onSubmit={handleResend} className="space-y-3">
                                <input
                                    type="email"
                                    required
                                    value={resendEmail}
                                    onChange={e => setResendEmail(e.target.value)}
                                    placeholder="Your email address"
                                    className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-sm transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={resending}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-[#FF6B00] to-[#FF8800] text-white hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-60"
                                >
                                    {resending ? <><SpinnerIcon /> Sending…</> : 'Request New Invite'}
                                </button>
                                {resendMsg && (
                                    <p className="text-center text-sm mt-2" style={{ color: resendMsg.includes('logged') ? '#10b981' : '#f87171' }}>
                                        {resendMsg}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {/* ── OTP VERIFICATION ── */}
                {phase === 'otp_verify' && inviteData && (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                        <OtpVerificationStep
                            identifier={inviteData.adminEmail || inviteData.adminPhone}
                            purpose={inviteData.purpose === 'manager' ? 'manager_invite' : 'resident_invite'}
                            societyId={inviteData.societyId}
                            otpApi={otpApi}
                            onVerified={() => setPhase('valid')}
                        />
                    </div>
                )}

                {/* ── VALID — Activation Form ── */}
                {(phase === 'valid' || phase === 'activating') && inviteData && (
                    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
                        {/* Header */}
                        <div className="px-8 pt-8 pb-6 border-b border-white/8">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/15 border border-orange-500/25 rounded-full mb-4">
                                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                                <span className="text-orange-300 text-xs font-semibold tracking-wide uppercase">Invitation Pending</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-1">
                                Welcome, {inviteData.adminName?.split(' ')[0]}!
                            </h1>
                            <p className="text-white/50 text-sm">
                                You've been invited to manage <span className="text-white/80 font-semibold">{inviteData.societyName}</span>. Set your password to activate your account.
                            </p>
                        </div>

                        <form onSubmit={handleActivate} className="px-8 py-6 space-y-5">
                            {/* Info row */}
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm shrink-0">
                                    {inviteData.adminName?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">{inviteData.adminName}</p>
                                    <p className="text-white/40 text-xs">{inviteData.adminEmail}</p>
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="block text-white/70 text-sm font-medium">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Minimum 6 characters"
                                        className="w-full px-4 py-3 pr-12 bg-white/8 border border-white/15 rounded-xl text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-sm transition-all"
                                    />
                                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                                        {showPw ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                                {/* Strength bar */}
                                {password.length > 0 && (
                                    <div className="space-y-1 pt-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ background: i <= strength ? strengthColor[strength] : 'rgba(255,255,255,0.1)' }} />
                                            ))}
                                        </div>
                                        <p className="text-xs" style={{ color: strengthColor[strength] }}>{strengthLabel[strength]}</p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm */}
                            <div className="space-y-1.5">
                                <label className="block text-white/70 text-sm font-medium">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        placeholder="Re-enter your password"
                                        className="w-full px-4 py-3 pr-12 bg-white/8 border border-white/15 rounded-xl text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-sm transition-all"
                                    />
                                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                                        {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                                {confirm.length > 0 && password !== confirm && (
                                    <p className="text-red-400 text-xs">Passwords do not match</p>
                                )}
                                {confirm.length > 0 && password === confirm && (
                                    <p className="text-emerald-400 text-xs flex items-center gap-1"><CheckIcon />Passwords match</p>
                                )}
                            </div>

                            {formError && (
                                <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl text-sm">
                                    {formError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={phase === 'activating'}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white transition-all bg-gradient-to-r from-[#FF6B00] to-[#FF8800] hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98] disabled:opacity-60"
                            >
                                {phase === 'activating' ? <><SpinnerIcon />Activating your account…</> : 'Activate My Account →'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── SUCCESS ── */}
                {phase === 'success' && (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center backdrop-blur-xl shadow-2xl">
                        <div className="w-20 h-20 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Account Activated!</h1>
                        <p className="text-white/50 text-sm mb-8">
                            Redirecting you to your society dashboard…
                        </p>
                        <button
                            onClick={() => {
                                const user = JSON.parse(localStorage.getItem('user') || '{}');
                                if (user.societyId) {
                                    navigate(`/${user.societyId}/dashboard`);
                                } else {
                                    navigate('/');
                                }
                            }}
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8800] hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                        >
                            Go to Dashboard →
                        </button>
                    </div>
                )}

                <p className="text-center text-white/20 text-xs mt-8">
                    © {new Date().getFullYear()} MySocietySuite · Invite links expire after 24 hours
                </p>
            </div>
        </div>
    );
}
