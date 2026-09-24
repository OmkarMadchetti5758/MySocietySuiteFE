import React, { useState, useEffect } from 'react';
import {
  FaTimes, FaUsers, FaEye, FaCheckCircle,
  FaFileInvoice, FaShieldAlt, FaSpinner, FaRupeeSign, FaCalendarAlt
} from 'react-icons/fa';
import { festivalCollectionApi } from '../../../services/festivalCollectionApi';
import ContributionsModal from './ContributionsModal';
import CollectionReportModal from './CollectionReportModal';
import toast from 'react-hot-toast';

const CollectionDetailsDrawer = ({ isOpen, onClose, collection, canManage, onRefresh }) => {
  const [residentStatus, setResidentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [payStep, setPayStep] = useState('idle'); // idle | paying | success
  const [amount, setAmount] = useState('');
  const [contributionsModalOpen, setContributionsModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const authStr = localStorage.getItem('user');
  const user = authStr ? JSON.parse(authStr) : null;
  const flatId = user?.flatId || user?.flats?.[0]?.flatId?._id || user?.flats?.[0]?.flatId;

  useEffect(() => {
    if (isOpen && collection) {
      const defaultAmt = collection.amountPerFlat > 0
        ? collection.amountPerFlat
        : collection.suggestedAmount > 0
          ? collection.suggestedAmount
          : '';
      setAmount(defaultAmt.toString());
      setPayStep('idle');
      setResidentStatus(null);
      if (!canManage) fetchResidentStatus();
    }
  }, [isOpen, collection, canManage]);

  const fetchResidentStatus = async () => {
    try {
      setLoading(true);
      const res = await festivalCollectionApi.getResidentStatus(collection._id);
      if ((res.status === 'success' || res.success) && res.data?.contributions?.length > 0) {
        setResidentStatus(res.data.contributions[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (contributionId) => {
    try {
      setDownloadLoading(true);
      await festivalCollectionApi.downloadContributionReceipt(collection._id, contributionId);
      toast.success('Receipt downloaded!');
    } catch (err) {
      toast.error('Failed to download receipt. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });

  const handlePayNow = async () => {
    const payAmt = Number(amount);
    if (!payAmt || payAmt <= 0) { toast.error('Please enter a valid amount.'); return; }
    if (!flatId) { toast.error('Your flat is not linked. Contact admin.'); return; }

    try {
      setPayLoading(true);
      setPayStep('paying');

      const initRes = await festivalCollectionApi.initiateOnlinePayment(collection._id, { amount: payAmt, flatId });
      const { key: keyId, order, contributionId } = initRes.data || {};
      if (!order?.id) throw new Error('Failed to create payment order.');

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load Razorpay. Check internet.');

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount: Math.round(payAmt * 100),
          currency: 'INR',
          name: 'MySocietySuite',
          description: `Contribution — ${collection.title}`,
          order_id: order.id,
          theme: { color: '#f97316' },
          handler: async (response) => {
            try {
              await festivalCollectionApi.verifyOnlinePayment(collection._id, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                contributionId,
              });
              setPayStep('success');
              toast.success('Payment successful! 🎉');
              fetchResidentStatus();
              if (onRefresh) onRefresh();
              resolve();
            } catch (err) {
              setPayStep('idle');
              toast.error('Payment verification failed.');
              reject(err);
            }
          },
          modal: { ondismiss: () => { setPayStep('idle'); reject(new Error('closed')); } }
        });
        rzp.on('payment.failed', (r) => { setPayStep('idle'); toast.error(r.error.description || 'Payment failed.'); reject(new Error(r.error.description)); });
        rzp.open();
      });
    } catch (err) {
      if (err.message !== 'closed') toast.error(err.message || 'Payment failed.');
      setPayStep('idle');
    } finally {
      setPayLoading(false);
    }
  };

  if (!isOpen || !collection) return null;

  const progressPct = collection.targetAmount > 0
    ? Math.min(100, Math.round(((collection.collectedAmount || 0) / collection.targetAmount) * 100))
    : 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Centered Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <h2 className="text-lg font-bold text-gray-900">Collection Details</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
              <FaTimes />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto">

          {/* Hero */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold">{collection.title}</h3>
                {collection.purpose && (
                  <p className="text-orange-100 text-sm mt-1">{collection.purpose}</p>
                )}
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${collection.status === 'ACTIVE' ? 'bg-green-400/20 text-green-100 border border-green-300/30' : 'bg-gray-400/20 text-gray-100'}`}>
                {collection.status}
              </span>
            </div>
            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-orange-100 mb-1.5">
                <span>Collected: ₹{(collection.collectedAmount || 0).toLocaleString()}</span>
                <span>Target: ₹{(collection.targetAmount || 0).toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-orange-100 text-xs mt-1 text-right">{progressPct}% reached</p>
            </div>
          </div>

          <div className="p-5 space-y-5">

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Fixed / Flat</p>
                <p className="text-base font-bold text-gray-900 mt-1">
                  {collection.amountPerFlat > 0 ? `₹${collection.amountPerFlat.toLocaleString()}` : '—'}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Suggested</p>
                <p className="text-base font-bold text-gray-900 mt-1">
                  {collection.suggestedAmount > 0 ? `₹${collection.suggestedAmount.toLocaleString()}` : '—'}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide flex items-center gap-1">
                  <FaCalendarAlt size={9} /> Due Date
                </p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {collection.dueDate ? new Date(collection.dueDate).toLocaleDateString('en-IN') : '—'}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide flex items-center gap-1">
                  <FaCalendarAlt size={9} /> Event Date
                </p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {collection.eventDate ? new Date(collection.eventDate).toLocaleDateString('en-IN') : '—'}
                </p>
              </div>
            </div>

            {collection.description && (
              <p className="text-gray-500 text-sm p-3 bg-gray-50 rounded-xl border border-gray-100 leading-relaxed">{collection.description}</p>
            )}

            {/* ── RESIDENT: Payment Section ── */}
            {!canManage && (
              <div className="border-t border-gray-100 pt-5">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Your Contribution</h4>

                {loading ? (
                  <div className="animate-pulse bg-gray-100 h-24 rounded-xl" />
                ) : residentStatus ? (
                  /* Already Paid */
                  <div className="bg-green-50 border border-green-200 p-5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shrink-0">
                        <FaCheckCircle />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Paid ₹{(residentStatus.amount || 0).toLocaleString()}</p>
                        <p className="text-xs text-green-700">
                          {residentStatus.paymentDate ? new Date(residentStatus.paymentDate).toLocaleDateString('en-IN') : 'Payment recorded'}
                        </p>
                      </div>
                    </div>
                    {residentStatus.receiptId && (
                      <button
                        onClick={() => handleDownloadReceipt(residentStatus._id)}
                        disabled={downloadLoading}
                        className="flex items-center justify-center gap-2 w-full py-2.5 border border-green-300 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors disabled:opacity-60"
                      >
                        {downloadLoading ? (
                          <><FaSpinner className="animate-spin" /> Generating PDF...</>
                        ) : (
                          <><FaFileInvoice /> Download Receipt (PDF)</>
                        )}
                      </button>
                    )}
                  </div>
                ) : payStep === 'success' ? (
                  <div className="bg-green-50 border border-green-200 p-6 rounded-2xl text-center">
                    <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-3" />
                    <p className="font-bold text-gray-900">Payment Successful!</p>
                    <p className="text-sm text-green-600 mt-1">Thank you for your contribution.</p>
                  </div>
                ) : (
                  /* Inline Pay Now */
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl overflow-hidden">
                    <div className="bg-orange-500 px-5 py-3 flex items-center gap-2">
                      <FaRupeeSign className="text-white text-sm" />
                      <span className="text-white font-bold text-sm">Make Your Contribution</span>
                    </div>
                    <div className="p-5">
                      {/* Amount Input */}
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Amount to Pay
                        <span className="ml-2 text-xs text-gray-400 font-normal">(editable)</span>
                      </label>
                      <div className="relative mb-3">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-orange-600 font-bold text-lg">₹</span>
                        <input
                          type="number"
                          min="1"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full pl-9 pr-4 py-3 bg-white border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 text-xl font-bold text-gray-900 transition-all"
                          placeholder="Enter amount"
                          disabled={payLoading}
                        />
                      </div>

                      {/* Quick select */}
                      <div className="flex gap-2 flex-wrap mb-5">
                        {collection.amountPerFlat > 0 && (
                          <button
                            type="button"
                            onClick={() => setAmount(collection.amountPerFlat.toString())}
                            className="px-3 py-1 bg-white border border-orange-300 rounded-full text-xs font-bold text-orange-700 hover:bg-orange-100 transition-colors"
                          >
                            Fixed ₹{collection.amountPerFlat}
                          </button>
                        )}
                        {collection.suggestedAmount > 0 && (
                          <button
                            type="button"
                            onClick={() => setAmount(collection.suggestedAmount.toString())}
                            className="px-3 py-1 bg-white border border-orange-300 rounded-full text-xs font-bold text-orange-700 hover:bg-orange-100 transition-colors"
                          >
                            Suggested ₹{collection.suggestedAmount}
                          </button>
                        )}
                      </div>

                      {/* Pay Button */}
                      <button
                        onClick={handlePayNow}
                        disabled={payLoading || !amount || Number(amount) <= 0}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                      >
                        {payLoading
                          ? <><FaSpinner className="animate-spin" /> Processing...</>
                          : <><FaShieldAlt /> Pay ₹{Number(amount || 0).toLocaleString()} Securely</>
                        }
                      </button>

                      <p className="text-center text-[11px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                        <FaShieldAlt size={10} /> Secured by Razorpay
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ADMIN: Actions ── */}
            {canManage && (
              <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-1">Admin Actions</h4>
                <button
                  onClick={() => setContributionsModalOpen(true)}
                  className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <FaUsers className="text-orange-500" /> View Contributions & Record Offline
                </button>
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <FaEye className="text-orange-500" /> View Report
                </button>
              </div>
            )}

          </div>{/* end p-5 content */}
        </div>{/* end scrollable body */}
      </div>{/* end white card */}
      </div>{/* end flex centering wrapper */}
      {/* End centered modal wrapper */}

      {contributionsModalOpen && (
        <ContributionsModal
          isOpen={contributionsModalOpen}
          onClose={() => setContributionsModalOpen(false)}
          collection={collection}
          onRefresh={onRefresh}
        />
      )}

      {reportModalOpen && (
        <CollectionReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          collection={collection}
        />
      )}
    </>
  );
};

export default CollectionDetailsDrawer;

