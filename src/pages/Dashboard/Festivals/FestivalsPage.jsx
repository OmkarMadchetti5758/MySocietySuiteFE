import React, { useState, useEffect, useCallback } from 'react';
import {
  FaPlus, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaSearch,
  FaEye, FaEdit, FaTrash, FaBullhorn, FaFilter, FaTimes,
  FaCheckCircle, FaBan, FaGlobe, FaFileAlt
} from 'react-icons/fa';
import { festivalApi } from '../../../services/festivalApi';
import FestivalModal from './FestivalModal';
import FestivalDetailsModal from './FestivalDetailsModal';
import ConfirmModal from '../../../components/common/ConfirmModal';

const STATUS_CONFIG = {
  DRAFT:     { label: 'Draft',     bg: 'bg-yellow-100', text: 'text-yellow-700', icon: FaFileAlt },
  PUBLISHED: { label: 'Published', bg: 'bg-green-100',  text: 'text-green-700',  icon: FaGlobe },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-100',    text: 'text-red-700',    icon: FaBan },
  COMPLETED: { label: 'Completed', bg: 'bg-blue-100',   text: 'text-blue-700',   icon: FaCheckCircle },
};

const FestivalsPage = () => {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [festivalToEdit, setFestivalToEdit] = useState(null);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [festivalToDelete, setFestivalToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // festivalId of ongoing action

  // Filter state
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'upcoming' | 'past'
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'committee_member' ||
                  user?.role === 'super_admin' || user?.role === 'committee_admin';

  const fetchFestivals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 12 };
      if (filterStatus) params.status = filterStatus;
      const data = await festivalApi.getFestivals(params);
      setFestivals(data.data || []);
      setMeta(data.meta || { total: 0, totalPages: 1 });
    } catch (err) {
      setError('Failed to load festivals. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => {
    fetchFestivals();
  }, [fetchFestivals]);

  const handleCreateSuccess = () => {
    setIsModalOpen(false);
    setFestivalToEdit(null);
    fetchFestivals();
  };

  const handleEditClick = (festival) => {
    setFestivalToEdit(festival);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (festival) => {
    setFestivalToDelete(festival);
  };

  const confirmDelete = async () => {
    if (!festivalToDelete) return;
    try {
      setActionLoading(festivalToDelete._id);
      await festivalApi.deleteFestival(festivalToDelete._id);
      fetchFestivals();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete festival.');
    } finally {
      setFestivalToDelete(null);
      setActionLoading(null);
    }
  };

  const handleStatusAction = async (festival, action) => {
    try {
      setActionLoading(festival._id);
      if (action === 'publish')    await festivalApi.publishFestival(festival._id);
      if (action === 'unpublish')  await festivalApi.unpublishFestival(festival._id);
      if (action === 'cancel')     await festivalApi.cancelFestival(festival._id);
      fetchFestivals();
    } catch (err) {
      alert(err?.response?.data?.message || `Failed to ${action} festival.`);
    } finally {
      setActionLoading(null);
    }
  };

  // Client-side tab filter (upcoming / past)
  const now = new Date();
  const filteredFestivals = festivals.filter(f => {
    const eventDate = new Date(f.date);
    if (filterTab === 'upcoming') return eventDate >= now || f.status === 'PUBLISHED';
    if (filterTab === 'past')     return eventDate < now || f.status === 'COMPLETED';
    return true;
  }).filter(f => {
    if (!search) return true;
    return f.title.toLowerCase().includes(search.toLowerCase()) ||
           (f.venue || '').toLowerCase().includes(search.toLowerCase());
  });

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Festivals &amp; Events</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage and publish community events for your society.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setFestivalToEdit(null); setIsModalOpen(true); }}
            className="bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-5 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2 shrink-0"
          >
            <FaPlus /> Create Event
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search by name or venue..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden shrink-0 bg-white">
          {['all', 'upcoming', 'past'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${
                filterTab === tab
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Status Filter (admin only) */}
        {isAdmin && (
          <div className="relative shrink-0">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
              <div className="h-36 bg-gray-100 rounded-xl mb-4" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-8 text-center">
          <p className="font-medium">{error}</p>
          <button onClick={fetchFestivals} className="mt-3 text-sm underline text-red-600">Try again</button>
        </div>
      ) : filteredFestivals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-14 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCalendarAlt className="text-3xl text-orange-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">No Events Found</h3>
          <p className="text-gray-400 text-sm">
            {search ? 'Try adjusting your search or filters.' : 'No festivals have been created yet.'}
          </p>
          {isAdmin && !search && (
            <button
              onClick={() => { setFestivalToEdit(null); setIsModalOpen(true); }}
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 px-5 rounded-xl text-sm font-semibold transition-colors"
            >
              Create First Event
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFestivals.map(festival => {
              const statusCfg = STATUS_CONFIG[festival.status] || STATUS_CONFIG.DRAFT;
              const StatusIcon = statusCfg.icon;
              const isLoading = actionLoading === festival._id;

              return (
                <div
                  key={festival._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
                >
                  {/* Image / Banner */}
                  <div className="relative h-40 bg-gradient-to-br from-orange-50 to-amber-100 overflow-hidden">
                    {festival.image ? (
                      <img
                        src={festival.image}
                        alt={festival.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaBullhorn className="text-5xl text-orange-200" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text} shadow-sm`}>
                      <StatusIcon className="text-[10px]" />
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="text-base font-bold text-gray-800 line-clamp-1">{festival.title}</h3>
                    {festival.description && (
                      <p className="text-gray-500 text-xs line-clamp-2 flex-1">{festival.description}</p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-col gap-1 mt-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <FaCalendarAlt className="text-orange-400 shrink-0" />
                        <span>{formatDate(festival.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaClock className="text-orange-400 shrink-0" />
                        <span>{formatTime(festival.startTime)} – {formatTime(festival.endTime)}</span>
                      </div>
                      {festival.venue && (
                        <div className="flex items-center gap-1.5">
                          <FaMapMarkerAlt className="text-orange-400 shrink-0" />
                          <span className="line-clamp-1">{festival.venue}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-50">
                      <button
                        onClick={() => setSelectedFestival(festival)}
                        className="text-orange-500 hover:text-orange-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <FaEye /> View Details
                      </button>

                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          {/* Publish / Unpublish */}
                          {festival.status === 'DRAFT' && (
                            <button
                              onClick={() => handleStatusAction(festival, 'publish')}
                              disabled={isLoading}
                              title="Publish"
                              className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <FaGlobe className="text-sm" />
                            </button>
                          )}
                          {festival.status === 'PUBLISHED' && (
                            <>
                              <button
                                onClick={() => handleStatusAction(festival, 'unpublish')}
                                disabled={isLoading}
                                title="Unpublish"
                                className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <FaTimes className="text-sm" />
                              </button>
                              <button
                                onClick={() => handleStatusAction(festival, 'cancel')}
                                disabled={isLoading}
                                title="Cancel Event"
                                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <FaBan className="text-sm" />
                              </button>
                            </>
                          )}
                          {/* Edit */}
                          {(festival.status === 'DRAFT' || festival.status === 'PUBLISHED') && (
                            <button
                              onClick={() => handleEditClick(festival)}
                              disabled={isLoading}
                              title="Edit"
                              className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                          )}
                          {/* Delete (DRAFT only) */}
                          {festival.status === 'DRAFT' && (
                            <button
                              onClick={() => handleDeleteClick(festival)}
                              disabled={isLoading}
                              title="Delete Draft"
                              className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {meta.totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {isModalOpen && (
        <FestivalModal
          festivalToEdit={festivalToEdit}
          onClose={() => { setIsModalOpen(false); setFestivalToEdit(null); }}
          onSuccess={handleCreateSuccess}
        />
      )}

      {selectedFestival && (
        <FestivalDetailsModal
          festival={selectedFestival}
          isAdmin={isAdmin}
          onClose={() => setSelectedFestival(null)}
          onStatusAction={handleStatusAction}
          onEdit={handleEditClick}
          actionLoading={actionLoading}
        />
      )}

      <ConfirmModal
        isOpen={!!festivalToDelete}
        onClose={() => setFestivalToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Festival"
        message={`Are you sure you want to delete "${festivalToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default FestivalsPage;
