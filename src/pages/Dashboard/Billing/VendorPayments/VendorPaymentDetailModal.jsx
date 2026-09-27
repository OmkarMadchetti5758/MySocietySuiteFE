import { useState, useEffect, useCallback } from 'react';
import {
  FaTimes, FaCheckCircle, FaTimesCircle, FaClock,
  FaMoneyCheckAlt, FaSpinner
} from 'react-icons/fa';
import vendorPaymentApi from '../../../../services/vendorPaymentApi';
import toast from 'react-hot-toast';

const STATUS_BADGES = {
  pending_approval: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'Pending Approval',
    icon: FaClock,
  },
  approved: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    label: 'Approved (Ready to Pay)',
    icon: FaCheckCircle,
  },
  paid: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'Paid / Disbursed',
    icon: FaCheckCircle,
  },
  rejected: {
    bg: 'bg-red-50 text-red-700 border-red-200',
    label: 'Rejected',
    icon: FaTimesCircle,
  },
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 font-medium">{label}</span>
    <span className="text-xs font-semibold text-gray-800 text-right max-w-[65%] break-words">
      {value || '—'}
    </span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-4">
    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>
    <div className="bg-white rounded-2xl border border-gray-100 px-4 py-1">{children}</div>
  </div>
);

export default function VendorPaymentDetailModal({
  isOpen,
  onClose,
  paymentId,
  canApprove = false,
  canMarkPaid = false,
  onApproveClick,
  onRejectClick,
  onMarkPaidClick,
}) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDetails = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await vendorPaymentApi.getVendorPaymentById(id);
      setPayment(res.data?.data || null);
    } catch {
      toast.error('Failed to load payment details.');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen && paymentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDetails(paymentId);
    }
  }, [isOpen, paymentId, fetchDetails]);

  if (!isOpen) return null;

  const formatINR = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;
  const formatDate = (d) =>
    d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  const statusConfig = (payment && STATUS_BADGES[String(payment.status).toLowerCase()]) || {
    bg: 'bg-gray-100 text-gray-600 border-gray-200',
    label: payment?.status || 'Unknown',
    icon: FaClock,
  };
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-50 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-gray-900">Vendor Payment Details</h3>
            <p className="text-xs text-gray-400 font-mono">{payment?.paymentNumber || 'Loading...'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
              <FaSpinner className="animate-spin text-3xl text-orange-500" />
              <p className="text-xs">Loading payment details...</p>
            </div>
          ) : payment ? (
            <>
              {/* Amount Hero Card */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-5 text-white shadow-lg shadow-orange-500/10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-orange-100 font-medium mb-1">Disbursal Amount</p>
                    <p className="text-3xl font-black tracking-tight">{formatINR(payment.amount)}</p>
                    <p className="text-xs text-orange-100 mt-1 capitalize font-medium">
                      Mode: {payment.paymentMode?.replace('_', ' ')}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg}`}
                  >
                    <StatusIcon className="text-xs" />
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Vendor & Invoice Information */}
              <Section title="Vendor & Bill Details">
                <InfoRow label="Vendor Name" value={payment.vendorName} />
                <InfoRow label="Bill / Invoice Ref" value={payment.billReference} />
                {payment.workOrderId && <InfoRow label="Work Order ID" value={payment.workOrderId} />}
                {payment.purchaseId && <InfoRow label="Purchase ID" value={payment.purchaseId} />}
                <InfoRow label="Description" value={payment.description} />
              </Section>

              {/* Workflow Details */}
              <Section title="Workflow & History">
                <InfoRow label="Approval Required" value={payment.approvalRequired ? 'Yes (Above Threshold)' : 'No (Auto-approved)'} />
                <InfoRow label="Requested Date" value={formatDate(payment.createdAt)} />

                {/* Approved state */}
                {payment.approvedAt && (
                  <>
                    <InfoRow label="Approved Date" value={formatDate(payment.approvedAt)} />
                    {payment.approvalComment && (
                      <InfoRow label="Approval Comments" value={payment.approvalComment} />
                    )}
                  </>
                )}

                {/* Rejected state */}
                {payment.rejectedAt && (
                  <>
                    <InfoRow label="Rejected Date" value={formatDate(payment.rejectedAt)} />
                    {payment.rejectionComment && (
                      <InfoRow label="Rejection Reason" value={payment.rejectionComment} />
                    )}
                  </>
                )}

                {/* Paid state */}
                {payment.paidAt && (
                  <>
                    <InfoRow label="Paid / Disbursed Date" value={formatDate(payment.paidAt)} />
                    {payment.financialAccountId && (
                      <InfoRow
                        label="Paying Account"
                        value={
                          typeof payment.financialAccountId === 'object'
                            ? payment.financialAccountId.accountName
                            : 'Linked Account'
                        }
                      />
                    )}
                  </>
                )}
              </Section>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        {payment && (
          <div className="bg-white px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              Close
            </button>

            <div className="flex items-center gap-2">
              {/* Approve / Reject actions for pending_approval */}
              {String(payment.status).toLowerCase() === 'pending_approval' && canApprove && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      if (onRejectClick) onRejectClick(payment);
                    }}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      if (onApproveClick) onApproveClick(payment);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                  >
                    Approve
                  </button>
                </>
              )}

              {/* Mark Paid action for approved */}
              {String(payment.status).toLowerCase() === 'approved' && canMarkPaid && (
                <button
                  onClick={() => {
                    onClose();
                    if (onMarkPaidClick) onMarkPaidClick(payment);
                  }}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5"
                >
                  <FaMoneyCheckAlt /> Mark as Paid
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
