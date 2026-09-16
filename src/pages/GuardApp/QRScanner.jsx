import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../services/apiClient';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FaCheckCircle, FaTimesCircle, FaArrowLeft, FaClock, FaUser, 
    FaPhoneAlt, FaBuilding, FaExclamationTriangle, FaUserCheck, FaRedo 
} from 'react-icons/fa';

const QRScanner = () => {
    const { societyId } = useParams();
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [gateId, setGateId] = useState('');
    const scannerRef = useRef(null);

    // 1. Fetch Guard's assigned gate (optional)
    useEffect(() => {
        const fetchGate = async () => {
            try {
                const gateRes = await api.get('/guard/my-gate', { headers: { 'x-tenant-id': societyId }});
                if (gateRes.data?.data) {
                    setGateId(gateRes.data.data.gateId?._id || gateRes.data.data.gateId || '');
                }
            } catch (err) {
                console.log("No active gate assigned to this guard.");
            }
        };
        fetchGate();
    }, [societyId]);

    // 2. Initialize Scanner
    useEffect(() => {
        if (scanResult) return; // Don't run scanner if showing result

        const scanner = new Html5QrcodeScanner("reader", {
            qrbox: { width: 260, height: 260 },
            fps: 10,
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true
        });
        scannerRef.current = scanner;

        async function onScanSuccess(decodedText) {
            try {
                await scanner.clear();
            } catch (e) {}

            setLoading(true);
            try {
                const res = await api.post(
                    '/visitor/qr-scan', 
                    { qrCode: decodedText.trim(), gateId }, 
                    { headers: { 'x-tenant-id': societyId }}
                );
                setScanResult({
                    status: 'success',
                    data: res.data.data
                });
                toast.success("QR Validated & Entry Approved!");
            } catch (err) {
                const errData = err.response?.data || {};
                setScanResult({
                    status: 'error',
                    message: errData.message || "Invalid or Unrecognized QR Code",
                    errorCode: errData.errorCode || "QR_INVALID",
                    qrPass: errData.qrPass || null
                });
            } finally {
                setLoading(false);
            }
        }

        function onScanFailure(error) {
            // Ignored frame failures
        }

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => {});
            }
        };
    }, [societyId, gateId, scanResult]);

    // Fallback: Send for Manual Approval
    const handleSendForManualApproval = () => {
        const pass = scanResult?.qrPass || {};
        navigate(`/${societyId}/dashboard/walk-in`, {
            state: {
                visitorName: pass.visitorName || '',
                visitorMobile: pass.visitorMobile || '',
                flatId: pass.flatId?._id || pass.flatId || '',
                category: pass.type === 'recurring' ? 'service' : 'guest',
                qrReason: scanResult.message
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 mr-3 shadow-sm"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Scan QR Digital Pass</h1>
                        <p className="text-xs text-gray-500">Scan visitor or domestic staff pass</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
                
                {/* Camera Scanner View */}
                {!scanResult && !loading && (
                    <div className="w-full flex flex-col items-center">
                        <div id="reader" className="w-full max-w-sm rounded-2xl overflow-hidden shadow-inner border border-gray-200"></div>
                        <p className="text-center text-xs text-gray-500 mt-4 flex items-center gap-1.5 font-medium">
                            <FaClock className="text-orange-500" />
                            Point camera at visitor's Digital Pass QR
                        </p>
                    </div>
                )}
                
                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center my-12">
                        <div className="animate-spin rounded-full h-14 w-14 border-4 border-orange-200 border-t-orange-500"></div>
                        <p className="mt-4 text-base font-semibold text-gray-700">Validating QR Pass in Database...</p>
                        <p className="text-xs text-gray-400 mt-1">Verifying time window, dates, and status</p>
                    </div>
                )}

                {/* Success: Pass Valid ✅ */}
                {scanResult && scanResult.status === 'success' && (
                    <div className="text-center w-full animate-fade-in my-auto">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <FaCheckCircle className="text-4xl" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            VALID PASS ✅
                        </span>
                        <h2 className="text-2xl font-black text-emerald-600 mt-2">Entry Allowed!</h2>
                        <p className="text-gray-500 text-xs mt-1">Entry automatically logged in database</p>

                        <div className="mt-5 bg-gray-50 border border-gray-100 p-4 rounded-2xl text-left text-sm space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                                    <FaUser className="text-gray-400" /> Visitor
                                </span>
                                <span className="font-bold text-gray-900">{scanResult.data.qrPass.visitorName}</span>
                            </div>
                            {scanResult.data.qrPass.visitorMobile && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                                        <FaPhoneAlt className="text-gray-400" /> Mobile
                                    </span>
                                    <span className="font-medium text-gray-700">{scanResult.data.qrPass.visitorMobile}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                                    <FaBuilding className="text-gray-400" /> Pass Type
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize bg-blue-100 text-blue-700">
                                    {scanResult.data.qrPass.type?.replace('_', ' ')}
                                </span>
                            </div>
                            {scanResult.data.qrPass.timeWindowStart && scanResult.data.qrPass.timeWindowEnd && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                                        <FaClock className="text-gray-400" /> Time Window
                                    </span>
                                    <span className="font-medium text-gray-700 text-xs">
                                        {scanResult.data.qrPass.timeWindowStart} - {scanResult.data.qrPass.timeWindowEnd}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => setScanResult(null)} 
                            className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl py-3.5 font-bold shadow-lg shadow-green-600/30 hover:from-emerald-600 hover:to-green-700 transition-all active:scale-95"
                        >
                            Scan Next QR
                        </button>
                    </div>
                )}

                {/* Error: Pass Invalid / Expired / Already Used ❌ */}
                {scanResult && scanResult.status === 'error' && (
                    <div className="text-center w-full animate-fade-in my-auto">
                        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <FaTimesCircle className="text-4xl" />
                        </div>
                        
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                            {scanResult.errorCode === 'QR_ALREADY_USED' ? 'QR ALREADY USED ❌' : 
                             scanResult.errorCode === 'QR_EXPIRED' ? 'QR EXPIRED ❌' : 
                             scanResult.errorCode === 'QR_REVOKED' ? 'QR REVOKED ❌' : 'INVALID PASS ❌'}
                        </span>

                        <h2 className="text-2xl font-black text-rose-600 mt-2">Pass Invalid</h2>
                        <p className="text-gray-600 text-sm mt-1.5 font-medium px-4">{scanResult.message}</p>

                        {/* Fallback Notice: Do not send visitor away */}
                        <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left">
                            <div className="flex items-start gap-3">
                                <FaExclamationTriangle className="text-amber-500 text-lg mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-amber-800">Do Not Turn Visitor Away!</p>
                                    <p className="text-xs text-amber-700 mt-0.5">
                                        You can request <strong>Manual Resident Approval</strong> so the resident can approve them directly.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                            {/* Manual Approval Fallback Button */}
                            <button 
                                onClick={handleSendForManualApproval}
                                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl py-3.5 font-bold shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <FaUserCheck />
                                Request Manual Resident Approval
                            </button>

                            <button 
                                onClick={() => setScanResult(null)} 
                                className="w-full bg-gray-100 text-gray-700 rounded-2xl py-3 font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <FaRedo className="text-xs" />
                                Scan Another Pass
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRScanner;
