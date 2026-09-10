import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../services/apiClient';

const VisitorLiveApproval = () => {
    const { societyId, entryId } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('pending'); // 'pending', 'approved', 'rejected'
    const [visitor, setVisitor] = useState(null);
    const [gateId, setGateId] = useState(null);
    const pollIntervalRef = useRef(null);

    // 1. Fetch gate assignment (optional, for gate room)
    useEffect(() => {
        const fetchGate = async () => {
            try {
                const gateRes = await api.get('/guard/my-gate', { headers: { 'x-tenant-id': societyId } });
                const gId = gateRes.data.data.gateId?._id || gateRes.data.data.gateId;
                if (gId) setGateId(gId);
            } catch (err) {
                // Guard might not have gate assigned; still proceed
                console.warn("Gate assignment check:", err.message);
            }
        };
        fetchGate();
    }, [societyId]);

    // 2. Fetch visitor status from API and poll until resolved
    useEffect(() => {
        if (!entryId) return;

        const checkStatus = async () => {
            try {
                const res = await api.get(`/visitor/${entryId}`, { headers: { 'x-tenant-id': societyId } });
                const data = res.data?.data;
                if (data) {
                    setVisitor(data);
                    if (data.status === 'approved' || data.status === 'checked_in') {
                        setStatus('approved');
                        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    } else if (data.status === 'rejected') {
                        setStatus('rejected');
                        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    }
                }
            } catch (err) {
                console.error("Error polling visitor status:", err.message);
            }
        };

        // Initial check immediately
        checkStatus();

        // Fallback polling every 2.5 seconds
        pollIntervalRef.current = setInterval(checkStatus, 2500);

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [societyId, entryId]);

    // 3. Real-time WebSocket connection
    useEffect(() => {
        if (!entryId) return;

        const socketURL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
        const socket = io(socketURL, {
            query: {
                entryId,
                gateId: gateId || '',
                role: 'guard'
            }
        });

        socket.on("connect", () => {
            console.log("Connected to socket for live approval:", socket.id);
            socket.emit("join-entry", entryId);
            if (gateId) socket.emit("join-gate", gateId);
        });

        socket.on("visitor-status-updated", (data) => {
            if (data._id === entryId || data.id === entryId) {
                setVisitor(prev => ({ ...prev, ...data }));
                if (data.status === 'approved' || data.status === 'checked_in') {
                    setStatus('approved');
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                } else if (data.status === 'rejected') {
                    setStatus('rejected');
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                }
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [entryId, gateId]);

    const handleDone = () => {
        navigate(`/${societyId}/dashboard`);
    };

    const isApproved = status === 'approved' || status === 'checked_in';
    const isRejected = status === 'rejected';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center">
                {/* Visitor Info Header */}
                {visitor && (
                    <div className="mb-6 pb-4 border-b border-gray-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
                            {visitor.category || 'Guest'}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mt-2">{visitor.visitorName}</h3>
                        {visitor.visitorMobile && (
                            <p className="text-sm text-gray-500 mt-0.5">{visitor.visitorMobile}</p>
                        )}
                        {visitor.vehicleNumber && (
                            <p className="text-xs font-semibold text-gray-700 bg-gray-100 inline-block px-2.5 py-1 rounded-lg mt-2">
                                🚗 {visitor.vehicleNumber}
                            </p>
                        )}
                    </div>
                )}

                {/* Status Content */}
                {!isApproved && !isRejected && (
                    <>
                        <div className="relative w-20 h-20 mx-auto mb-5">
                            <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-200 border-t-orange-500"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-xl">⏳</div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Waiting for Approval</h2>
                        <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                            Notification sent to the resident.<br />
                            This screen will update automatically as soon as they approve.
                        </p>
                    </>
                )}

                {isApproved && (
                    <div className="animate-fade-in">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-emerald-600">Entry Approved!</h2>
                        <p className="text-gray-600 text-sm mt-2 font-medium">
                            The resident has approved this visitor. Allow entry through the gate.
                        </p>
                        <button
                            onClick={handleDone}
                            className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl py-3.5 font-bold shadow-lg shadow-green-600/30 hover:shadow-xl hover:from-emerald-600 hover:to-green-700 transition-all active:scale-95"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}

                {isRejected && (
                    <div className="animate-fade-in">
                        <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-rose-600">Entry Denied</h2>
                        <p className="text-gray-600 text-sm mt-2 font-medium">
                            The resident has declined this visitor. Do not permit entry.
                        </p>
                        <button
                            onClick={handleDone}
                            className="mt-6 w-full bg-gray-900 text-white rounded-2xl py-3.5 font-bold hover:bg-black transition-all active:scale-95"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitorLiveApproval;
