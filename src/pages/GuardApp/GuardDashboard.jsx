import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/apiClient';
import toast from 'react-hot-toast';

// We'll use simple SVGs for icons
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
    <svg className="w-14 h-14 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                // toast.error("Could not fetch assigned gate. Are you assigned?");
            } finally {
                setLoading(false);
            }
        };
        fetchGate();
    }, [societyId]);

    const handleLogout = () => {
        localStorage.clear();
        navigate(`/${societyId}/guard/login`);
    };

    const handleSOS = async () => {
        if(window.confirm("Are you sure you want to trigger SOS?")) {
            try {
                await api.post('/sos/trigger', {}, { headers: { 'x-tenant-id': societyId } });
                toast.success("SOS Alert Triggered!");
            } catch (err) {
                toast.error("Failed to trigger SOS");
            }
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">


            {/* Main Content Area */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center pb-24">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full">
                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome!</h2>
                    <p className="text-slate-500 mb-2">Please select an option from the sidebar to continue.</p>
                </div>
            </div>
        </div>
    );
};

export default GuardDashboard;
