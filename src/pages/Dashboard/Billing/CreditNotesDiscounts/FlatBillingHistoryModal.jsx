import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaHistory, FaFileInvoice, FaPercent, FaMoneyBillWave, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

const formatINR = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

export default function FlatBillingHistoryModal({ isOpen, onClose, flatId, flatName }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'credit_notes' | 'discounts' | 'invoices'

  useEffect(() => {
    if (!isOpen || !flatId) return;

    setLoading(true);
    apiClient.get(`/billing/flats/${flatId}/billing-history`)
      .then(res => {
        setData(res.data?.data || null);
      })
      .catch(err => {
        console.error('Failed to load flat billing history:', err);
        toast.error('Failed to load billing history for this flat');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, flatId]);

  if (!isOpen) return null;

  const creditNotes = data?.creditNotes || [];
  const discounts = data?.discounts || [];
  const invoices = data?.invoices || [];
  const payments = data?.payments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-100 flex flex-col max-h-[88vh] animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-xl">
              <FaHistory />
            </div>
            <div>
              <h3 className="text-lg font-bold">Flat Billing History</h3>
              <p className="text-xs text-gray-300">
                FR-B6.4: Full record of credit notes, discounts, and invoices with attached reasons for {flatName || `Flat #${flatId}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Filter subtabs */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'all' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              All Records
            </button>
            <button
              onClick={() => setActiveTab('credit_notes')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'credit_notes' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Credit Notes ({creditNotes.length})
            </button>
            <button
              onClick={() => setActiveTab('discounts')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'discounts' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Discounts ({discounts.length})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'invoices' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Invoices ({invoices.length})
            </button>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Total CN: <strong className="text-amber-600 font-bold">{creditNotes.length}</strong> | Discounts: <strong className="text-blue-600 font-bold">{discounts.length}</strong>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-orange-500" />
              Loading flat billing history...
            </div>
          ) : (
            <>
              {/* SECTION: CREDIT NOTES (FR-B6.4 with reason attached) */}
              {(activeTab === 'all' || activeTab === 'credit_notes') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Credit Notes (Past Invoice Reductions)
                  </div>
                  {creditNotes.length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-400 text-center border border-dashed border-gray-200">
                      No credit notes on record for this flat.
                    </div>
                  ) : (
                    creditNotes.map((cn) => (
                      <div key={cn._id} className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/70 hover:shadow-sm transition-all space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-900 text-sm">{cn.noteNumber}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cn.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                cn.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                                  'bg-amber-100 text-amber-800 border-amber-300'
                              }`}>
                              {cn.status?.toUpperCase()}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-base text-amber-700">
                            -{formatINR(cn.amount)}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>Target Invoice: <strong>{cn.invoiceId?.invoiceNumber || 'Prior Bill Adjustment'}</strong> {cn.invoiceId?.billingPeriod ? `(${cn.invoiceId.billingPeriod})` : '(Direct Account Credit)'}</span>
                          <span>Date: {formatDate(cn.createdAt)}</span>
                          {cn.approvedBy && <span>Approved by: {cn.approvedBy.name}</span>}
                        </div>

                        {/* FR-B6.4: Reason mandatory attached */}
                        <div className="p-2.5 bg-white rounded-xl border border-amber-100 text-xs text-gray-800">
                          <span className="font-bold text-gray-500">Reason Attached: </span>
                          <span className="italic font-medium">"{cn.reason}"</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* SECTION: DISCOUNTS (FR-B6.4 with reason attached) */}
              {(activeTab === 'all' || activeTab === 'discounts') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    Discounts (Upcoming Invoice Reductions)
                  </div>
                  {discounts.length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-400 text-center border border-dashed border-gray-200">
                      No discounts on record for this flat.
                    </div>
                  ) : (
                    discounts.map((disc) => (
                      <div key={disc._id} className="p-4 bg-blue-50/40 rounded-2xl border border-blue-200/70 hover:shadow-sm transition-all space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-900 text-sm">{disc.discountCode}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${disc.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                disc.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                                  'bg-amber-100 text-amber-800 border-amber-300'
                              }`}>
                              {disc.status?.toUpperCase()}
                            </span>
                            {disc.isApplied && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                                Applied to {disc.appliedInvoiceId?.invoiceNumber || 'Invoice'}
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-base text-blue-700">
                            -{formatINR(disc.amount)}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>Target: <strong>{disc.chargeHeadId?.name || 'Entire Upcoming Bill'}</strong></span>
                          <span>Date: {formatDate(disc.createdAt)}</span>
                          {disc.approvedBy && <span>Approved by: {disc.approvedBy.name}</span>}
                        </div>

                        {/* FR-B6.4: Reason mandatory attached */}
                        <div className="p-2.5 bg-white rounded-xl border border-blue-100 text-xs text-gray-800">
                          <span className="font-bold text-gray-500">Reason Attached: </span>
                          <span className="italic font-medium">"{disc.reason}"</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* SECTION: INVOICES & RECENT BILLING */}
              {(activeTab === 'all' || activeTab === 'invoices') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-600"></span>
                    Issued Invoices & Payable Status
                  </div>
                  {invoices.length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-400 text-center border border-dashed border-gray-200">
                      No invoices found for this flat.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
                            <th className="py-2.5 px-3 font-semibold">Invoice No</th>
                            <th className="py-2.5 px-3 font-semibold">Period</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Subtotal</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Credit Note</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Discount</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Total Payable</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Paid</th>
                            <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.map((inv) => (
                            <tr key={inv._id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-2.5 px-3 font-bold text-gray-900">{inv.invoiceNumber}</td>
                              <td className="py-2.5 px-3 text-gray-600">{inv.billingPeriod}</td>
                              <td className="py-2.5 px-3 text-right">{formatINR(inv.subTotal)}</td>
                              <td className="py-2.5 px-3 text-right font-medium text-amber-600">
                                {inv.creditNoteAmount > 0 ? `-${formatINR(inv.creditNoteAmount)}` : '-'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-medium text-blue-600">
                                {inv.discountAmount > 0 ? `-${formatINR(inv.discountAmount)}` : '-'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-gray-900">{formatINR(inv.totalAmount)}</td>
                              <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">{formatINR(inv.paidAmount)}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                                    inv.status === 'PARTIALLY_PAID' ? 'bg-blue-100 text-blue-800' :
                                      'bg-amber-100 text-amber-800'
                                  }`}>
                                  {inv.status}
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
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}
