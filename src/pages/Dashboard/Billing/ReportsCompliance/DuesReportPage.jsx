import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDuesAgeing, streamExportDownload } from '../../../../services/reportsApi';
import toast from 'react-hot-toast';
import { FaDownload, FaSpinner } from 'react-icons/fa';

const DuesReportPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [asOf]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // API response: { status, data: rows[], meta: { totals, asOf, reconciliation, ... } }
      const res = await getDuesAgeing(asOf, {}, 1, 100);
      // Normalise into a single object the template can use
      setData({
        rows:           res.data   || [],
        totals:         res.meta?.totals,
        reconciliation: res.meta?.reconciliation,
        asOf:           res.meta?.asOf,
        ageingBasis:    res.meta?.ageingBasis,
        generatedAt:    res.meta?.generatedAt,
      });
    } catch (err) {
      console.error('Failed to load dues report', err);
      setError('Failed to load dues report');
      toast.error('Failed to load dues report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await streamExportDownload(
        'DUES_AGEING',
        format,
        { asOf },
        `dues_ageing.${format.toLowerCase()}`
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
  if (error) return <div className="flex justify-center py-20 text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dues & Ageing Report</h2>
          <p className="text-sm text-gray-500">As of: {data?.asOf}</p>
        </div>
        <div className="flex gap-4 items-center">
          <input 
            type="date" 
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
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
                <th className="px-4 py-3">Flat</th>
                <th className="px-4 py-3">Resident</th>
                <th className="px-4 py-3 text-right">Principal</th>
                <th className="px-4 py-3 text-right">Fines</th>
                <th className="px-4 py-3 text-right text-orange-600">Total Outstanding</th>
                <th className="px-4 py-3 text-right">Current</th>
                <th className="px-4 py-3 text-right">0-30 Days</th>
                <th className="px-4 py-3 text-right">31-60 Days</th>
                <th className="px-4 py-3 text-right">61-90 Days</th>
                <th className="px-4 py-3 text-right text-red-500">90+ Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.rows?.map((row) => (
                <tr key={row.flatId} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.flatNumber} {row.blockName ? `(${row.blockName})` : ''}</td>
                  <td className="px-4 py-3 text-gray-600">{row.residentName}</td>
                  <td className="px-4 py-3 text-right">{row.outstanding?.principal}</td>
                  <td className="px-4 py-3 text-right text-orange-500">{row.outstanding?.fines}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{row.outstanding?.total}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{row.buckets?.current}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{row.buckets['0_30']}</td>
                  <td className="px-4 py-3 text-right text-amber-600">{row.buckets['31_60']}</td>
                  <td className="px-4 py-3 text-right text-red-500">{row.buckets['61_90']}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">{row.buckets['90_plus']}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold text-gray-900 border-t-2 border-gray-200">
              <tr>
                <td className="px-4 py-3" colSpan="2">TOTAL</td>
                <td className="px-4 py-3 text-right">{data.totals?.principal}</td>
                <td className="px-4 py-3 text-right text-orange-500">{data.totals?.fines}</td>
                <td className="px-4 py-3 text-right text-gray-900">{data.totals?.outstanding}</td>
                <td className="px-4 py-3 text-right">{data.totals?.buckets?.current}</td>
                <td className="px-4 py-3 text-right">{data.totals?.buckets['0_30']}</td>
                <td className="px-4 py-3 text-right text-amber-600">{data.totals?.buckets['31_60']}</td>
                <td className="px-4 py-3 text-right text-red-500">{data.totals?.buckets['61_90']}</td>
                <td className="px-4 py-3 text-right text-red-600">{data.totals?.buckets['90_plus']}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Reconciliation Section */}
      {data?.reconciliation && (
        <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex justify-between items-center text-sm">
          <div>
            <span className="font-semibold text-blue-800">Ledger Reconciliation: </span>
            <span className="text-blue-600">Accounts Receivable Balance = {data.reconciliation.ledgerMembersReceivable}</span>
          </div>
          <div>
            <span className="text-gray-500 mr-2">Delta:</span>
            <span className={`font-bold ${data.reconciliation.delta === '0.00' ? 'text-green-600' : 'text-red-600'}`}>
              {data.reconciliation.delta}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuesReportPage;
