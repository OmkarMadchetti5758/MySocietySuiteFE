import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../../context/PermissionsContext';
import complaintApi from '../../../services/complaintApi';
import { toast } from 'react-toastify';
import { FaPlus, FaFilter, FaSync, FaExclamationCircle } from 'react-icons/fa';
import ComplaintList from './components/ComplaintList';
import ComplaintDetailsModal from './components/ComplaintDetailsModal';
import CreateComplaintModal from './components/CreateComplaintModal';
import AssignComplaintModal from './components/AssignComplaintModal';
import ResolveComplaintModal from './components/ResolveComplaintModal';
import ReopenComplaintModal from './components/ReopenComplaintModal';
import HelpdeskDashboard from './components/HelpdeskDashboard';

const HelpdeskPage = () => {
  const { hasModuleAccess } = usePermissions();
  const isAdminOrManager = hasModuleAccess('complaints_helpdesk', 'MANAGE'); // Adjust as per your exact logic if needed

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'dashboard'
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  
  // Actions Modals
  const [actionModal, setActionModal] = useState({ type: null, complaint: null }); // type: 'details' | 'assign' | 'resolve' | 'reopen'

  useEffect(() => {
    fetchComplaints();
    fetchCategories();
  }, [page, statusFilter, categoryFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintApi.getComplaints({ 
        page, 
        limit: 10,
        status: statusFilter,
        category: categoryFilter
      });
      setComplaints(res.data.data.complaints);
      setTotalPages(res.data.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await complaintApi.getCategories();
      setCategories(res.data.data);
    } catch (error) {
      // Non-blocking
    }
  };

  const handleAction = (type, complaint) => {
    setActionModal({ type, complaint });
  };

  const closeActionModal = (shouldRefresh = false) => {
    setActionModal({ type: null, complaint: null });
    if (shouldRefresh) fetchComplaints();
  };

  const handleConfirmResolution = async (complaintId) => {
    if (!window.confirm("Are you sure you want to close this ticket? It means the issue is resolved to your satisfaction.")) return;
    try {
      await complaintApi.confirmResolution(complaintId);
      toast.success("Ticket closed successfully");
      fetchComplaints();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to close ticket");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaExclamationCircle className="text-blue-500" />
            Helpdesk & Complaints
          </h1>
          <p className="text-gray-500 mt-1">Manage and track your society's maintenance requests and complaints</p>
        </div>
        
        <div className="flex gap-3">
          {isAdminOrManager && (
            <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
              <button 
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 rounded-md transition-all ${activeTab === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Tickets
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-md transition-all ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Overview
              </button>
            </div>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FaPlus />
            <span>Raise Ticket</span>
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && isAdminOrManager ? (
        <HelpdeskDashboard />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-gray-50">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <FaFilter className="text-gray-400" /> Filters:
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={fetchComplaints}
              className="text-gray-500 hover:text-blue-600 transition-colors p-2"
              title="Refresh"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* List */}
          <ComplaintList 
            complaints={complaints} 
            loading={loading}
            isAdmin={isAdminOrManager}
            onAction={handleAction}
            onConfirmResolution={handleConfirmResolution}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateComplaintModal 
          categories={categories}
          onClose={(refresh) => {
            setShowCreateModal(false);
            if (refresh) fetchComplaints();
          }} 
        />
      )}
      
      {actionModal.type === 'details' && (
        <ComplaintDetailsModal 
          complaintId={actionModal.complaint._id} 
          onClose={() => closeActionModal()} 
        />
      )}

      {actionModal.type === 'assign' && (
        <AssignComplaintModal 
          complaint={actionModal.complaint} 
          onClose={(refresh) => closeActionModal(refresh)} 
        />
      )}

      {actionModal.type === 'resolve' && (
        <ResolveComplaintModal 
          complaint={actionModal.complaint} 
          onClose={(refresh) => closeActionModal(refresh)} 
        />
      )}

      {actionModal.type === 'reopen' && (
        <ReopenComplaintModal 
          complaint={actionModal.complaint} 
          onClose={(refresh) => closeActionModal(refresh)} 
        />
      )}
    </div>
  );
};

export default HelpdeskPage;
