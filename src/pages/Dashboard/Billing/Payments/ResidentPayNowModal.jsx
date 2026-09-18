import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaCreditCard, FaMobileAlt, FaUniversity, FaShieldAlt } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

export default function ResidentPayNowModal({ isOpen, onClose, invoice, onSuccess }) {
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('select'); // 'select' | 'processing' | 'success'
  const [receiptData, setReceiptData] = useState(null);

  const fineAmount = invoice?.fineAmount || 0;
  const totalPayable = (invoice?.totalAmount || 0) + fineAmount;
  const remainingBalance = invoice ? Math.max(0, totalPayable - (invoice.paidAmount || 0)) : 0;

  useEffect(() => {
    if (isOpen && invoice) {
      setAmount(remainingBalance.toString());
      setStep('select');
      setPaymentMode('UPI');
      setReceiptData(null);
    }
  }, [isOpen, invoice]);

  const handlePay = async (e) => {
    e.preventDefault();
    const payAmt = Number(amount);
    if (!payAmt || payAmt <= 0) {
      toast.error('Please enter a valid payment amount.');
      return;
    }
    if (payAmt > remainingBalance + 1000) {
      toast.error('Amount exceeds invoice balance. Extra amount will go to Advance Account.');
    }

    try {
      setLoading(true);
      setStep('processing');

      // Step 1: Initiate payment order
      const initRes = await apiClient.post('/payments/online/initiate', {
        invoiceId: invoice._id,
        amount: payAmt,
        paymentMode,
      });

      const { keyId, orderId, paymentId, amount: orderAmount } = initRes.data?.data || {};

      if (!orderId) {
        throw new Error('Failed to create payment order.');
      }

      // Step 2: Open Razorpay checkout
      await openRazorpayCheckout({ keyId, orderId, paymentId, amount: orderAmount, payAmt, invoice });
    } catch (err) {
      setStep('select');
      toast.error(err.message || 'Payment initiation failed.');
    } finally {
      setLoading(false);
    }
  };

  const openRazorpayCheckout = ({ keyId, orderId, paymentId, amount: orderAmount, payAmt, invoice }) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        // Load script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => launchRazorpay({ keyId, orderId, paymentId, amount: orderAmount || payAmt, invoice, resolve, reject });
        script.onerror = () => reject(new Error('Failed to load Razorpay SDK.'));
        document.head.appendChild(script);
      } else {
        launchRazorpay({ keyId, orderId, paymentId, amount: orderAmount || payAmt, invoice, resolve, reject });
      }
    });
  };

  const launchRazorpay = ({ keyId, orderId, paymentId, amount, invoice, resolve, reject }) => {
    const options = {
      key: keyId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      name: 'MySocietySuite',
      description: `Payment for ${invoice.invoiceNumber}`,
      order_id: orderId,
      handler: async (response) => {
        try {
          setStep('processing');
          const verifyRes = await apiClient.post('/payments/online/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            paymentId,
          });
          const result = verifyRes.data?.data;
          setReceiptData(result?.receipt || null);
          setStep('success');
          toast.success('Payment successful! Receipt generated.');
          if (onSuccess) onSuccess(result);
          resolve(result);
        } catch (err) {
          setStep('select');
          toast.error(err.response?.data?.message || 'Payment verification failed.');
          reject(err);
        }
      },
      modal: {
        ondismiss: () => {
          setStep('select');
          toast('Payment cancelled.', { icon: '⚠️' });
          resolve(null);
        },
      },
      prefill: {
        name: invoice.residentName || '',
        email: '',
        contact: '',
      },
      theme: { color: '#f97316' },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (!isOpen) return null;

  const payModes = [
    { id: 'UPI', label: 'UPI', icon: FaMobileAlt, desc: 'Pay via Google Pay, PhonePe, BHIM' },
    { id: 'CARD', label: 'Debit / Credit Card', icon: FaCreditCard, desc: 'Visa, Mastercard, RuPay' },
    { id: 'NET_BANKING', label: 'Net Banking', icon: FaUniversity, desc: 'All major Indian banks' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Pay Invoice</h2>
              <p className="text-xs text-orange-100 mt-0.5">Secure online payment via Razorpay</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 'success' ? (
            /* Success Screen */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-sm text-gray-500 mb-4">Your payment has been processed and a receipt has been generated.</p>
              {receiptData && (
                <div className="text-left bg-gray-50 rounded-xl p-4 space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Receipt No.</span>
                    <span className="font-semibold text-gray-900">{receiptData.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount Paid</span>
                    <span className="font-semibold text-emerald-600">₹{receiptData.amount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Remaining Balance</span>
                    <span className="font-semibold text-gray-900">₹{receiptData.remainingBalance?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          ) : step === 'processing' ? (
            /* Processing Screen */
            <div className="text-center py-10">
              <FaSpinner className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Processing Payment...</h3>
              <p className="text-sm text-gray-500">Please do not close this window.</p>
            </div>
          ) : (
            /* Select Payment Method Screen */
            <form onSubmit={handlePay}>
              {/* Invoice Summary */}
              {invoice && (
                <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Invoice</span>
                    <span className="font-semibold text-gray-900">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Invoice Total</span>
                    <span className="font-semibold">₹{(invoice.totalAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {fineAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Late Fine</span>
                      <span className="font-semibold text-purple-600">₹{fineAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {invoice.paidAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Already Paid</span>
                      <span className="font-semibold text-emerald-600">₹{(invoice.paidAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base border-t border-gray-200 pt-2">
                    <span className="font-bold text-gray-800">Current Due</span>
                    <span className="font-black text-orange-600 text-lg">₹{remainingBalance.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Amount to Pay (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    className="w-full text-lg font-bold pl-8 pr-4 py-2.5 border-2 border-gray-200 focus:border-orange-400 rounded-xl focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Partial payment supported. Overpayment goes to your Advance Account.
                </p>
              </div>

              {/* Payment Methods */}
              {/* <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-700 mb-2">Payment Method</label>
                <div className="space-y-2">
                  {payModes.map(mode => (
                    <label
                      key={mode.id}
                      className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMode === mode.id ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <input
                        type="radio"
                        name="paymentMode"
                        value={mode.id}
                        checked={paymentMode === mode.id}
                        onChange={() => setPaymentMode(mode.id)}
                        className="accent-orange-500"
                      />
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${paymentMode === mode.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                        <mode.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{mode.label}</div>
                        <div className="text-[11px] text-gray-400">{mode.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div> */}

              {/* Security Note */}
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-5 p-3 bg-gray-50 rounded-xl">
                <FaShieldAlt className="text-emerald-500 flex-shrink-0" />
                <span>Your payment is secured by Razorpay. Card details are never stored in MySocietySuite.</span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Initiating Payment...
                  </>
                ) : (
                  `Proceed to Pay ₹${Number(amount || 0).toLocaleString('en-IN')}`
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
