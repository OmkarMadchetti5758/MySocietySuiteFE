import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../services/apiClient';
import toast from 'react-hot-toast';

const WalkInVisitor = () => {
    const { societyId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [societies, setSocieties] = useState([]);
    const [currentSociety, setCurrentSociety] = useState(null);
    const [flats, setFlats] = useState([]);
    const [flatsLoading, setFlatsLoading] = useState(true);
    
    // Filtering states
    const [selectedWing, setSelectedWing] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const prefill = location.state || {};

    const [formData, setFormData] = useState({
        visitorName: prefill.visitorName || '',
        visitorMobile: prefill.visitorMobile || '',
        purposeOfVisit: prefill.purposeOfVisit || (prefill.qrReason ? `Fallback approval for QR: ${prefill.qrReason}` : ''),
        vehicleNumber: '',
        flatId: prefill.flatId || '',
        flatText: '',
        category: prefill.category || 'guest' // 'guest', 'delivery', 'service'
    });
    const [loading, setLoading] = useState(false);
    const [gateId, setGateId] = useState('');

    // 1. Fetch Societies List
    useEffect(() => {
        const fetchSocieties = async () => {
            try {
                const res = await api.get('/societies/active');
                const list = res.data?.data?.societies || [];
                setSocieties(list);
                const matched = list.find(s => String(s._id) === String(societyId));
                if (matched) {
                    setCurrentSociety(matched);
                }
            } catch (err) {
                console.error("Error fetching societies", err);
            }
        };
        fetchSocieties();
    }, [societyId]);

    // 2. Fetch Gate and Flats for current society
    useEffect(() => {
        const fetchData = async () => {
            setFlatsLoading(true);
            try {
                // Fetch Gate ID
                const gateRes = await api.get('/guard/my-gate', { headers: { 'x-tenant-id': societyId }});
                if (gateRes.data.data) {
                    setGateId(gateRes.data.data.gateId?._id || gateRes.data.data.gateId || '');
                }
            } catch (err) {
                console.log("No active gate assigned to this guard yet.");
            }
            
            try {
                // Fetch Flats for society
                const flatsRes = await api.get('/flats', { headers: { 'x-tenant-id': societyId }});
                const flatList = flatsRes.data?.data?.flats || (Array.isArray(flatsRes.data?.data) ? flatsRes.data.data : []);
                setFlats(flatList);
            } catch (err) {
                console.error("Error fetching flats", err);
                toast.error("Failed to load flats for this society");
            } finally {
                setFlatsLoading(false);
            }
        };
        fetchData();
    }, [societyId]);

    // Extract all unique wings from flats
    const uniqueWings = useMemo(() => {
        const map = new Map();
        flats.forEach(f => {
            const blockName = (typeof f.blockId === 'object' ? f.blockId?.name : '') || '';
            const blockCode = (typeof f.blockId === 'object' ? f.blockId?.code : '') || '';
            if (blockName) {
                const label = blockCode ? `${blockName} (${blockCode})` : blockName;
                map.set(label, { name: blockName, code: blockCode, label });
            }
        });
        return Array.from(map.values());
    }, [flats]);

    // Filter flats based on Selected Wing & Search Term
    const filteredFlats = useMemo(() => {
        return flats.filter(f => {
            const blockName = (typeof f.blockId === 'object' ? f.blockId?.name : '') || '';
            const blockCode = (typeof f.blockId === 'object' ? f.blockId?.code : '') || '';
            const wingLabel = blockName ? `${blockName}${blockCode ? ` (${blockCode})` : ''}` : '';
            const flatNum = String(f.flatNumber || '');

            // 1. Wing filter
            if (selectedWing !== 'ALL' && wingLabel !== selectedWing) {
                return false;
            }

            // 2. Search query filter
            if (searchTerm.trim()) {
                const cleanQuery = searchTerm.toLowerCase().replace(/[\s-]/g, '');
                const combined = `${blockName}${flatNum}`.toLowerCase().replace(/[\s-]/g, '');
                const codeComb = `${blockCode}${flatNum}`.toLowerCase().replace(/[\s-]/g, '');
                const wingMatch = blockName.toLowerCase().includes(cleanQuery) || blockCode.toLowerCase().includes(cleanQuery);
                const flatMatch = flatNum.toLowerCase().includes(cleanQuery);

                return combined.includes(cleanQuery) || codeComb.includes(cleanQuery) || wingMatch || flatMatch;
            }

            return true;
        });
    }, [flats, selectedWing, searchTerm]);

    // Group filtered flats by Wing for structured display
    const groupedFlats = useMemo(() => {
        const groups = {};
        filteredFlats.forEach(f => {
            const blockName = (typeof f.blockId === 'object' ? f.blockId?.name : '') || '';
            const blockCode = (typeof f.blockId === 'object' ? f.blockId?.code : '') || '';
            const wingKey = blockName ? `${blockName}${blockCode ? ` (${blockCode})` : ''}` : 'Other Flats';
            if (!groups[wingKey]) groups[wingKey] = [];
            groups[wingKey].push(f);
        });
        return groups;
    }, [filteredFlats]);

    // Find the currently selected flat details
    const selectedFlatObj = useMemo(() => {
        return flats.find(f => f._id === formData.flatId);
    }, [flats, formData.flatId]);

    const handleSelectFlat = (flatId) => {
        const f = flats.find(x => x._id === flatId);
        if (f) {
            const blockName = (typeof f.blockId === 'object' ? f.blockId?.name : '') || '';
            const blockCode = (typeof f.blockId === 'object' ? f.blockId?.code : '') || '';
            const wingLabel = blockName ? `${blockName} (${blockCode})` : '';
            setFormData({
                ...formData,
                flatId: f._id,
                flatText: wingLabel ? `${wingLabel} - Flat ${f.flatNumber}` : `Flat ${f.flatNumber}`
            });
        } else {
            setFormData({
                ...formData,
                flatId: '',
                flatText: ''
            });
        }
    };

    const handleSocietyChange = (newSocietyId) => {
        if (newSocietyId && newSocietyId !== societyId) {
            navigate(`/${newSocietyId}/dashboard/walk-in`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.flatId) {
            toast.error("Please select a valid flat from the list");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                flatId: formData.flatId,
            };
            if (gateId) payload.gateId = gateId;

            const res = await api.post('/visitor/walk-in', payload, { headers: { 'x-tenant-id': societyId }});
            
            const entryId = res.data.data._id;
            toast.success("Visitor registered, waiting for resident approval");
            navigate(`/${societyId}/guard/live-approval/${entryId}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to register visitor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-3 sm:p-4 max-w-lg mx-auto w-full">
            {/* Top Navigation & Title */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="text-gray-500 mr-3 p-1 rounded-lg hover:bg-gray-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">Walk-in Visitor</h1>
                        <p className="text-xs text-gray-500">Register visitor & send approval</p>
                    </div>
                </div>
            </div>

            {/* Society Badge & Switcher */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-3.5 mb-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg flex-shrink-0">
                            🏢
                        </div>
                        <div className="min-w-0">
                            <div className="text-[11px] uppercase tracking-wider text-blue-100 font-semibold">Active Society</div>
                            <div className="text-sm font-bold truncate">
                                {currentSociety?.name || 'Sunrise Towers'}
                            </div>
                        </div>
                    </div>

                    {societies.length > 1 && (
                        <div className="flex-shrink-0 ml-2">
                            <select
                                value={societyId}
                                onChange={(e) => handleSocietyChange(e.target.value)}
                                className="text-xs font-semibold bg-white/20 border border-white/30 text-white py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                            >
                                {societies.map(s => (
                                    <option key={s._id} value={s._id} className="text-gray-900">
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Body */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 flex-1">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Visitor Name */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Visitor Name *</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Enter visitor full name"
                            value={formData.visitorName} 
                            onChange={(e) => setFormData({...formData, visitorName: e.target.value})} 
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                        />
                    </div>

                    {/* Mobile Number */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Mobile Number *</label>
                        <input 
                            type="tel" 
                            required 
                            placeholder="Enter 10-digit mobile"
                            value={formData.visitorMobile} 
                            onChange={(e) => setFormData({...formData, visitorMobile: e.target.value})} 
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Category *</label>
                        <select 
                            value={formData.category} 
                            onChange={(e) => setFormData({...formData, category: e.target.value})} 
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        >
                            <option value="guest">Guest / Relative</option>
                            <option value="delivery">Delivery (Swiggy, Zomato, Amazon, etc.)</option>
                            <option value="service">Service / Maintenance Staff</option>
                        </select>
                    </div>

                    {/* Flat to Visit (With Wing Selector & Search) */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                                Flat to Visit * <span className="text-blue-600 font-normal">({flats.length} added in society)</span>
                            </label>
                            {selectedFlatObj && (
                                <button
                                    type="button"
                                    onClick={() => handleSelectFlat('')}
                                    className="text-[11px] text-red-500 font-medium hover:underline"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Wing Filter Tabs */}
                        {uniqueWings.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setSelectedWing('ALL')}
                                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                                        selectedWing === 'ALL'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    All Wings ({flats.length})
                                </button>
                                {uniqueWings.map(w => {
                                    const count = flats.filter(f => {
                                        const bName = (typeof f.blockId === 'object' ? f.blockId?.name : '') || '';
                                        const bCode = (typeof f.blockId === 'object' ? f.blockId?.code : '') || '';
                                        return `${bName}${bCode ? ` (${bCode})` : ''}` === w.label;
                                    }).length;
                                    return (
                                        <button
                                            key={w.label}
                                            type="button"
                                            onClick={() => setSelectedWing(w.label)}
                                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                                                selectedWing === w.label
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {w.label} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Search Input for Quick Finding */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="🔍 Search wing or flat (e.g. Samaved, C1, 101)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Flat Select Dropdown with Optgroups */}
                        <select
                            required
                            value={formData.flatId}
                            onChange={(e) => handleSelectFlat(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
                        >
                            <option value="">
                                {flatsLoading 
                                    ? 'Loading flats...' 
                                    : filteredFlats.length === 0 
                                        ? '-- No flats match search --' 
                                        : '-- Select Flat to Visit --'}
                            </option>
                            {Object.entries(groupedFlats).map(([wingLabel, wingFlats]) => (
                                <optgroup key={wingLabel} label={`🏢 Wing: ${wingLabel}`}>
                                    {wingFlats.map(f => (
                                        <option key={f._id} value={f._id}>
                                            {wingLabel} - Flat {f.flatNumber}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>

                        {/* Selected Flat Confirmation Badge */}
                        {selectedFlatObj && (
                            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs font-semibold">
                                <span className="text-emerald-600 text-sm">✓</span>
                                <span>Selected: {formData.flatText}</span>
                            </div>
                        )}

                        {flats.length === 0 && !flatsLoading && (
                            <p className="text-xs text-amber-600 font-medium">
                                No flats registered for {currentSociety?.name || 'this society'}. Please add flats from admin dashboard.
                            </p>
                        )}
                    </div>

                    {/* Purpose of Visit */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Purpose of Visit</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Meeting, Parcel, Electric repair"
                            value={formData.purposeOfVisit} 
                            onChange={(e) => setFormData({...formData, purposeOfVisit: e.target.value})} 
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                        />
                    </div>

                    {/* Vehicle Number */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Vehicle Number (Optional)</label>
                        <input 
                            type="text" 
                            placeholder="e.g. MH 12 AB 1234"
                            value={formData.vehicleNumber} 
                            onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})} 
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={loading || !formData.flatId} 
                            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? 'Submitting...' : 'Send for Approval'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WalkInVisitor;
