import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaCreditCard, FaMobileAlt, FaUniversity, FaShieldAlt, FaCheckCircle, FaDownload } from 'react-icons/fa';
import { festivalCollectionApi } from '../../../services/festivalCollectionApi';
import toast from 'react-hot-toast';

export default function ResidentPayNowModal({ isOpen, onClose, collection, flatId, onSuccess }) {
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('select'); // 'select' | 'processing' | 'success'
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    if (isOpen && collection) {
      setAmount((collection.suggestedAmount || 0).toString());
      setStep('select');
      setPaymentMode('UPI');
      setReceiptData(null);
    }
  }, [isOpen, collection]);

  const handlePay = async (e) => {
    e.preventDefault();
    const payAmt = Number(amount);
    if (!payAmt || payAmt <= 0) {
      toast.error('Please enter a valid payment amount.');
      return;
    }

    try {
      setLoading(true);
      setStep('processing');

      const initRes = await festivalCollectionApi.initiateOnlinePayment(collection._id, {
        amount: payAmt,
        flatId: flatId,
      });

      const { key: keyId, order, contributionId } = initRes.data || {};

      if (!order?.id) {
        throw new Error('Failed to create payment order.');
      }

      await openRazorpayCheckout({ keyId, orderId: order.id, contributionId, amount: payAmt, collection });
    } catch (err) {
      setStep('select');
      toast.error(err.message || 'Payment initiation failed.');
    } finally {
      setLoading(false);
    }
  };

  const openRazorpayCheckout = ({ keyId, orderId, contributionId, amount: payAmt, collection }) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => launchRazorpay({ keyId, orderId, contributionId, amount: payAmt, collection, resolve, reject });
        script.onerror = () => reject(new Error('Failed to load Razorpay SDK.'));
        document.head.appendChild(script);
      } else {
        launchRazorpay({ keyId, orderId, contributionId, amount: payAmt, collection, resolve, reject });
      }
    });
  };

  const launchRazorpay = ({ keyId, orderId, contributionId, amount, collection, resolve, reject }) => {
    const options = {
      key: keyId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      name: 'MySocietySuite',
      description: `Contribution for ${collection.title}`,
      order_id: orderId,
      handler: async (response) => {
        try {
          setStep('processing');
          const verifyRes = await festivalCollectionApi.verifyOnlinePayment(collection._id, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            contributionId,
          });
          const result = verifyRes.data;
          setReceiptData(result?.receipt || null);
          setStep('success');
          toast.success('Payment successful! Receipt generated.');
          if (onSuccess) onSuccess(result);
          resolve(result);
        } catch (err) {
          setStep('select');
          toast.error('Payment verification failed.');
          reject(err);
        }
      },
      prefill: {
        name: 'Resident',
      },
      theme: { color: '#f97316' },
      modal: {
        ondismiss: () => {
          setStep('select');
          reject(new Error('Payment window closed.'));
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      setStep('select');
      toast.error(response.error.description || 'Payment Failed');
      reject(new Error(response.error.description));
    });
    rzp.open();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => step !== 'processing' && onClose()} />
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10">
        
        {step === 'processing' && (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment...</h3>
            <p className="text-gray-500">Please do not close or refresh this window.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
              <FaCheckCircle className="text-4xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-500 mb-8">Thank you for your contribution to {collection.title}.</p>
            
            <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors">
              Close
            </button>
          </div>
        )}

        {step === 'select' && (
          <>
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-6 text-white relative">
              <button onClick={onClose} className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors">
                <FaTimes size={20} />
              </button>
              <h2 className="text-xl font-bold mb-1">Make Contribution</h2>
              <p className="text-orange-100 text-sm opacity-90">{collection.title}</p>
              
              <div className="mt-6 flex items-center gap-2 text-orange-50">
                <FaShieldAlt className="text-lg" />
                <p className="text-xs text-orange-100 mt-0.5">Secure online payment via Razorpay</p>
              </div>
            </div>

            <form onSubmit={handlePay} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Pay (₹)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 text-lg font-medium">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-lg font-semibold text-gray-900"
                    placeholder="Enter amount"
                  />
                </div>
                {collection.suggestedAmount > 0 && (
                   <p className="text-xs text-gray-500 mt-2">Suggested Contribution: ₹{collection.suggestedAmount}</p>
                )}
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Payment Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPaymentMode('UPI')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMode === 'UPI' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50/50'}`}>
                    <FaMobileAlt className="text-2xl mb-2" />
                    <span className="text-xs font-bold">UPI</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMode('CARD')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMode === 'CARD' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50/50'}`}>
                    <FaCreditCard className="text-2xl mb-2" />
                    <span className="text-xs font-bold">Card</span>
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100">
                {loading ? <FaSpinner className="animate-spin" /> : `Pay ₹${amount || 0}`}
              </button>
              
              <div className="mt-4 text-center">
                <span className="text-[10px] text-gray-400">Your payment is secured by Razorpay. Card details are never stored.</span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
