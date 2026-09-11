import React, { useState, useEffect } from 'react';
import {
  FaTimes, FaCheck, FaSpinner, FaExclamationTriangle, FaInfoCircle,
  FaCheckCircle, FaTimesCircle, FaBuilding, FaArrowRight, FaArrowLeft
} from 'react-icons/fa';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';

const STEPS = ['Billing Cycle', 'Select Flats', 'Calculate', 'Review', 'Generate'];

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const periodLabel = (p) => {
  if (!p) return '—';
  if (p.includes('-Q')) {
    const [y, q] = p.split('-');
    return `${q} ${y}`;
  }
  const [y, m] = p.split('-');
  return new Date(y, Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export const GenerateInvoiceModal = ({ onClose, onSuccess, flats = [] }) => {
  const [step, setStep] = useState(0);
  const [stepData, setStepData] = useState({
    billingDate: new Date().toISOString().slice(0, 7),
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    scope: 'single', // 'single' | 'multiple' | 'all'
    selectedFlatIds: [],
    preview: null,
    previewError: null,
  });
  const [billingConfig, setBillingConfig] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    apiClient.get('/billing/billing-config').then(res => {
      if (res.data?.data) setBillingConfig(res.data.data);
    }).catch(() => { });
  }, []);

  const selectedFlats = flats.filter(f => stepData.selectedFlatIds.includes(f._id));
  const targetFlats = stepData.scope === 'all' ? flats : selectedFlats;

  // Auto-calculate preview whenever entering step 2 (Calculate step)
  useEffect(() => {
    if (step === 2 && targetFlats.length > 0) {
      const firstFlat = targetFlats[0];
      setLoadingPreview(true);
      apiClient.post('/billing/invoices/preview', {
        flatId: firstFlat._id,
        billingDate: stepData.billingDate + '-01',
      })
        .then(res => {
          setStepData(prev => ({ ...prev, preview: res.data?.data, previewError: null }));
        })
        .catch(err => {
          setStepData(prev => ({ ...prev, previewError: err.response?.data?.message || 'Preview failed' }));
        })
        .finally(() => {
          setLoadingPreview(false);
        });
    }
  }, [step, stepData.billingDate, targetFlats[0]?._id]);

  const goNext = () => {
    if (step === 1 && targetFlats.length === 0) return toast.error('Select at least one flat');
    setStep(s => s + 1);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const flatPayloads = targetFlats.map(f => ({
        flatId: f._id,
        residentUserId: f.primaryOwner || f.activeTenant || f._id,
        residentName: f.ownerName || '',
        flatNumber: f.flatNumber || '',
        blockName: f.blockName || '',
        billingDate: stepData.billingDate + '-01',
        invoiceDate: stepData.invoiceDate,
        dueDate: stepData.dueDate || undefined,
      }));

      if (flatPayloads.length === 1) {
        const res = await apiClient.post('/billing/invoices/generate', flatPayloads[0]);
        setResult({ successful: 1, skipped: 0, failed: 0, errors: [], mode: 'single', invoice: res.data?.data });
      } else {
        const res = await apiClient.post('/billing/invoices/bulk-generate', {
          billingDate: stepData.billingDate + '-01',
          invoiceDate: stepData.invoiceDate,
          dueDate: stepData.dueDate || undefined,
          flats: flatPayloads,
        });
        setResult({ ...res.data?.data, mode: 'bulk' });
      }
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const toggleFlat = (id) => {
    setStepData(prev => ({
      ...prev,
      selectedFlatIds: prev.selectedFlatIds.includes(id)
        ? prev.selectedFlatIds.filter(x => x !== id)
        : [...prev.selectedFlatIds, id],
    }));
  };

  const preview = stepData.preview;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Generate Invoice</h3>
            <p className="text-xs text-gray-500 mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
          <button onClick={onClose}><FaTimes className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        {/* Step Progress */}
        <div className="px-6 py-4 border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${i < step ? 'text-emerald-600' : i === step ? 'text-orange-600' : 'text-gray-300'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {i < step ? <FaCheck /> : i + 1}
                  </div>
                  <span className="hidden sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < step ? 'bg-emerald-400' : 'bg-gray-100'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

          {/* Step 0: Billing Cycle */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Billing Period *</label>
                <input
                  type="month"
                  value={stepData.billingDate}
                  onChange={e => setStepData(prev => ({ ...prev, billingDate: e.target.value }))}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Invoice Date</label>
                  <input
                    type="date"
                    value={stepData.invoiceDate}
                    onChange={e => setStepData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Due Date <span className="text-gray-400 normal-case font-normal">(leave blank to auto-calculate)</span>
                  </label>
                  <input
                    type="date"
                    value={stepData.dueDate}
                    onChange={e => setStepData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                  />
                  {billingConfig && !stepData.dueDate && (
                    <p className="text-[11px] text-gray-400 mt-1">Auto: {billingConfig.dueDays || 15} days after invoice date</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Select Flats */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {['single', 'multiple', 'all'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStepData(prev => ({ ...prev, scope: s, selectedFlatIds: [] }))}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${stepData.scope === s ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}
                  >
                    {s === 'all' ? 'Entire Society' : s === 'single' ? 'Single Flat' : 'Multiple Flats'}
                  </button>
                ))}
              </div>

              {stepData.scope === 'all' ? (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 text-center">
                  <div className="text-3xl font-black text-orange-600 mb-1">{flats.length}</div>
                  <div className="text-sm text-gray-600">All eligible flats selected</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{stepData.selectedFlatIds.length} flat(s) selected</span>
                    {stepData.scope === 'multiple' && (
                      <div className="flex gap-2">
                        <button onClick={() => setStepData(prev => ({ ...prev, selectedFlatIds: flats.map(f => f._id) }))} className="text-xs text-orange-600 hover:underline font-semibold">Select All</button>
                        <button onClick={() => setStepData(prev => ({ ...prev, selectedFlatIds: [] }))} className="text-xs text-gray-500 hover:underline font-semibold">Clear All</button>
                      </div>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1.5 custom-scrollbar">
                    {flats.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 text-sm">
                        No flats found. Make sure flats are set up in Society Configuration.
                      </div>
                    ) : (
                      flats.map(flat => (
                        <label key={flat._id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${stepData.selectedFlatIds.includes(flat._id) ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                          <input
                            type={stepData.scope === 'single' ? 'radio' : 'checkbox'}
                            name={stepData.scope === 'single' ? 'singleFlat' : undefined}
                            checked={stepData.selectedFlatIds.includes(flat._id)}
                            onChange={() => {
                              if (stepData.scope === 'single') {
                                setStepData(prev => ({ ...prev, selectedFlatIds: [flat._id] }));
                              } else {
                                toggleFlat(flat._id);
                              }
                            }}
                            className="accent-orange-500 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-gray-900">{flat.flatNumber}</div>
                            <div className="text-xs text-gray-500 truncate">
                              {flat.ownerName || flat.ownerContact || 'No resident assigned'}
                              {flat.occupancyStatus && (
                                <span className={`ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${flat.occupancyStatus === 'Vacant' ? 'bg-gray-100 text-gray-500' :
                                  flat.occupancyStatus === 'Owner Occupied' ? 'bg-blue-50 text-blue-600' :
                                    'bg-amber-50 text-amber-600'
                                  }`}>
                                  {flat.occupancyStatus}
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Calculate */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700 flex gap-2">
                <FaInfoCircle className="shrink-0 mt-0.5" />
                <span>Showing calculation preview for {targetFlats.length > 1 ? `first flat (${targetFlats[0]?.flatNumber})` : `${targetFlats[0]?.flatNumber}`}. All selected flats will use their own applicable charge heads.</span>
              </div>

              {loadingPreview ? (
                <div className="text-center py-12"><FaSpinner className="animate-spin text-orange-500 text-3xl mx-auto mb-3" /><div className="text-sm text-gray-500">Calculating charges...</div></div>
              ) : stepData.previewError ? (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
                  <FaExclamationTriangle className="text-amber-500 text-2xl mx-auto mb-2" />
                  <div className="text-sm font-bold text-amber-700">{stepData.previewError}</div>
                </div>
              ) : preview ? (
                preview.alreadyGenerated ? (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
                    <FaExclamationTriangle className="text-amber-500 text-2xl mx-auto mb-2" />
                    <div className="text-sm font-bold text-amber-700">{preview.message}</div>
                    <div className="text-xs text-gray-500 mt-1">This flat already has an invoice for this period</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(preview.lineItems || []).map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{item.chargeHeadName}</div>
                          <div className="text-xs text-gray-400">{item.calculationType === 'PER_SQ_FT' ? `₹${item.rate} × ${item.quantity} sq.ft` : 'Fixed'}</div>
                        </div>
                        <div className="font-bold text-gray-900">{fmt(item.totalAmount)}</div>
                      </div>
                    ))}

                    <div className="bg-orange-50 rounded-2xl p-4 space-y-2 text-sm mt-3">
                      <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-semibold">{fmt(preview.subTotal)}</span></div>
                      {preview.totalGst > 0 && <div className="flex justify-between"><span className="text-gray-600">GST (CGST {fmt(preview.cgst)} + SGST {fmt(preview.sgst)})</span><span className="font-semibold">{fmt(preview.totalGst)}</span></div>}
                      {preview.arrearsAmount > 0 && <div className="flex justify-between text-amber-700"><span>Previous Arrears</span><span className="font-semibold">{fmt(preview.arrearsAmount)}</span></div>}
                      {preview.fineAmount > 0 && <div className="flex justify-between text-red-600"><span>Fine</span><span className="font-semibold">{fmt(preview.fineAmount)}</span></div>}
                      {preview.discountAmount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span className="font-semibold">-{fmt(preview.discountAmount)}</span></div>}
                      {preview.creditNoteAmount > 0 && <div className="flex justify-between text-emerald-700"><span>Credit Note</span><span className="font-semibold">-{fmt(preview.creditNoteAmount)}</span></div>}
                      <div className="border-t border-orange-200 pt-2 flex justify-between font-black text-gray-900 text-base">
                        <span>Total Payable</span><span>{fmt(preview.totalPayable ?? preview.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                )
              ) : null}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Generation Summary</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-xl p-3"><div className="text-xs text-gray-400">Billing Period</div><div className="font-bold">{periodLabel(stepData.billingDate)}</div></div>
                  <div className="bg-white rounded-xl p-3"><div className="text-xs text-gray-400">Invoice Date</div><div className="font-bold">{fmtDate(stepData.invoiceDate)}</div></div>
                  <div className="bg-white rounded-xl p-3 col-span-2"><div className="text-xs text-gray-400">Flats to Generate</div><div className="font-bold text-orange-600 text-lg">{targetFlats.length} flat{targetFlats.length !== 1 ? 's' : ''}</div></div>
                </div>
              </div>

              {targetFlats.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar">
                  {targetFlats.map(f => (
                    <div key={f._id} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2">
                      <FaBuilding className="text-gray-400 text-xs" />
                      <span className="font-semibold">{f.flatNumber}</span>
                      {f.ownerName && <span className="text-gray-400">— {f.ownerName}</span>}
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700 flex gap-2">
                <FaExclamationTriangle className="shrink-0 mt-0.5" />
                <span>Once generated, invoices will be sent to residents. Flats with existing invoices for this period will be skipped automatically.</span>
              </div>
            </div>
          )}

          {/* Step 4: Result */}
          {step === 4 && result && (
            <div className="space-y-4 text-center">
              {result.failed === 0 ? (
                <FaCheckCircle className="text-emerald-500 text-5xl mx-auto" />
              ) : (
                <FaTimesCircle className="text-amber-500 text-5xl mx-auto" />
              )}
              <h4 className="text-lg font-bold text-gray-900">
                {result.mode === 'single' ? 'Invoice Generated!' : 'Bulk Generation Complete'}
              </h4>
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                <div className="bg-emerald-50 rounded-2xl p-3"><div className="text-2xl font-black text-emerald-600">{result.successful}</div><div className="text-xs text-gray-500">Generated</div></div>
                <div className="bg-amber-50 rounded-2xl p-3"><div className="text-2xl font-black text-amber-600">{result.skipped}</div><div className="text-xs text-gray-500">Skipped</div></div>
                <div className="bg-red-50 rounded-2xl p-3"><div className="text-2xl font-black text-red-600">{result.failed}</div><div className="text-xs text-gray-500">Failed</div></div>
              </div>
              {result.errors?.length > 0 && (
                <div className="text-left max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar mt-2">
                  {result.errors.map((e, i) => (
                    <div key={i} className="bg-red-50 rounded-xl px-3 py-2 text-xs text-red-700">
                      <span className="font-bold">{e.flatNumber || e.flatId}:</span> {e.reason}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center shrink-0">
          {step === 4 ? (
            <>
              <div />
              <button
                onClick={() => { onSuccess(); onClose(); }}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                View Invoices <FaArrowRight />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl flex items-center gap-2"
              >
                <FaArrowLeft className="text-xs" /> {step === 0 ? 'Cancel' : 'Back'}
              </button>
              {step === 3 ? (
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {generating ? <><FaSpinner className="animate-spin" /> Generating...</> : <><FaCheck /> Confirm & Generate</>}
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  Next <FaArrowRight className="text-xs" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateInvoiceModal;
