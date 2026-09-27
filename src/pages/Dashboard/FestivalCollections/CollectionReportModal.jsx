import React, { useState, useEffect } from 'react';
import { FaTimes, FaChartPie, FaMoneyBillWave, FaUsers, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { festivalCollectionApi } from '../../../services/festivalCollectionApi';
import toast from 'react-hot-toast';

const CollectionReportModal = ({ isOpen, onClose, collection }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && collection) {
      fetchReport();
    }
  }, [isOpen, collection]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await festivalCollectionApi.getCollectionReport(collection._id);
      if (res.status === 'success' || res.success) {
        setReport(res.data);
      }
    } catch (error) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !collection) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col relative z-10">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaChartPie className="text-orange-500" />
              Collection Report
            </h2>
            <p className="text-gray-500 text-sm mt-1">{collection.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar space-y-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading report data...</div>
          ) : report ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center text-xl">
                    <FaMoneyBillWave />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target</p>
                    <p className="text-xl font-bold text-gray-900">₹{report.totalTarget?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-xl">
                    <FaCheckCircle />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Collected</p>
                    <p className="text-xl font-bold text-green-600">₹{report.totalCollected?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">
                    <FaUsers />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Paid Flats</p>
                    <p className="text-xl font-bold text-gray-900">{report.totalPaidCount}</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-xl">
                    <FaExclamationCircle />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Unpaid Flats</p>
                    <p className="text-xl font-bold text-gray-900">{report.totalUnpaidCount}</p>
                  </div>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Collection by Mode</h3>
                <div className="flex flex-wrap gap-4">
                  {report.byPaymentMode?.map((mode) => (
                    <div key={mode._id} className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 flex items-center gap-3">
                      <div className="font-bold text-gray-900">{mode._id}</div>
                      <div className="text-sm text-gray-600">₹{mode.total?.toLocaleString()}</div>
                      <div className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{mode.count}</div>
                    </div>
                  ))}
                  {(!report.byPaymentMode || report.byPaymentMode.length === 0) && (
                    <div className="text-sm text-gray-500">No payments received yet.</div>
                  )}
                </div>
              </div>

            </>
          ) : (
            <div className="text-center py-12 text-gray-500">Failed to load report data.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionReportModal;
