import React, { useState, useEffect } from 'react';
import {
  FaTimes, FaChartPie, FaMoneyBillWave, FaUsers, FaCheckCircle,
  FaExclamationCircle, FaDownload, FaPrint, FaSearch, FaFileInvoice,
  FaSpinner, FaCalendarAlt, FaCreditCard, FaExchangeAlt
} from 'react-icons/fa';
import { festivalCollectionApi } from '../../../services/festivalCollectionApi';
import toast from 'react-hot-toast';

const CollectionReportModal = ({ isOpen, onClose, collection }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('paid'); // 'paid' | 'unpaid'
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);

  useEffect(() => {
    if (isOpen && collection) {
      fetchReport();
    }
  }, [isOpen, collection]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await festivalCollectionApi.getCollectionReport(collection._id);
      const body = res?.data || res;
      setReport(body);
    } catch (error) {
      toast.error('Failed to load collection report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (contributionId) => {
    try {
      setDownloadingReceiptId(contributionId);
      await festivalCollectionApi.downloadContributionReceipt(collection._id, contributionId);
      toast.success('Receipt downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download receipt');
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  const handleExportCSV = () => {
    if (!report) return;
    const items = activeTab === 'paid' ? (report.contributions || []) : (report.unpaidFlats || []);
    
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'paid') {
      csvContent += 'Flat,Resident,Amount,Payment Mode,Transaction Reference,Payment Date\n';
      items.forEach(c => {
        const flat = `"${c.flatId?.blockId?.name ? c.flatId.blockId.name + ' - ' : ''}${c.flatId?.flatNumber || ''}"`;
        const resident = `"${c.paidBy?.name || 'Resident'}"`;
        const amount = c.amount || 0;
        const mode = `"${c.paymentMethod || c.paymentMode || 'OFFLINE'}"`;
        const ref = `"${c.transactionRef || c.transactionReference || ''}"`;
        const date = `"${c.paymentDate ? new Date(c.paymentDate).toLocaleDateString('en-IN') : ''}"`;
        csvContent += `${flat},${resident},${amount},${mode},${ref},${date}\n`;
      });
    } else {
      csvContent += 'Block,Flat Number,Resident / Owner,Status\n';
      items.forEach(f => {
        const block = `"${f.blockName || ''}"`;
        const flatNo = `"${f.flatNumber || ''}"`;
        const resident = `"${f.residentName || '-'}"`;
        csvContent += `${block},${flatNo},${resident},Pending\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${collection.title}_${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !collection) return null;

  const targetAmount = report?.totalTarget ?? (collection.targetAmount || 0);
  const collectedAmount = report?.totalCollected ?? (collection.collectedAmount || 0);
  const paidCount = report?.totalPaidCount ?? 0;
  const unpaidCount = report?.totalUnpaidCount ?? 0;
  const totalFlats = report?.targetFlatsCount || (paidCount + unpaidCount) || 1;
  const progressPct = targetAmount > 0 ? Math.min(100, Math.round((collectedAmount / targetAmount) * 100)) : 0;

  // Filtered contributions
  const filteredContributions = (report?.contributions || []).filter(c => {
    const flatNo = c.flatId?.flatNumber || '';
    const blockName = c.flatId?.blockId?.name || '';
    const name = c.paidBy?.name || '';
    const ref = c.transactionRef || c.transactionReference || '';
    const search = searchTerm.toLowerCase();
    return (
      flatNo.toLowerCase().includes(search) ||
      blockName.toLowerCase().includes(search) ||
      name.toLowerCase().includes(search) ||
      ref.toLowerCase().includes(search)
    );
  });

  // Filtered unpaid flats
  const filteredUnpaid = (report?.unpaidFlats || []).filter(f => {
    const flatNo = f.flatNumber || '';
    const blockName = f.blockName || '';
    const name = f.residentName || '';
    const search = searchTerm.toLowerCase();
    return (
      flatNo.toLowerCase().includes(search) ||
      blockName.toLowerCase().includes(search) ||
      name.toLowerCase().includes(search)
    );
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col relative z-10 overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg">
                <FaChartPie />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Collection Report
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-orange-100 text-orange-700">
                    {collection.title}
                  </span>
                </h2>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  {collection.eventDate && (
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt size={11} className="text-gray-400" />
                      Event: {new Date(collection.eventDate).toLocaleDateString('en-IN')}
                    </span>
                  )}
                  {collection.dueDate && (
                    <span>Due: {new Date(collection.dueDate).toLocaleDateString('en-IN')}</span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    collection.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {collection.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              disabled={loading || !report}
              className="px-3.5 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <FaDownload /> Export CSV
            </button>
            <button
              onClick={handlePrint}
              disabled={loading || !report}
              className="px-3.5 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <FaPrint /> Print
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors ml-1"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
          {loading ? (
            <div className="text-center py-24 text-gray-500 flex flex-col items-center justify-center gap-3">
              <FaSpinner className="animate-spin text-orange-500 text-3xl" />
              <span className="text-sm font-medium">Generating collection report...</span>
            </div>
          ) : report ? (
            <>
              {/* Summary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Target */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl shrink-0">
                    <FaMoneyBillWave />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Target Amount</p>
                    <p className="text-2xl font-black text-gray-900 mt-0.5">
                      ₹{targetAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Collected */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl shrink-0">
                    <FaCheckCircle />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Collected Amount</p>
                    <p className="text-2xl font-black text-green-600 mt-0.5">
                      ₹{collectedAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Paid Flats */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl shrink-0">
                    <FaUsers />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Flats Paid</p>
                    <p className="text-2xl font-black text-gray-900 mt-0.5">
                      {paidCount} <span className="text-xs text-gray-400 font-semibold">/ {totalFlats} flats</span>
                    </p>
                  </div>
                </div>

                {/* Unpaid Flats */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-xl shrink-0">
                    <FaExclamationCircle />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending Flats</p>
                    <p className="text-2xl font-black text-rose-600 mt-0.5">
                      {unpaidCount} <span className="text-xs text-gray-400 font-semibold">flats</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress & Breakdown Banner */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Collection Progress</h3>
                    <p className="text-xs text-gray-500">
                      ₹{collectedAmount.toLocaleString()} collected of ₹{targetAmount.toLocaleString()} target
                    </p>
                  </div>
                  <span className="text-lg font-black text-orange-600">
                    {progressPct}% Reached
                  </span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Payment Mode Pills */}
                {report.byPaymentMode && report.byPaymentMode.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                      Collection by Payment Mode:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {report.byPaymentMode.map(m => (
                        <div key={m._id} className="bg-gray-50 border border-gray-200/80 px-3.5 py-2 rounded-xl flex items-center gap-2.5">
                          <span className="text-xs font-bold uppercase text-gray-700">{m._id}</span>
                          <span className="text-xs font-black text-gray-900">₹{(m.total || 0).toLocaleString()}</span>
                          <span className="text-[10px] font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                            {m.count} {m.count === 1 ? 'txn' : 'txns'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Tabs: Paid vs Unpaid */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tab buttons */}
                <div className="flex items-center justify-between px-6 pt-4 border-b border-gray-100 bg-white">
                  <div className="flex gap-4">
                    <button
                      onClick={() => { setActiveTab('paid'); setSearchTerm(''); }}
                      className={`pb-3.5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
                        activeTab === 'paid'
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <FaCheckCircle className={activeTab === 'paid' ? 'text-orange-500' : 'text-gray-400'} />
                      Paid Contributions
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === 'paid' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {report.contributions?.length || 0}
                      </span>
                    </button>

                    <button
                      onClick={() => { setActiveTab('unpaid'); setSearchTerm(''); }}
                      className={`pb-3.5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
                        activeTab === 'unpaid'
                          ? 'border-rose-500 text-rose-600'
                          : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <FaExclamationCircle className={activeTab === 'unpaid' ? 'text-rose-500' : 'text-gray-400'} />
                      Pending Flats
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === 'unpaid' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {report.unpaidFlats?.length || 0}
                      </span>
                    </button>
                  </div>

                  {/* Search inside tab */}
                  <div className="relative pb-3 w-64">
                    <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
                    <input
                      type="text"
                      placeholder={`Search ${activeTab === 'paid' ? 'paid contributions' : 'pending flats'}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Tab 1: Paid Contributions List */}
                {activeTab === 'paid' && (
                  <div>
                    {filteredContributions.length === 0 ? (
                      <div className="p-12 text-center text-gray-500">
                        <p className="font-semibold text-gray-700">No paid contributions found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {searchTerm ? 'Try adjusting your search keywords.' : 'No residents have contributed yet.'}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-600 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                            <tr>
                              <th className="px-6 py-3.5">Flat Number</th>
                              <th className="px-6 py-3.5">Resident</th>
                              <th className="px-6 py-3.5">Amount</th>
                              <th className="px-6 py-3.5">Payment Mode</th>
                              <th className="px-6 py-3.5">Date</th>
                              <th className="px-6 py-3.5 text-right">Receipt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredContributions.map(c => {
                              const flatLabel = c.flatId?.blockId?.name
                                ? `${c.flatId.blockId.name} - Flat ${c.flatId.flatNumber}`
                                : (c.flatId?.flatNumber ? `Flat ${c.flatId.flatNumber}` : 'Flat');
                              const residentName = c.paidBy?.name || 'Resident';

                              return (
                                <tr key={c._id} className="hover:bg-gray-50/60 transition-colors">
                                  <td className="px-6 py-3.5 font-bold text-gray-900">
                                    {flatLabel}
                                  </td>
                                  <td className="px-6 py-3.5">
                                    <div className="font-medium text-gray-800">{residentName}</div>
                                    {c.paidBy?.phone && (
                                      <div className="text-[11px] text-gray-400">{c.paidBy.phone}</div>
                                    )}
                                  </td>
                                  <td className="px-6 py-3.5">
                                    <span className="font-bold text-gray-900">
                                      ₹{(c.amount || 0).toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3.5">
                                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-gray-100 text-gray-700 border border-gray-200">
                                      {c.paymentMethod || c.paymentMode || 'OFFLINE'}
                                    </span>
                                    {(c.transactionRef || c.transactionReference) && (
                                      <div className="text-[10px] text-gray-400 mt-1 font-mono truncate max-w-[140px]">
                                        {c.transactionRef || c.transactionReference}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-3.5 text-xs text-gray-500">
                                    {c.paymentDate ? new Date(c.paymentDate).toLocaleDateString('en-IN') : '-'}
                                  </td>
                                  <td className="px-6 py-3.5 text-right">
                                    <button
                                      onClick={() => handleDownloadReceipt(c._id)}
                                      disabled={downloadingReceiptId === c._id}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200/50 transition-colors disabled:opacity-60"
                                    >
                                      {downloadingReceiptId === c._id ? (
                                        <><FaSpinner className="animate-spin" /> PDF...</>
                                      ) : (
                                        <><FaFileInvoice size={10} /> Receipt</>
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Pending Flats List */}
                {activeTab === 'unpaid' && (
                  <div>
                    {filteredUnpaid.length === 0 ? (
                      <div className="p-12 text-center text-gray-500">
                        <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-2" />
                        <p className="font-bold text-gray-800">All flats have contributed!</p>
                        <p className="text-xs text-gray-400 mt-1">There are no pending contributions for this festival.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-600 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                            <tr>
                              <th className="px-6 py-3.5">Block / Wing</th>
                              <th className="px-6 py-3.5">Flat Number</th>
                              <th className="px-6 py-3.5">Primary Resident / Owner</th>
                              <th className="px-6 py-3.5">Expected Amount</th>
                              <th className="px-6 py-3.5 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredUnpaid.map(f => (
                              <tr key={f._id} className="hover:bg-gray-50/60 transition-colors">
                                <td className="px-6 py-3.5 font-medium text-gray-600">
                                  {f.blockName || '-'}
                                </td>
                                <td className="px-6 py-3.5 font-bold text-gray-900">
                                  Flat {f.flatNumber}
                                </td>
                                <td className="px-6 py-3.5 text-gray-700">
                                  {f.residentName || '-'}
                                </td>
                                <td className="px-6 py-3.5 text-gray-600 font-medium">
                                  ₹{(collection.amountPerFlat || collection.suggestedAmount || 0).toLocaleString()}
                                </td>
                                <td className="px-6 py-3.5 text-right">
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-rose-50 text-rose-600 border border-rose-200">
                                    Pending
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              Failed to load report data. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionReportModal;
