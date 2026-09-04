import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2, UserCheck, UserPlus, User } from 'lucide-react';
import { residentsApi } from '../../../services/residentsApi';
import { flatApi } from '../../../services/flatApi';

const ExistingResidentModal = ({ flat, onClose, onSuccess }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [residentType, setResidentType] = useState('owner');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await residentsApi.getResidents({ search: query.trim(), limit: 20 });
        setResults(data?.data?.residents || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (resident) => {
    setSelected(resident);
    setQuery(resident.name);
    setResults([]);
    setError('');
  };

  const handleSubmit = async () => {
    if (!selected) {
      setError('Please select a resident from the list.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await flatApi.allocateResident(flat._id, {
        userId: selected._id,
        residentType,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to allocate resident. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        style={{ animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Allocate Resident</h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Existing
                </span>
              </div>
              <p className="text-xs text-gray-500">Flat {flat.flatNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-600 border border-rose-200 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Search box */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Resident *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (selected) setSelected(null);
                }}
                placeholder="Search by name, email or phone…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>

            {/* Results dropdown */}
            {results.length > 0 && (
              <div className="mt-1 border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white max-h-52 overflow-y-auto divide-y divide-gray-50">
                {results.map((r) => (
                  <button
                    key={r._id}
                    onClick={() => handleSelect(r)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition-colors group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <User className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {r.email || r.mobile}
                        {r.flatNumber && (
                          <span className="ml-2 text-gray-300">· Flat {r.flatNumber}</span>
                        )}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!searching && query.trim() && results.length === 0 && !selected && (
              <p className="mt-2 text-xs text-gray-400 text-center">No residents found for "{query}"</p>
            )}
          </div>

          {/* Selected resident card */}
          {selected && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-blue-900 truncate">{selected.name}</p>
                <p className="text-xs text-blue-600 truncate">{selected.email || selected.mobile}</p>
              </div>
              <button
                onClick={() => { setSelected(null); setQuery(''); }}
                className="text-blue-400 hover:text-blue-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Resident Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resident Type *</label>
            <div className="flex gap-3">
              {[
                { value: 'owner', label: 'Owner', desc: 'Primary property owner' },
                { value: 'tenant', label: 'Tenant', desc: 'Renting the flat' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    residentType === opt.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="existingResidentType"
                    value={opt.value}
                    checked={residentType === opt.value}
                    onChange={() => setResidentType(opt.value)}
                    className="sr-only"
                  />
                  <span className="font-semibold text-gray-900 text-sm">{opt.label}</span>
                  <span className="text-xs text-gray-500 mt-0.5">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !selected}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition-colors text-sm disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {submitting ? 'Allocating…' : 'Allocate Resident'}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.92) translateY(8px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ExistingResidentModal;
