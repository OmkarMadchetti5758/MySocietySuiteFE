import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/apiClient';
import toast from 'react-hot-toast';

const WalkInIcon = () => (
    <svg className="w-10 h-10 text-blue-500 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const QRIcon = () => (
    <svg className="w-10 h-10 text-emerald-500 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
);

const VehicleIcon = () => (
    <svg className="w-10 h-10 text-purple-500 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
);

const SOSIcon = () => (
    <svg className="w-10 h-10 text-red-500 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const GuardDashboard = () => {
    const { societyId } = useParams();
    const navigate = useNavigate();
    const [gate, setGate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGate = async () => {
            try {
                const res = await api.get('/guard/my-gate', {
                    headers: { 'x-tenant-id': societyId }
                });
                setGate(res.data.data.gateId);
            } catch (error) {
                console.error("Gate fetch error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGate();
    }, [societyId]);

    const handleSOS = async () => {
        if (window.confirm("Are you sure you want to trigger SOS Alert?")) {
            try {
                await api.post('/sos/trigger', {}, { headers: { 'x-tenant-id': societyId } });
                toast.success("SOS Alert Triggered!");
            } catch (err) {
                toast.error("Failed to trigger SOS");
            }
        }
    };

    if (loading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    const quickModules = [
        {
            title: 'Walk-in Visitor',
            subtitle: 'Register new visitor & send approval to resident',
            icon: WalkInIcon,
            color: 'bg-blue-50 text-blue-600 border-blue-100',
            link: `/${societyId}/dashboard/walk-in`
        },
        {
            title: 'QR Scan Pass',
            subtitle: 'Scan digital pass for quick resident guest check-in',
            icon: QRIcon,
            color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            link: `/${societyId}/dashboard/qr-scan`
        },
        {
            title: 'Vehicle Lookup',
            subtitle: 'Search registered resident & visitor vehicles',
            icon: VehicleIcon,
            color: 'bg-purple-50 text-purple-600 border-purple-100',
            link: `/${societyId}/dashboard/vehicle-lookup`
        },
        {
            title: 'Emergency SOS',
            subtitle: 'Broadcast emergency security alert to society admins',
            icon: SOSIcon,
            color: 'bg-red-50 text-red-600 border-red-100',
            action: handleSOS
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto py-2">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative z-10">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Security Portal</span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">Gate Security Operations</h1>
                    <p className="text-slate-300 text-sm mt-1">Manage walk-in visitors, QR pass check-ins and gate security</p>
                </div>
                {gate && (
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-right z-10">
                        <span className="text-[10px] text-blue-200 uppercase tracking-wider block font-semibold">Assigned Gate</span>
                        <span className="text-base font-bold text-white">{gate.name || 'Gate 1'}</span>
                    </div>
                )}
            </div>

            {/* Quick Access Grid */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Quick Operations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {quickModules.map((mod, idx) => {
                        const IconComponent = mod.icon;
                        const cardContent = (
                            <div className="flex items-start gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group cursor-pointer h-full">
                                <div className={`p-3.5 rounded-2xl border ${mod.color} shrink-0 group-hover:scale-105 transition-transform`}>
                                    <IconComponent />
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                                        {mod.title}
                                        <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">{mod.subtitle}</p>
                                </div>
                            </div>
                        );

                        if (mod.link) {
                            return (
                                <Link key={idx} to={mod.link} className="block">
                                    {cardContent}
                                </Link>
                            );
                        }

                        return (
                            <div key={idx} onClick={mod.action}>
                                {cardContent}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GuardDashboard;
