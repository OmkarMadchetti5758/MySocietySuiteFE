import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../../services/apiClient';
import toast from 'react-hot-toast';
import {
    FaUserCheck, FaUserTimes, FaUser, FaPhoneAlt, FaCar, FaClipboard,
    FaHistory, FaClock, FaCheckCircle, FaTimesCircle, FaDoorOpen, FaBell,
    FaQrcode, FaPlus, FaShareAlt, FaBan, FaCalendarAlt, FaCopy, FaCheck
} from 'react-icons/fa';

const STATUS_CONFIG = {
    pending:    { label: 'Pending',    color: 'bg-amber-100 text-amber-700 border-amber-200',   icon: FaClock },
    approved:   { label: 'Approved',   color: 'bg-blue-100 text-blue-700 border-blue-200',      icon: FaCheckCircle },
    rejected:   { label: 'Denied',     color: 'bg-rose-100 text-rose-700 border-rose-200',         icon: FaTimesCircle },
    checked_in: { label: 'Checked In', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: FaDoorOpen },
};

const CATEGORY_LABEL = { guest: 'Guest', delivery: 'Delivery', service: 'Service', cab: 'Cab' };

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ─── Modal to Generate Digital QR Pass ──────────────────────────────────────────
const CreateQRPassModal = ({ isOpen, onClose, societyId, onSuccess, userFlats }) => {
    const [formData, setFormData] = useState({
        visitorName: '',
        visitorMobile: '',
        flatId: userFlats[0]?._id || '',
        type: 'one_time', // 'one_time' or 'recurring'
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        validDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timeWindowStart: '08:00',
        timeWindowEnd: '22:00'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (userFlats.length > 0 && !formData.flatId) {
            setFormData(prev => ({ ...prev, flatId: userFlats[0]._id }));
        }
    }, [userFlats, formData.flatId]);

    if (!isOpen) return null;

    const toggleDay = (day) => {
        setFormData(prev => {
            const exists = prev.validDays.includes(day);
            return {
                ...prev,
                validDays: exists ? prev.validDays.filter(d => d !== day) : [...prev.validDays, day]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.visitorName.trim()) {
            toast.error("Please enter visitor name");
            return;
        }
        if (!formData.flatId) {
            toast.error("Please select a flat");
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post('/visitor/qr-pass', formData, {
                headers: { 'x-tenant-id': societyId }
            });
            toast.success("Digital QR Pass created successfully!");
            onSuccess(res.data.data);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create QR Pass");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 my-8">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FaQrcode className="text-orange-500" />
                            Create Digital QR Pass
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">Pre-approve a visitor, guest, cab or recurring staff</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center font-bold"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Visitor Name & Mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Visitor Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Amit or Maid Sunita"
                                required
                                value={formData.visitorName}
                                onChange={e => setFormData({ ...formData, visitorName: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mobile Number</label>
                            <input
                                type="tel"
                                placeholder="e.g. 9876543210"
                                value={formData.visitorMobile}
                                onChange={e => setFormData({ ...formData, visitorMobile: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Flat selection */}
                    {userFlats.length > 1 && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Flat *</label>
                            <select
                                value={formData.flatId}
                                onChange={e => setFormData({ ...formData, flatId: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                            >
                                {userFlats.map(f => (
                                    <option key={f._id} value={f._id}>
                                        {f.blockId?.name || ''} {f.flatNumber}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Pass Type: One-time vs Recurring */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Pass Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'one_time' })}
                                className={`py-3 px-4 rounded-2xl border text-sm font-bold flex flex-col items-center gap-1 transition-all ${
                                    formData.type === 'one_time'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <span>⚡ One-Time Pass</span>
                                <span className="text-[11px] font-normal text-gray-500">For Guest, Delivery, Cab</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'recurring' })}
                                className={`py-3 px-4 rounded-2xl border text-sm font-bold flex flex-col items-center gap-1 transition-all ${
                                    formData.type === 'recurring'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <span>🔄 Recurring Pass</span>
                                <span className="text-[11px] font-normal text-gray-500">For Maid, Driver, Milkman</span>
                            </button>
                        </div>
                    </div>

                    {/* Validity Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Valid From</label>
                            <input
                                type="date"
                                value={formData.validFrom}
                                onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Valid To</label>
                            <input
                                type="date"
                                value={formData.validTo}
                                onChange={e => setFormData({ ...formData, validTo: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Recurring Days Selection */}
                    {formData.type === 'recurring' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Valid Days of Week</label>
                            <div className="flex flex-wrap gap-1.5">
                                {DAYS_OF_WEEK.map(day => {
                                    const selected = formData.validDays.includes(day);
                                    return (
                                        <button
                                            type="button"
                                            key={day}
                                            onClick={() => toggleDay(day)}
                                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                selected
                                                    ? 'bg-orange-500 text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {day.slice(0, 3)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Time Window */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Entry Window Start</label>
                            <input
                                type="time"
                                value={formData.timeWindowStart}
                                onChange={e => setFormData({ ...formData, timeWindowStart: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Entry Window End</label>
                            <input
                                type="time"
                                value={formData.timeWindowEnd}
                                onChange={e => setFormData({ ...formData, timeWindowEnd: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 text-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/30 hover:from-orange-600 hover:to-amber-700 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Generating...' : 'Generate Pass'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Modal to View & Share QR Pass ─────────────────────────────────────────────
const ViewQRPassModal = ({ pass, isOpen, onClose, onRevoke }) => {
    const [copied, setCopied] = useState(false);
    if (!isOpen || !pass) return null;

    const shareUrl = `${window.location.origin}/guest-pass/${pass.passCode}`;
    const isExpired = new Date() > new Date(pass.validTo);
    const isUsed = pass.type === 'one_time' && pass.isUsed;
    const isRevoked = pass.status === 'revoked';

    const handleCopy = () => {
        navigator.clipboard.writeText(pass.passCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Pass code copied!");
    };

    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(
            `Hello ${pass.visitorName}, here is your Digital Entry Pass for our society!\nPass Code: ${pass.passCode}\nType: ${pass.type === 'recurring' ? 'Recurring' : 'One-Time'}\nValid: ${new Date(pass.validFrom).toLocaleDateString()} to ${new Date(pass.validTo).toLocaleDateString()} (${pass.timeWindowStart || 'Anytime'} - ${pass.timeWindowEnd || 'Anytime'})\nShow this QR to the security guard at the gate.`
        );
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                        {pass.type === 'recurring' ? 'Recurring Pass' : 'One-Time Pass'}
                    </span>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center font-bold">
                        ✕
                    </button>
                </div>

                <h3 className="text-xl font-bold text-gray-900">{pass.visitorName}</h3>
                {pass.visitorMobile && <p className="text-xs text-gray-500">{pass.visitorMobile}</p>}

                {/* QR Code */}
                <div className="my-5 p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl inline-block shadow-sm">
                    <QRCodeSVG
                        value={pass.passCode}
                        size={180}
                        level="H"
                        includeMargin={true}
                    />
                    <div className="mt-2 text-xs font-mono font-bold tracking-wider text-gray-700 bg-gray-50 py-1 px-2 rounded-lg">
                        {pass.passCode}
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="mb-4">
                    {isRevoked ? (
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                            REVOKED ❌
                        </span>
                    ) : isUsed ? (
                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                            ALREADY USED ❌
                        </span>
                    ) : isExpired ? (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                            EXPIRED ❌
                        </span>
                    ) : (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            ACTIVE PASS ✅
                        </span>
                    )}
                </div>

                {/* Validity Details */}
                <div className="text-left text-xs bg-gray-50 p-3.5 rounded-xl space-y-1.5 text-gray-600 mb-5">
                    <p><strong>Valid:</strong> {new Date(pass.validFrom).toLocaleDateString()} - {new Date(pass.validTo).toLocaleDateString()}</p>
                    {pass.timeWindowStart && pass.timeWindowEnd && (
                        <p><strong>Time Window:</strong> {pass.timeWindowStart} to {pass.timeWindowEnd}</p>
                    )}
                    {pass.type === 'recurring' && pass.validDays?.length > 0 && (
                        <p><strong>Valid Days:</strong> {pass.validDays.join(", ")}</p>
                    )}
                </div>

                {/* Share Options */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                        onClick={handleShareWhatsApp}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-sm"
                    >
                        <FaShareAlt /> Share WhatsApp
                    </button>
                    <button
                        onClick={handleCopy}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-all"
                    >
                        {copied ? <FaCheck className="text-emerald-600" /> : <FaCopy />}
                        {copied ? 'Copied' : 'Copy Code'}
                    </button>
                </div>

                {pass.status !== 'revoked' && (
                    <button
                        onClick={() => onRevoke(pass._id)}
                        className="w-full py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                        Revoke this Pass
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── Main Visitor Page Component ───────────────────────────────────────────────
const VisitorApprovalPage = () => {
    const { societyId } = useParams();
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'qr_passes', 'history'
    const [pendingList, setPendingList] = useState([]);
    const [historyList, setHistoryList] = useState([]);
    const [qrPassesList, setQrPassesList] = useState([]);
    const [userFlats, setUserFlats] = useState([]);
    const [loadingId, setLoadingId] = useState(null);
    const [fetching, setFetching] = useState(false);

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedQrPass, setSelectedQrPass] = useState(null);

    // User info
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isResident = (user.roleKeys || []).some(r => ['resident_owner', 'resident_tenant'].includes(r));

    // Fetch flats for resident
    useEffect(() => {
        const fetchFlats = async () => {
            try {
                const res = await api.get('/flats', { headers: { 'x-tenant-id': societyId } });
                const list = res.data?.data?.flats || (Array.isArray(res.data?.data) ? res.data.data : []);
                setUserFlats(list);
            } catch (err) {
                console.warn("Flats fetch:", err.message);
            }
        };
        fetchFlats();
    }, [societyId]);

    // Fetch pending
    const fetchPending = useCallback(async () => {
        setFetching(true);
        try {
            const res = await api.get('/visitor/pending', { headers: { 'x-tenant-id': societyId } });
            setPendingList(res.data.data || []);
        } catch (err) {
            toast.error("Failed to load pending visitors");
        } finally {
            setFetching(false);
        }
    }, [societyId]);

    // Fetch history
    const fetchHistory = useCallback(async () => {
        setFetching(true);
        try {
            const res = await api.get('/visitor/history', { headers: { 'x-tenant-id': societyId } });
            setHistoryList(res.data.data || []);
        } catch (err) {
            toast.error("Failed to load visitor history");
        } finally {
            setFetching(false);
        }
    }, [societyId]);

    // Fetch QR Passes
    const fetchQrPasses = useCallback(async () => {
        setFetching(true);
        try {
            const res = await api.get('/visitor/qr-pass', { headers: { 'x-tenant-id': societyId } });
            setQrPassesList(res.data.data || []);
        } catch (err) {
            toast.error("Failed to load QR Passes");
        } finally {
            setFetching(false);
        }
    }, [societyId]);

    useEffect(() => {
        if (activeTab === 'pending') fetchPending();
        else if (activeTab === 'history') fetchHistory();
        else if (activeTab === 'qr_passes') fetchQrPasses();
    }, [activeTab, fetchPending, fetchHistory, fetchQrPasses]);

    // Real-time socket: listen for new visitor requests
    useEffect(() => {
        if (!isResident) return;
        const userId = user._id || user.id;
        if (!userId) return;

        const socketURL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
        const socket = io(socketURL, {
            query: { userId, role: 'resident' }
        });

        socket.on('connect', () => {
            socket.emit('join-user', userId);
        });

        socket.on('visitor-approval-request', (newEntry) => {
            toast.custom((t) => (
                <div className={`bg-white rounded-2xl shadow-lg border border-orange-200 p-4 flex items-center gap-3 max-w-sm ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                        <FaBell className="text-lg" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">New Visitor at Gate!</p>
                        <p className="text-sm text-gray-600">{newEntry.visitorName} wants to visit.</p>
                    </div>
                </div>
            ), { duration: 8000 });

            setPendingList(prev => [newEntry, ...prev.filter(e => e._id !== newEntry._id)]);
        });

        return () => socket.disconnect();
    }, [isResident, user._id, user.id]);

    const handleApprove = async (entryId) => {
        setLoadingId(entryId);
        try {
            await api.patch(`/visitor/${entryId}/approve`, { status: 'approved' }, {
                headers: { 'x-tenant-id': societyId }
            });
            toast.success('Visitor approved! They can enter now.');
            setPendingList(prev => prev.filter(e => e._id !== entryId));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve');
        } finally {
            setLoadingId(null);
        }
    };

    const handleDeny = async (entryId) => {
        setLoadingId(entryId);
        try {
            await api.patch(`/visitor/${entryId}/approve`, { status: 'rejected' }, {
                headers: { 'x-tenant-id': societyId }
            });
            toast.success('Visitor denied.');
            setPendingList(prev => prev.filter(e => e._id !== entryId));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to deny');
        } finally {
            setLoadingId(null);
        }
    };

    const handleRevokePass = async (passId) => {
        if (!window.confirm("Are you sure you want to revoke this QR Pass? It will no longer allow entry.")) return;
        try {
            await api.patch(`/visitor/qr-pass/${passId}/revoke`, {}, {
                headers: { 'x-tenant-id': societyId }
            });
            toast.success("QR Pass revoked!");
            setSelectedQrPass(null);
            fetchQrPasses();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to revoke pass");
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Visitor Management & QR Passes</h1>
                    <p className="text-gray-500 text-sm mt-1">Review live approvals or generate pre-approved QR passes</p>
                </div>
                {/* Generate QR Pass Button */}
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-amber-700 transition-all active:scale-95"
                >
                    <FaQrcode />
                    Generate QR Pass
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl border p-4 flex items-center gap-3 bg-amber-50 border-amber-200 text-amber-700">
                    <FaClock className="text-2xl" />
                    <div>
                        <p className="text-2xl font-bold">{pendingList.length}</p>
                        <p className="text-xs font-medium">Pending Approval</p>
                    </div>
                </div>
                <div className="rounded-2xl border p-4 flex items-center gap-3 bg-orange-50 border-orange-200 text-orange-700">
                    <FaQrcode className="text-2xl" />
                    <div>
                        <p className="text-2xl font-bold">{qrPassesList.length}</p>
                        <p className="text-xs font-medium">Digital QR Passes</p>
                    </div>
                </div>
                <div className="rounded-2xl border p-4 flex items-center gap-3 bg-blue-50 border-blue-200 text-blue-700 col-span-2 md:col-span-1">
                    <FaHistory className="text-2xl" />
                    <div>
                        <p className="text-2xl font-bold">{historyList.length}</p>
                        <p className="text-xs font-medium">All Logged Visitors</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-2xl w-fit flex-wrap">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        activeTab === 'pending'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <span>Pending Approvals</span>
                    {pendingList.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-orange-500 text-white">
                            {pendingList.length}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('qr_passes')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        activeTab === 'qr_passes'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaQrcode />
                    <span>My QR Passes</span>
                    {qrPassesList.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-gray-200 text-gray-700">
                            {qrPassesList.length}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        activeTab === 'history'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaHistory />
                    <span>Visitor Log History</span>
                </button>
            </div>

            {/* Content Display */}
            {fetching ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="animate-spin h-10 w-10 border-4 border-orange-200 border-t-orange-500 rounded-full"></div>
                    <p className="text-gray-400 text-sm">Loading...</p>
                </div>
            ) : activeTab === 'qr_passes' ? (
                // QR Passes Grid
                qrPassesList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-dashed border-gray-200 p-8 text-center">
                        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-3 text-2xl">
                            <FaQrcode />
                        </div>
                        <p className="font-bold text-gray-700">No QR Passes Created Yet</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm">
                            Create a pre-approved pass for guests, deliveries, or your maid/driver so they can enter seamlessly!
                        </p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-4 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl shadow hover:bg-orange-600 transition-all"
                        >
                            + Generate First Pass
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {qrPassesList.map(pass => {
                            const isExpired = new Date() > new Date(pass.validTo);
                            const isUsed = pass.type === 'one_time' && pass.isUsed;
                            const isRevoked = pass.status === 'revoked';

                            return (
                                <div key={pass._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                                pass.type === 'recurring' 
                                                    ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                            }`}>
                                                {pass.type === 'recurring' ? '🔄 Recurring' : '⚡ One-Time'}
                                            </span>

                                            {isRevoked ? (
                                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">REVOKED</span>
                                            ) : isUsed ? (
                                                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">USED</span>
                                            ) : isExpired ? (
                                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">EXPIRED</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ACTIVE</span>
                                            )}
                                        </div>

                                        <h3 className="font-bold text-gray-900 text-base">{pass.visitorName}</h3>
                                        {pass.visitorMobile && <p className="text-xs text-gray-500 mt-0.5">{pass.visitorMobile}</p>}

                                        <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500 space-y-1">
                                            <p>📅 {new Date(pass.validFrom).toLocaleDateString()} - {new Date(pass.validTo).toLocaleDateString()}</p>
                                            {pass.timeWindowStart && pass.timeWindowEnd && (
                                                <p>⏰ {pass.timeWindowStart} - {pass.timeWindowEnd}</p>
                                            )}
                                            {pass.type === 'recurring' && pass.validDays?.length > 0 && (
                                                <p>🗓️ {pass.validDays.map(d => d.slice(0, 3)).join(", ")}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action button to view QR */}
                                    <button
                                        onClick={() => setSelectedQrPass(pass)}
                                        className="mt-4 w-full py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <FaQrcode /> View QR & Share
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )
            ) : (
                // Pending Approvals or History Grid
                (activeTab === 'pending' ? pendingList : historyList).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300 text-2xl">
                            <FaUser />
                        </div>
                        <p className="font-semibold text-gray-500">
                            {activeTab === 'pending' ? 'No pending approvals' : 'No visitor history'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {activeTab === 'pending' ? 'All visitors have been reviewed.' : 'No visitors have been recorded yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {(activeTab === 'pending' ? pendingList : historyList).map(entry => {
                            const statusCfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
                            const StatusIcon = statusCfg.icon;
                            const time = new Date(entry.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                            const date = new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                            return (
                                <div key={entry._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
                                                    <FaUser />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{entry.visitorName}</p>
                                                    <p className="text-[11px] text-gray-400">{date} · {time}</p>
                                                </div>
                                            </div>
                                            <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusCfg.color}`}>
                                                <StatusIcon className="text-xs" />
                                                {statusCfg.label}
                                            </span>
                                        </div>

                                        <div className="py-3 text-xs space-y-1.5 text-gray-600">
                                            {entry.visitorMobile && (
                                                <div className="flex items-center gap-2">
                                                    <FaPhoneAlt className="text-gray-400" />
                                                    <span>{entry.visitorMobile}</span>
                                                </div>
                                            )}
                                            {entry.vehicleNumber && (
                                                <div className="flex items-center gap-2">
                                                    <FaCar className="text-gray-400" />
                                                    <span>{entry.vehicleNumber}</span>
                                                </div>
                                            )}
                                            {entry.purposeOfVisit && (
                                                <div className="flex items-center gap-2">
                                                    <FaClipboard className="text-gray-400" />
                                                    <span>{entry.purposeOfVisit}</span>
                                                </div>
                                            )}
                                            {entry.isQrPass && (
                                                <div className="flex items-center gap-1.5 text-purple-600 font-semibold mt-1">
                                                    <FaQrcode /> Verified via Digital QR Pass
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {entry.status === 'pending' && (
                                        <div className="pt-3 border-t border-gray-50 flex gap-2">
                                            <button
                                                onClick={() => handleDeny(entry._id)}
                                                disabled={loadingId === entry._id}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-rose-200 text-rose-600 font-semibold text-xs hover:bg-rose-50 transition-all disabled:opacity-50"
                                            >
                                                <FaUserTimes /> Deny
                                            </button>
                                            <button
                                                onClick={() => handleApprove(entry._id)}
                                                disabled={loadingId === entry._id}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-xs hover:from-emerald-600 hover:to-green-700 transition-all shadow-sm shadow-green-500/30 disabled:opacity-50"
                                            >
                                                <FaUserCheck /> Approve
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            )}

            {/* Modal: Create QR Pass */}
            <CreateQRPassModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                societyId={societyId}
                userFlats={userFlats}
                onSuccess={(newPass) => {
                    setQrPassesList(prev => [newPass, ...prev]);
                    setSelectedQrPass(newPass);
                }}
            />

            {/* Modal: View & Share QR Pass */}
            <ViewQRPassModal
                isOpen={!!selectedQrPass}
                pass={selectedQrPass}
                onClose={() => setSelectedQrPass(null)}
                onRevoke={handleRevokePass}
            />
        </div>
    );
};

export default VisitorApprovalPage;
