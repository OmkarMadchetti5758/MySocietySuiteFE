import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/apiClient';
import toast from 'react-hot-toast';

const VehicleLookup = () => {
    const { societyId } = useParams();
    const navigate = useNavigate();
    const [regNumber, setRegNumber] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await api.get(`/vehicle/lookup/${regNumber}`, { headers: { 'x-tenant-id': societyId }});
            setResult(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || "Vehicle not found");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-4">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="text-gray-500 mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <h1 className="text-xl font-bold text-gray-800">Vehicle Lookup</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
                <form onSubmit={handleSearch} className="flex space-x-2">
                    <input 
                        type="text" 
                        required 
                        value={regNumber} 
                        onChange={(e) => setRegNumber(e.target.value.toUpperCase())} 
                        placeholder="e.g. MH12AB1234"
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 font-mono" 
                    />
                    <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                        {loading ? '...' : 'Find'}
                    </button>
                </form>

                {error && (
                    <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-center">
                        <p>{error}</p>
                    </div>
                )}

                {result && (
                    <div className="mt-8 border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Vehicle Found</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Registration:</span>
                                <span className="font-mono font-bold">{result.regNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Type:</span>
                                <span className="font-medium capitalize">{result.type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Make/Model:</span>
                                <span className="font-medium">{result.make} {result.model}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Flat:</span>
                                <span className="font-medium">{result.flatId?.flatNumber || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleLookup;
