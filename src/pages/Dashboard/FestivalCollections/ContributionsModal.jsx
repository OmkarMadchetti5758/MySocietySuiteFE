import React, { useState, useEffect } from 'react';
import {
  FaTimes, FaSearch, FaCheckCircle, FaFileInvoice, FaMoneyBillWave,
  FaSpinner, FaDownload, FaArrowLeft, FaReceipt
} from 'react-icons/fa';
import { festivalCollectionApi } from '../../../services/festivalCollectionApi';
import { flatApi } from '../../../services/flatApi';
import toast from 'react-hot-toast';

const ContributionsModal = ({ isOpen, onClose, collection, onRefresh }) => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Offline payment states
  const [showOfflineForm, setShowOfflineForm] = useState(false);
  const [flats, setFlats] = useState([]);
  const [submittingOffline, setSubmittingOffline] = useState(false);
  const [offlineForm, setOfflineForm] = useState({
    flatId: '',
    amount: '',
    paymentMode: 'CASH',
    reference: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen && collection) {
      fetchContributions();
      fetchFlats();
      // Set default amount
      const defaultAmt = collection.amountPerFlat > 0
        ? collection.amountPerFlat
        : collection.suggestedAmount > 0
          ? collection.suggestedAmount
          : '';
      setOfflineForm(prev => ({ ...prev, amount: defaultAmt }));
    }
  }, [isOpen, collection]);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const res = await festivalCollectionApi.getContributions(collection._id);
      const body = res?.data || res;
      const list = Array.isArray(body)
        ? body
        : (Array.isArray(body?.data) ? body.data : (body?.contributions || []));
      setContributions(list);
    } catch (error) {
      toast.error('Failed to load contributions');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlats = async () => {
    try {
      const res = await flatApi.getFlats();
      const body = res?.data || res;
      const list = body?.data?.flats || body?.flats || (Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []));
      setFlats(list);
    } catch (error) {
      console.error('Failed to load flats', error);
    }
  };

  const handleDownloadReceipt = async (contributionId) => {
    try {
      setDownloadingId(contributionId);
      await festivalCollectionApi.downloadContributionReceipt(collection._id, contributionId);
      toast.success('Receipt downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download receipt');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOfflineSubmit = async (e) => {
    e.preventDefault();
    if (!offlineForm.flatId || !offlineForm.amount) {
      return toast.error("Please fill all required fields");
    }

    try {
      setSubmittingOffline(true);
      await festivalCollectionApi.recordOfflineContribution(collection._id, {
        flatId: offlineForm.flatId,
        amount: Number(offlineForm.amount),
        paymentMode: offlineForm.paymentMode,
        reference: offlineForm.reference,
        transactionRef: offlineForm.reference,
        paymentDate: offlineForm.paymentDate,
      });

      toast.success('Offline payment recorded successfully! 🎉');
      setShowOfflineForm(false);
      setOfflineForm({
        flatId: '',
        amount: collection.amountPerFlat || collection.suggestedAmount || '',
        paymentMode: 'CASH',
        reference: '',
        paymentDate: new Date().toISOString().split('T')[0]
      });
      fetchContributions();
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmittingOffline(false);
    }
  };

  const filteredContributions = (Array.isArray(contributions) ? contributions : []).filter(c => {
    const flatNo = c.flatId?.flatNumber || '';
    const blockName = c.flatId?.blockId?.name || '';
    const name = c.paidBy?.name || c.residentId?.userId?.name || '';
    const ref = c.transactionRef || c.transactionReference || '';
    const search = searchTerm.toLowerCase();
    return (
      flatNo.toLowerCase().includes(search) ||
      blockName.toLowerCase().includes(search) ||
      name.toLowerCase().includes(search) ||
      ref.toLowerCase().includes(search)
    );
  });

  const totalCollectedInList = (Array.isArray(contributions) ? contributions : []).reduce(
    (sum, c) => sum + (Number(c.amount) || 0),
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">Festival Contributions</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                {collection.title}
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Total Recorded: <span className="font-bold text-gray-800">₹{totalCollectedInList.toLocaleString()}</span> ({contributions.length} payments)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOfflineForm(!showOfflineForm)}
              className={`px-4 py-2 font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2 ${
                showOfflineForm
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {showOfflineForm ? (
                <><FaArrowLeft size={12} /> View Contributions List</>
              ) : (
                <><FaMoneyBillWave /> + Record Offline Payment</>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {showOfflineForm ? (
            /* Offline Payment Form */
            <div className="max-w-xl mx-auto bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg">
                  <FaMoneyBillWave />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Record Offline Contribution</h3>
                  <p className="text-xs text-gray-500">Record payments received via Cash, UPI, Cheque, or Bank Transfer</p>
                </div>
              </div>

              <form onSubmit={handleOfflineSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Select Flat <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={offlineForm.flatId}
                    onChange={e => setOfflineForm({ ...offlineForm, flatId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-medium text-gray-800"
                  >
                    <option value="">-- Select Flat --</option>
                    {flats.map(f => (
                      <option key={f._id} value={f._id}>
                        {f.blockId?.name ? `${f.blockId.name} - ` : ''}Flat {f.flatNumber}
                        {f.primaryOwner?.name ? ` (${f.primaryOwner.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-bold">₹</span>
                      <input
                        required
                        type="number"
                        min="1"
                        value={offlineForm.amount}
                        onChange={e => setOfflineForm({ ...offlineForm, amount: e.target.value })}
                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                        placeholder="Enter amount"
                      />
                    </div>
                    {collection.suggestedAmount > 0 && (
                      <p className="text-[11px] text-gray-400 mt-1">Suggested: ₹{collection.suggestedAmount}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Payment Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={offlineForm.paymentMode}
                      onChange={e => setOfflineForm({ ...offlineForm, paymentMode: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium text-gray-800"
                    >
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Payment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="date"
                      value={offlineForm.paymentDate}
                      onChange={e => setOfflineForm({ ...offlineForm, paymentDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Reference / Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UPI Ref / Cheque No"
                      value={offlineForm.reference}
                      onChange={e => setOfflineForm({ ...offlineForm, reference: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-gray-800"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowOfflineForm(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOffline}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
                  >
                    {submittingOffline ? (
                      <><FaSpinner className="animate-spin" /> Recording...</>
                    ) : (
                      <><FaCheckCircle /> Save Payment</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Contributions List View */
            <>
              {/* Search bar */}
              <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 mb-5 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by flat, resident name, or ref..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
                  />
                </div>
                <div className="text-xs text-gray-500 font-semibold">
                  Showing <span className="text-gray-900 font-bold">{filteredContributions.length}</span> contributions
                </div>
              </div>

              {loading ? (
                <div className="text-center py-16 text-gray-500 flex flex-col items-center justify-center gap-3">
                  <FaSpinner className="animate-spin text-orange-500 text-2xl" />
                  <span>Loading contributions...</span>
                </div>
              ) : filteredContributions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4 text-2xl">
                    <FaReceipt />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No contributions found</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                    {searchTerm ? 'No results matched your search keyword.' : 'No payments have been recorded for this festival yet.'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowOfflineForm(true)}
                      className="mt-4 px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
                    >
                      <FaMoneyBillWave /> Record First Payment
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-3.5">Flat / Resident</th>
                          <th className="px-6 py-3.5">Amount</th>
                          <th className="px-6 py-3.5">Mode</th>
                          <th className="px-6 py-3.5">Date</th>
                          <th className="px-6 py-3.5 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredContributions.map((cont) => {
                          const flatLabel = cont.flatId?.blockId?.name
                            ? `${cont.flatId.blockId.name} - Flat ${cont.flatId.flatNumber}`
                            : (cont.flatId?.flatNumber ? `Flat ${cont.flatId.flatNumber}` : 'Flat');
                          const residentName = cont.paidBy?.name || cont.residentId?.userId?.name || 'Resident';

                          return (
                            <tr key={cont._id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-gray-900">{flatLabel}</div>
                                <div className="text-xs text-gray-500">{residentName}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-gray-900">₹{(cont.amount || 0).toLocaleString()}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-gray-100 text-gray-700 border border-gray-200">
                                  {cont.paymentMethod || cont.paymentMode || cont.paymentSource || 'OFFLINE'}
                                </span>
                                {(cont.transactionRef || cont.transactionReference) && (
                                  <div className="text-[10px] text-gray-400 mt-1 font-mono truncate max-w-[140px]">
                                    {cont.transactionRef || cont.transactionReference}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-gray-500 text-xs">
                                {cont.paymentDate ? new Date(cont.paymentDate).toLocaleDateString('en-IN') : '-'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDownloadReceipt(cont._id)}
                                  disabled={downloadingId === cont._id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200/50 transition-colors disabled:opacity-60"
                                >
                                  {downloadingId === cont._id ? (
                                    <><FaSpinner className="animate-spin" /> PDF...</>
                                  ) : (
                                    <><FaDownload size={10} /> Receipt</>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContributionsModal;
