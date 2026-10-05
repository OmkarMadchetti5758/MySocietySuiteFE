import React, { useState, useEffect } from 'react';
import { getGSTReport, streamExportDownload } from '../../../../services/reportsApi';
import toast from 'react-hot-toast';
import { FaDownload, FaSpinner } from 'react-icons/fa';

const GstReportPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const defaultFrom = new Date(currentMonth < 3 ? currentYear - 1 : currentYear, 3, 1).toISOString().split('T')[0];
  const defaultTo = new Date().toISOString().split('T')[0];
  
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [from, to]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getGSTReport(from, to);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load GST report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await streamExportDownload(
        'GST',
        format,
        { from, to },
        `gst_report.${format.toLowerCase()}`
      );
      toast.success(`${format} downloaded!`);
    } catch (err) {
      console.error('Export failed', err);
      toast.error(err.message || 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-4xl text-orange-500" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">GST Report</h2>
          <p className="text-sm text-gray-500">Period: {data?.period?.from} to {data?.period?.to} (Split: {data?.gstSplit})</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
             <input 
                type="date" 
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-gray-400">to</span>
              <input 
                type="date" 
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
          </div>
          <button 
            onClick={() => handleExport('EXCEL')}
            disabled={exporting}
            className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors"
          >
            {exporting ? <FaSpinner className="animate-spin" /> : <FaDownload />} Excel
          </button>
        </div>
      </div>

      {data && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Charge Head</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3 text-center">Rate</th>
                <th className="px-4 py-3 text-center">Invoices</th>
                <th className="px-4 py-3 text-right text-gray-900">Taxable Value</th>
                <th className="px-4 py-3 text-right text-orange-600">GST Collected</th>
                {data.gstSplit === 'CGST_SGST' ? (
                  <>
                    <th className="px-4 py-3 text-right text-amber-600">CGST</th>
                    <th className="px-4 py-3 text-right text-amber-600">SGST</th>
                  </>
                ) : (
                  <th className="px-4 py-3 text-right text-amber-600">IGST</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.rows?.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.chargeHeadName}</td>
                  <td className="px-4 py-3 text-gray-600">{row.chargeHeadCode}</td>
                  <td className="px-4 py-3 text-center">{row.gstRate}%</td>
                  <td className="px-4 py-3 text-center">{row.invoiceCount}</td>
                  <td className="px-4 py-3 text-right font-medium">{row.taxableValue}</td>
                  <td className="px-4 py-3 text-right font-bold text-orange-500">{row.gstCollected}</td>
                  {data.gstSplit === 'CGST_SGST' ? (
                    <>
                      <td className="px-4 py-3 text-right text-gray-500">{row.cgst}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{row.sgst}</td>
                    </>
                  ) : (
                    <td className="px-4 py-3 text-right text-gray-500">{row.igst}</td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold text-gray-900 border-t-2 border-gray-200">
              <tr>
                <td className="px-4 py-3" colSpan="4">TOTAL FROM INVOICES</td>
                <td className="px-4 py-3 text-right text-gray-900">{data.totals?.taxableValue}</td>
                <td className="px-4 py-3 text-right text-orange-600">{data.totals?.gstCollected}</td>
                <td colSpan={data.gstSplit === 'CGST_SGST' ? 2 : 1}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {data && (
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-500 mb-2">Credit Note Reductions</h4>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Taxable Reduction:</span>
              <span className="font-semibold">{data.creditNoteReductions?.taxableValueReduction}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">GST Reduction:</span>
              <span className="font-semibold text-red-500">-{data.creditNoteReductions?.gstReduction}</span>
            </div>
          </div>
          
          <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-500 mb-2">Input Tax Credit (ITC)</h4>
            <div className="flex justify-between items-center h-full pb-3">
              <span className="text-sm">GST Paid on Expenses:</span>
              <span className="font-semibold text-green-600">{data.gstOnExpenses?.inputTaxPaid}</span>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col justify-center shadow-inner">
            <h4 className="text-sm font-bold text-orange-800 mb-2 uppercase tracking-wide">Net GST Payable</h4>
            <div className="text-2xl font-black text-orange-600">
              {data.totals?.netGstPayable}
            </div>
          </div>
        </div>
      )}

      {/* Reconciliation Section */}
      {data?.reconciliation && (
        <div className="mt-6 bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex justify-between items-center text-sm">
          <div>
            <span className="font-semibold text-blue-800">Ledger Reconciliation: </span>
            <span className="text-blue-600">GST Payable Ledger Credits = {data.reconciliation.ledgerGstPayable}</span>
          </div>
          <div>
            <span className="text-gray-500 mr-2">Delta (vs Collected):</span>
            <span className={`font-bold ${data.reconciliation.delta === '0.00' ? 'text-green-600' : 'text-red-600'}`}>
              {data.reconciliation.delta}
            </span>
          </div>
        </div>
      )}

    </div>
  );
};

export default GstReportPage;
