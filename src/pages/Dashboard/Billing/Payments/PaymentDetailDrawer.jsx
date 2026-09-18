import { FaTimes, FaRupeeSign, FaReceipt, FaCheckCircle, FaClock, FaTimesCircle, FaExchangeAlt } from 'react-icons/fa';

const STATUS_COLORS = {
  SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  INITIATED: 'bg-blue-50 text-blue-700 border-blue-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
  REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200',
};

const RECON_COLORS = {
  RECONCILED: 'bg-emerald-50 text-emerald-600',
  UNRECONCILED: 'bg-gray-100 text-gray-500',
  MATCH_FAILED: 'bg-red-50 text-red-600',
  MANUAL_REVIEW: 'bg-amber-50 text-amber-600',
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-2.5 border-b border-gray-50">
    <span className="text-xs text-gray-400 font-medium">{label}</span>
    <span className="text-xs font-semibold text-gray-800 text-right max-w-xs break-words">{value || '—'}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-5">
    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>
    <div className="bg-white rounded-xl border border-gray-100 px-4">{children}</div>
  </div>
);

export default function PaymentDetailDrawer({ payment, onClose }) {
  if (!payment) return null;

  const formatINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
  const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-md bg-gray-50 shadow-2xl flex flex-col h-full overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-gray-900 text-base">Payment Details</h2>
            <p className="text-xs text-gray-400 font-mono">{payment.paymentNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Amount Hero */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 mb-5 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-orange-100 mb-1">Amount Paid</p>
                <p className="text-3xl font-black">{formatINR(payment.amount)}</p>
                {payment.excessAmount > 0 && (
                  <p className="text-xs text-orange-200 mt-1">+ {formatINR(payment.excessAmount)} → Advance Account</p>
                )}
              </div>
              <div className="text-right">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${STATUS_COLORS[payment.paymentStatus] || 'bg-white/20 text-white border-white/30'}`}>
                  {payment.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <Section title="Payment Information">
            <InfoRow label="Payment Number" value={payment.paymentNumber} />
            <InfoRow label="Payment Date" value={formatDate(payment.paymentDate)} />
            <InfoRow label="Payment Mode" value={payment.paymentMode} />
            <InfoRow label="Payment Source" value={payment.paymentSource} />
            <InfoRow label="Payment Account" value={payment.paymentAccountName} />
            {payment.transactionReference && (
              <InfoRow label="Reference No." value={payment.transactionReference} />
            )}
            {payment.gatewayTransactionId && (
              <InfoRow label="Gateway Txn ID" value={payment.gatewayTransactionId} />
            )}
            {payment.gatewayOrderId && (
              <InfoRow label="Gateway Order ID" value={payment.gatewayOrderId} />
            )}
            {payment.failureReason && (
              <InfoRow label="Failure Reason" value={payment.failureReason} />
            )}
            {payment.notes && (
              <InfoRow label="Notes" value={payment.notes} />
            )}
          </Section>

          {/* Invoice Information */}
          {payment.invoiceId && (
            <Section title="Invoice Information">
              <InfoRow label="Invoice No." value={payment.invoiceId?.invoiceNumber || payment.invoiceId} />
              <InfoRow label="Invoice Total" value={formatINR(payment.invoiceId?.totalAmount)} />
              <InfoRow label="Paid Amount" value={formatINR(payment.invoiceId?.paidAmount)} />
              <InfoRow label="Invoice Status" value={payment.invoiceId?.status} />
            </Section>
          )}

          {/* Resident / Flat Information */}
          <Section title="Resident Information">
            <InfoRow label="Flat" value={
              payment.flatId
                ? `${payment.flatId.blockName || payment.flatId.wingName || ''} - ${payment.flatId.flatNumber || ''}`.replace(/^[\s\-]+/, '') || '—'
                : '—'
            } />
            <InfoRow label="Resident" value={
              payment.userId?.name || 
              (payment.userId?.firstName ? `${payment.userId.firstName} ${payment.userId.lastName || ''}`.trim() : null) || 
              payment.invoiceId?.residentName || 
              payment.flatId?.tenantName || 
              payment.flatId?.ownerName || 
              '—'
            } />
            <InfoRow label="Contact" value={
              payment.userId?.phone || 
              payment.userId?.email || 
              payment.invoiceId?.residentPhone || 
              payment.invoiceId?.residentEmail || 
              payment.flatId?.ownerPhone || 
              payment.flatId?.tenantPhone || 
              '—'
            } />
          </Section>

          {/* Reconciliation */}
          <Section title="Reconciliation">
            <InfoRow label="Reconciliation Status" value={
              <span className={`text-[11px] px-2 py-1 rounded-lg font-semibold ${RECON_COLORS[payment.reconciliationStatus] || 'bg-gray-100 text-gray-500'}`}>
                {payment.reconciliationStatus?.replace('_', ' ') || '—'}
              </span>
            } />
          </Section>

          {/* Receipt */}
          {payment.receiptNumber && (
            <Section title="Receipt">
              <InfoRow label="Receipt Number" value={payment.receiptNumber} />
            </Section>
          )}

          {/* Cheque Details */}
          {payment.chequeDetails?.chequeNumber && (
            <Section title="Cheque Details">
              <InfoRow label="Cheque Number" value={payment.chequeDetails.chequeNumber} />
              <InfoRow label="Bank Name" value={payment.chequeDetails.bankName} />
              <InfoRow label="Cheque Date" value={payment.chequeDetails.chequeDate ? new Date(payment.chequeDetails.chequeDate).toLocaleDateString('en-IN') : '—'} />
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
