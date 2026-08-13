import { useState, useEffect } from 'react';
import { Search, Plus, Loader2, X, Check, Copy } from 'lucide-react';
import { residentsApi } from '../../../services/residentsApi';
import { blockApi } from '../../../services/blockApi';

const STATUS_STYLES = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  invited: 'bg-amber-100 text-amber-700 border-amber-200',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
  suspended: 'bg-rose-100 text-rose-700 border-rose-200',
};

const formatRole = (role) => {
  if (!role) return '—';
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const ResidentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const [wings, setWings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    flatNumber: '',
    wingCode: '',
    residentType: 'owner',
    role: 'resident_owner',
  });
  const [inviteLink, setInviteLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchResidents(pagination.page, searchTerm);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pagination.page]);

  useEffect(() => {
    const loadWings = async () => {
      try {
        const res = await blockApi.getWings();
        setWings(res.data?.blockDoc?.wings || []);
      } catch {
        setWings([]);
      }
    };
    loadWings();
  }, []);

  const fetchResidents = async (page, search) => {
    setLoading(true);
    try {
      const response = await residentsApi.getResidents({
        page,
        limit: pagination.limit,
        search: search || undefined,
      });
      const { residents: data, total, totalPages, limit } = response.data;
      setResidents(data || []);
      setPagination((prev) => ({ ...prev, page, total, totalPages, limit }));
    } catch (err) {
      console.error('Failed to fetch residents', err);
      setResidents([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNext = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handleCreateResident = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        flatNumber: formData.flatNumber,
        wingCode: formData.wingCode || undefined,
        residentType: formData.residentType,
        role: formData.role,
      };
      const response = await residentsApi.inviteResident(payload);

      if (response.data?.devInviteLink) {
        setInviteLink(response.data.devInviteLink);
      } else {
        closeModal();
      }
      fetchResidents(pagination.page, searchTerm);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create resident');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setInviteLink(null);
    setError('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      flatNumber: '',
      wingCode: '',
      residentType: 'owner',
      role: 'resident_owner',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Residents</h1>
          <p className="text-gray-500 mt-1">Manage society residents and send account invitations.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Resident
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Flat</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 relative">
              {loading && (
                <tr>
                  <td colSpan="6">
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 min-h-[200px]">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  </td>
                </tr>
              )}

              {!loading && residents.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No residents found. Add your first resident to get started.
                  </td>
                </tr>
              )}

              {residents.map((resident) => (
                <tr key={resident._id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{resident.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{resident.email || '—'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{resident.mobile || '—'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {resident.flatNumber || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                      {resident.residentType || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                    {formatRole(resident.role)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[resident.status] || STATUS_STYLES.inactive
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${resident.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                      />
                      {resident.status || 'unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm text-gray-500">
          <p>
            Showing {residents.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
            residents
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Add New Resident</h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteLink ? (
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">Resident Invited Successfully</h4>
                  <p className="text-gray-500 mt-2">
                    The resident account has been created. They must activate their account using the invite link.
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Development Invite Link
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteLink}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="p-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shrink-0 flex items-center gap-2 text-sm font-medium"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-amber-600 mt-2 font-medium bg-amber-50 p-2 rounded inline-block">
                    Note: This link is only shown because the server is running in development mode.
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateResident}>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {error && (
                    <div className="bg-rose-50 text-rose-600 border border-rose-200 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                        1
                      </span>
                      Flat Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Wing / Block</label>
                        <select
                          value={formData.wingCode}
                          onChange={(e) => setFormData({ ...formData, wingCode: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">No wing selected</option>
                          {wings.map((wing) => (
                            <option key={wing._id || wing.code} value={wing.code}>
                              {wing.name} ({wing.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Flat Number *</label>
                        <input
                          type="text"
                          required
                          value={formData.flatNumber}
                          onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. 101"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Resident Type</label>
                        <select
                          value={formData.residentType}
                          onChange={(e) => {
                            const type = e.target.value;
                            setFormData({
                              ...formData,
                              residentType: type,
                              role: type === 'tenant' ? 'resident_tenant' : 'resident_owner',
                            });
                          }}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="owner">Owner</option>
                          <option value="tenant">Tenant</option>
                          <option value="family_member">Family Member</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-gray-100" />

                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                        2
                      </span>
                      Resident Details
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. Rahul Sharma"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="resident@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="+91 9876543210"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200/50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm disabled:opacity-70"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create & Invite Resident'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentsPage;
