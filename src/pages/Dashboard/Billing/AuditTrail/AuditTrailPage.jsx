import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaFilter, FaSpinner, FaEye, FaTimes, FaHistory } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

const AuditTrailPage = ({ onBack }) => {
  const [allLogs, setAllLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [userFilter, setUserFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [usersList, setUsersList] = useState([]);
  const [typesList, setTypesList] = useState([]);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedAudit, setSelectedAudit] = useState(null);

  useEffect(() => {
    const fetchUsersAndTypes = async () => {
      try {
        const [usersRes, typesRes] = await Promise.all([
          apiClient.get('/users'),
          apiClient.get('/billing/audit-logs/transaction-types')
        ]);
        if (usersRes.data?.data) {
          const uList = Array.isArray(usersRes.data.data) ? usersRes.data.data : usersRes.data.data.users || [];
          setUsersList(uList);
        }
        if (typesRes.data?.data) {
          setTypesList(typesRes.data.data.filter(Boolean));
        }
      } catch (err) {
        console.error('Could not fetch filters', err);
      }
    };
    fetchUsersAndTypes();
  }, []);

  const fetchAuditLogsWithParams = async (p, u, t, s, e) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (p) params.append('page', p);
      params.append('limit', 20);
      if (u) params.append('userId', u);
      if (t) params.append('transactionType', t);
      if (s) params.append('fromDate', s);
      if (e) params.append('toDate', e);
      
      const res = await apiClient.get(`/billing/audit-logs?${params.toString()}`);
      const rawData = res.data?.data?.data || res.data?.data || [];
      const pagination = res.data?.data?.pagination;
      
      setAuditLogs(rawData);
      if (pagination && pagination.totalPages) {
        setTotalPages(pagination.totalPages);
      } else {
        setTotalPages(1);
      }
    } catch (err) {
      toast.error('Unable to load audit records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogsWithParams(page, userFilter, typeFilter, startDate, endDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleApplyFilters = () => {
    if (page === 1) {
      fetchAuditLogsWithParams(1, userFilter, typeFilter, startDate, endDate);
    } else {
      setPage(1); // changing page will trigger useEffect
    }
  };

  const handleReset = () => {
    setUserFilter('');
    setTypeFilter('');
    setStartDate('');
    setEndDate('');
    if (page === 1) {
      fetchAuditLogsWithParams(1, '', '', '', '');
    } else {
      setPage(1); // changing page will trigger useEffect and fetch
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="animate-fade-in-up pb-12 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
            <p className="text-sm text-gray-500">View all financial transactions and configuration changes</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">User</label>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="">All Users</option>
              {usersList.map(u => (
                <option key={u._id} value={u._id}>{u.firstName} {u.lastName} {u.name ? u.name : ''}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Transaction Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="">All Transaction Types</option>
              {typesList.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/5">
            <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          
          <div className="w-full md:w-1/5">
            <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
            >
              Apply Filters
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-hidden">
          <table className="w-full text-left border-collapse break-words">
            <thead className="bg-gray-50/90 border-b border-gray-200">
              <tr className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                <th className="py-4 px-6 w-1/6">Date & Time</th>
                <th className="py-4 px-6 w-1/6">User</th>
                <th className="py-4 px-6 w-1/12">Role</th>
                <th className="py-4 px-6 w-1/6">Resource Name</th>
                <th className="py-4 px-6 w-1/6">Action Type</th>
                <th className="py-4 px-6 w-1/6">Resource ID</th>
                <th className="py-4 px-6 w-1/12 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-gray-500">
                    <FaSpinner className="animate-spin text-3xl mx-auto mb-3 text-orange-500" />
                    Loading audit records...
                  </td>
                </tr>
              ) : auditLogs.length > 0 ? (
                auditLogs.map((log, index) => (
                  <tr key={String(log._id || index)} className="hover:bg-orange-50/30 transition-colors text-sm">
                    <td className="py-3 px-6 whitespace-nowrap text-gray-700 text-xs font-medium">
                      {formatDate(log.createdAt || log.timestamp)}
                    </td>
                    <td className="py-3 px-6 font-semibold text-gray-800">
                      {log.userId?.firstName || log.userId?.name || log.user?.firstName || log.userName || 'System'} {log.userId?.lastName || log.user?.lastName || ''}
                    </td>
                    <td className="py-3 px-6 text-gray-600">
                      <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase">
                        {log.role || log.userRole || log.userId?.role || log.user?.role || 'System'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-gray-800 font-medium break-all">
                      {String(log.entityType || log.transactionType || log.resource || '-').replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()}
                    </td>
                    <td className="py-3 px-6 text-gray-800 break-all">
                      {String(log.action || '-')}
                    </td>
                    <td className="py-3 px-6 text-gray-600 font-mono text-xs break-all">
                      {String(log.entityId || log.resourceId || log.targetId || '-')}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button
                        onClick={async () => {
                          try {
                            const res = await apiClient.get(`/billing/audit-logs/${log._id || log.id}`);
                            setSelectedAudit(res.data?.data || res.data || log);
                          } catch(err) {
                            setSelectedAudit(log); // fallback to row data if API fails
                          }
                        }}
                        className="text-orange-500 hover:text-orange-600 font-semibold text-xs flex items-center justify-end gap-1 w-full"
                      >
                        <FaEye /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-gray-500">
                    <FaHistory className="text-4xl text-gray-200 mx-auto mb-3" />
                    {userFilter || typeFilter || startDate || endDate
                      ? 'No audit records found for the selected filters.'
                      : 'No audit records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Audit Details</h3>
                <p className="text-xs text-gray-500">Read-only view of transaction history</p>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors border border-gray-200 shadow-sm"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="text-xs text-gray-500 font-semibold mb-1">Date & Time</div>
                  <div className="text-sm font-medium text-gray-900">{formatDate(selectedAudit.createdAt || selectedAudit.timestamp)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-semibold mb-1">User</div>
                  <div className="text-sm font-medium text-gray-900">
                    {selectedAudit.userId?.firstName || selectedAudit.user?.firstName || 'System'} {selectedAudit.userId?.lastName || selectedAudit.user?.lastName || ''}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-semibold mb-1">Role</div>
                  <div className="text-sm font-medium text-gray-900 uppercase">
                    {selectedAudit.role || selectedAudit.userRole || selectedAudit.userId?.role || selectedAudit.user?.role || 'System'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-semibold mb-1">Resource Name</div>
                  <div className="text-sm font-medium text-gray-900">{String(selectedAudit.entityType || selectedAudit.transactionType || selectedAudit.resource || '-').replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-semibold mb-1">Action Type</div>
                  <div className="text-sm font-medium text-gray-900">{String(selectedAudit.action || '-')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-semibold mb-1">Resource ID</div>
                  <div className="text-sm font-medium text-gray-900">{String(selectedAudit.entityId || selectedAudit.resourceId || selectedAudit.targetId || '-')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-semibold mb-1">Module</div>
                  <div className="text-sm font-medium text-gray-900">{String(selectedAudit.module || '-')}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-gray-500 font-semibold mb-1">Metadata / Description</div>
                  <div className="text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {selectedAudit.description ? String(selectedAudit.description) : (selectedAudit.details && typeof selectedAudit.details === 'object' ? JSON.stringify(selectedAudit.details) : String(selectedAudit.details || '-'))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-sm font-bold text-gray-700">Before</div>
                  <div className="p-4 bg-white">
                    {selectedAudit.beforeValue != null && selectedAudit.beforeValue !== '' ? (
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono overflow-x-auto">
                        {typeof selectedAudit.beforeValue === 'object' 
                          ? JSON.stringify(selectedAudit.beforeValue, null, 2) 
                          : String(selectedAudit.beforeValue)}
                      </pre>
                    ) : (
                      <div className="text-sm text-gray-400 italic">No previous value</div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="bg-orange-50 px-4 py-2 border-b border-orange-100 text-sm font-bold text-orange-700">After</div>
                  <div className="p-4 bg-white">
                    {selectedAudit.afterValue != null && selectedAudit.afterValue !== '' ? (
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono overflow-x-auto">
                        {typeof selectedAudit.afterValue === 'object' 
                          ? JSON.stringify(selectedAudit.afterValue, null, 2) 
                          : String(selectedAudit.afterValue)}
                      </pre>
                    ) : (
                      <div className="text-sm text-gray-400 italic">No after value</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setSelectedAudit(null)}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrailPage;
