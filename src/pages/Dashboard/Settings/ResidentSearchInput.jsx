import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { managersApi } from '../../../services/managersApi';
import useDebounce from '../../../hooks/useDebounce';

const ResidentSearchInput = ({ societyId, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchResults = async () => {
      // Avoid searching for a single character to prevent spam, but allow empty to get default list
      if (debouncedQuery.length === 1) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await managersApi.searchResidents(societyId, debouncedQuery);
        setResults(res.data?.residents || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, societyId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
          placeholder="Search by name, email, or phone..."
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-blue-500" />
        )}
      </div>

      {isOpen && (debouncedQuery.length !== 1) && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
          {results.length > 0 ? (
            <ul className="py-2">
              {results.map((resident) => (
                <li
                  key={resident._id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex flex-col gap-0.5 transition-colors"
                  onClick={() => {
                    onSelect(resident);
                    setIsOpen(false);
                    setQuery('');
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 text-sm">{resident.name}</span>
                    {resident.flatNumber && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {resident.flatNumber}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-x-2">
                    {resident.email && <span>{resident.email}</span>}
                    {resident.mobile && <span>{resident.mobile}</span>}
                  </div>
                </li>
              ))}
            </ul>
          ) : !isSearching ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No residents found matching "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ResidentSearchInput;
