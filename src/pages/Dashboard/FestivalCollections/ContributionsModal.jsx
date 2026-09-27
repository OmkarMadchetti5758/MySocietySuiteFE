import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaCheckCircle, FaFileInvoice, FaMoneyBillWave } from 'react-icons/fa';
import { festivalCollectionApi } from '../../../services/festivalCollectionApi';
import { flatApi } from '../../../services/flatApi';
import toast from 'react-hot-toast';

const ContributionsModal = ({ isOpen, onClose, collection, onRefresh }) => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Offline payment states
  const [showOfflineForm, setShowOfflineForm] = useState(false);
  const [flats, setFlats] = useState([]);
  const [offlineForm, setOfflineForm] = useState({
    flatId: '',
    amount: '',
    reference: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen && collection) {
      fetchContributions();
      fetchFlats();
    }
  }, [isOpen, collection]);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const res = await festivalCollectionApi.getContributions(collection._id);
      if (res.status === 'success' || res.success) {
        setContributions(res.data);
      }
    } catch (error) {
      toast.error('Failed to load contributions');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlats = async () => {
    try {
      const res = await flatApi.getFlats();
      if (res.status === 'success' || res.success) setFlats(res.data);
    } catch (error) {
      console.error('Failed to load flats', error);
    }
  };

  const handleOfflineSubmit = async (e) => {
    e.preventDefault();
    if (!offlineForm.flatId || !offlineForm.amount) {
      return toast.error("Please fill all required fields");
    }

    try {
      setLoading(true);
      await festivalCollectionApi.recordOfflineContribution(collection._id, offlineForm);
      toast.success('Offline payment recorded successfully');
      setShowOfflineForm(false);
      setOfflineForm({ flatId: '', amount: '', reference: '', paymentDate: new Date().toISOString().split('T')[0] });
      fetchContributions();
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const filteredContributions = contributions.filter(c => 
    c.flatId?.flatNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.transactionReference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Contributions</h2>
            <p className="text-gray-500 text-sm mt-1">{collection.title}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowOfflineForm(!showOfflineForm)}
              className="px-4 py-2 bg-orange-50 text-orange-600 font-medium rounded-xl hover:bg-orange-100 transition-colors"
            >
              {showOfflineForm ? 'View List' : 'Record Offline Payment'}
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
          {showOfflineForm ? (
            <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaMoneyBillWave className="text-orange-500" />
                Record Cash/Cheque Payment
              </h3>
              <form onSubmit={handleOfflineSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Flat *</label>
                  <select 
                    required 
                    value={offlineForm.flatId} 
                    onChange={e => setOfflineForm({...offlineForm, flatId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">-- Select Flat --</option>
                    {flats.map(f => (
                      <option key={f._id} value={f._id}>{f.blockId?.name} - {f.flatNumber}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Received (₹) *</label>
                  <input 
                    required 
                    type="number" 
                    value={offlineForm.amount} 
                    onChange={e => setOfflineForm({...offlineForm, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Suggested amount: ₹{collection.suggestedAmount}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                  <input 
                    required 
                    type="date" 
                    value={offlineForm.paymentDate} 
                    onChange={e => setOfflineForm({...offlineForm, paymentDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference / Remark</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cash collected by guard, Cheque No 123"
                    value={offlineForm.reference} 
                    onChange={e => setOfflineForm({...offlineForm, reference: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={loading} className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors">
                    {loading ? 'Recording...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex">
                <div className="relative flex-1 max-w-sm">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Flat or Reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 text-sm"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-10 text-gray-500">Loading contributions...</div>
              ) : filteredContributions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <h3 className="text-lg font-medium text-gray-900">No contributions yet</h3>
                  <p className="text-gray-500 mt-1">Payments recorded will appear here.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">Flat / Resident</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Mode</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredContributions.map((cont) => (
                        <tr key={cont._id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{cont.flatId?.flatNumber}</div>
                            <div className="text-xs text-gray-500">{cont.residentId?.userId?.name || 'Resident'}</div>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">₹{cont.amount}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] uppercase font-bold rounded-full">
                              {cont.paymentMode}
                            </span>
                            {cont.transactionReference && (
                              <div className="text-[10px] text-gray-400 mt-1">{cont.transactionReference}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-500">{new Date(cont.paymentDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-center">
                            {cont.receiptId ? (
                              <a href={`/receipts/${cont.receiptId}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                <FaFileInvoice /> View
                              </a>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
