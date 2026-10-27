import React, { useState, useEffect, useMemo } from 'react';
import {
  FaBoxes,
  FaBuilding,
  FaStore,
  FaCar,
  FaPlus,
  FaSpinner,
  FaCheck,
  FaTrashAlt,
  FaPen,
  FaRulerCombined,
  FaLayerGroup,
  FaMotorcycle,
  FaSearch,
  FaExclamationTriangle,
  FaSave,
  FaUndo,
} from 'react-icons/fa';
import { FiSliders, FiShield, FiZap, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { blockApi } from '../../../services/blockApi';
import ResidentialModal from '../../../features/society-setup/components/modals/ResidentialModal';
import CommercialModal from '../../../features/society-setup/components/modals/CommercialModal';
import { PARKING_ALLOCATION_METHODS } from '../../../features/society-setup/constants/setupConstants';

const formatNum = (val) => {
  if (val === undefined || val === null || val === '') return '0';
  return Number(val).toLocaleString('en-IN');
};

const InventoryTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Core inventory state
  const [residentialInventory, setResidentialInventory] = useState([]);
  const [commercialInventory, setCommercialInventory] = useState([]);
  const [parkingConfig, setParkingConfig] = useState({
    fourWheeler: 0,
    twoWheeler: 0,
    visitor: 0,
    evCharging: 0,
    allocationMethod: 'By Society',
  });
  const [propertyInfo, setPropertyInfo] = useState({
    projectName: '',
    developerName: '',
    propertyType: 'Residential',
    totalProjectArea: '',
    totalDevelopedArea: '',
    numberOfBuildings: 1,
  });

  // Track initial state for unsaved changes detection
  const [initialSnapshot, setInitialSnapshot] = useState('');

  // UI state
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'residential' | 'commercial' | 'parking'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [resModalOpen, setResModalOpen] = useState(false);
  const [editingRes, setEditingRes] = useState(null);

  const [comModalOpen, setComModalOpen] = useState(false);
  const [editingCom, setEditingCom] = useState(null);

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    type: null, // 'residential' | 'commercial'
    id: null,
    name: '',
  });

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await blockApi.getInventory();
      const data = res?.data || res || {};

      const resList = data.residentialInventory || [];
      const comList = data.commercialInventory || [];
      const pConfig = data.parkingConfig || {
        fourWheeler: 0,
        twoWheeler: 0,
        visitor: 0,
        evCharging: 0,
        allocationMethod: 'By Society',
      };
      const pInfo = data.propertyInfo || {
        projectName: '',
        developerName: '',
        propertyType: 'Residential',
        totalProjectArea: '',
        totalDevelopedArea: '',
        numberOfBuildings: 1,
      };

      setResidentialInventory(resList);
      setCommercialInventory(comList);
      setParkingConfig(pConfig);
      setPropertyInfo(pInfo);

      const snap = JSON.stringify({ resList, comList, pConfig, pInfo });
      setInitialSnapshot(snap);
    } catch (err) {
      console.error('Failed to load society inventory:', err);
      toast.error('Failed to load society inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Check for unsaved changes
  const hasChanges = useMemo(() => {
    if (!initialSnapshot) return false;
    const currentSnap = JSON.stringify({
      resList: residentialInventory,
      comList: commercialInventory,
      pConfig: parkingConfig,
      pInfo: propertyInfo,
    });
    return currentSnap !== initialSnapshot;
  }, [residentialInventory, commercialInventory, parkingConfig, propertyInfo, initialSnapshot]);

  // Totals calculations
  const totals = useMemo(() => {
    const totalResUnits = residentialInventory.reduce(
      (sum, r) => sum + (Number(r.unitCount || r.totalFlats) || 0),
      0
    );
    const totalResCarpet = residentialInventory.reduce(
      (sum, r) => sum + (Number(r.carpetArea) || 0) * (Number(r.unitCount || r.totalFlats) || 1),
      0
    );
    const totalResParking = residentialInventory.reduce(
      (sum, r) => sum + (Number(r.parking4W) || 0),
      0
    );

    const totalComUnits = commercialInventory.reduce(
      (sum, c) => sum + (Number(c.unitCount) || 0),
      0
    );
    const totalComArea = commercialInventory.reduce(
      (sum, c) => sum + (Number(c.unitSize) || 0) * (Number(c.unitCount) || 1),
      0
    );
    const totalComParking = commercialInventory.reduce(
      (sum, c) => sum + (Number(c.parking) || 0),
      0
    );

    const grandTotalUnits = totalResUnits + totalComUnits;
    const grandTotalParking =
      Number(parkingConfig.fourWheeler || 0) +
      Number(parkingConfig.twoWheeler || 0) +
      Number(parkingConfig.visitor || 0);

    return {
      totalResUnits,
      totalResCarpet,
      totalResParking,
      totalComUnits,
      totalComArea,
      totalComParking,
      grandTotalUnits,
      grandTotalParking,
      totalWings: residentialInventory.length,
      totalCommercialBlocks: commercialInventory.length,
    };
  }, [residentialInventory, commercialInventory, parkingConfig]);

  // Filtered lists based on search
  const filteredResidential = useMemo(() => {
    if (!searchQuery.trim()) return residentialInventory;
    const q = searchQuery.toLowerCase();
    return residentialInventory.filter(
      (r) =>
        (r.wing || r.name || '').toLowerCase().includes(q) ||
        (r.propertyType || '').toLowerCase().includes(q) ||
        (r.configuration || '').toLowerCase().includes(q) ||
        (r.code || '').toLowerCase().includes(q)
    );
  }, [residentialInventory, searchQuery]);

  const filteredCommercial = useMemo(() => {
    if (!searchQuery.trim()) return commercialInventory;
    const q = searchQuery.toLowerCase();
    return commercialInventory.filter(
      (c) =>
        (c.block || '').toLowerCase().includes(q) ||
        (c.commercialType || '').toLowerCase().includes(q)
    );
  }, [commercialInventory, searchQuery]);

  // Residential handlers
  const handleSaveResidential = (data) => {
    if (editingRes) {
      setResidentialInventory((prev) =>
        prev.map((item) =>
          item.id === editingRes.id || (item._id && item._id === editingRes._id)
            ? { ...item, ...data }
            : item
        )
      );
      toast.success('Residential unit configuration updated.');
    } else {
      const newRow = {
        ...data,
        id: `res-${Date.now()}`,
        name: data.wing,
        status: 'Active',
      };
      setResidentialInventory((prev) => [...prev, newRow]);
      toast.success('Residential unit added.');
    }
    setResModalOpen(false);
    setEditingRes(null);
  };

  // Commercial handlers
  const handleSaveCommercial = (data) => {
    if (editingCom) {
      setCommercialInventory((prev) =>
        prev.map((item) =>
          item.id === editingCom.id || (item._id && item._id === editingCom._id)
            ? { ...item, ...data }
            : item
        )
      );
      toast.success('Commercial unit configuration updated.');
    } else {
      const newRow = {
        ...data,
        id: `com-${Date.now()}`,
      };
      setCommercialInventory((prev) => [...prev, newRow]);
      toast.success('Commercial unit added.');
    }
    setComModalOpen(false);
    setEditingCom(null);
  };

  // Delete confirmation
  const confirmDelete = () => {
    const { type, id } = deleteDialog;
    if (type === 'residential') {
      setResidentialInventory((prev) =>
        prev.filter((item) => item.id !== id && item._id !== id)
      );
      toast.success('Residential configuration removed.');
    } else if (type === 'commercial') {
      setCommercialInventory((prev) =>
        prev.filter((item) => item.id !== id && item._id !== id)
      );
      toast.success('Commercial unit removed.');
    }
    setDeleteDialog({ isOpen: false, type: null, id: null, name: '' });
  };

  // Save all to backend
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        residentialInventory,
        commercialInventory,
        propertyInfo,
        parkingConfig,
      };
      await blockApi.saveInventory(payload);
      toast.success('Society inventory saved successfully!');
      const snap = JSON.stringify({
        resList: residentialInventory,
        comList: commercialInventory,
        pConfig: parkingConfig,
        pInfo: propertyInfo,
      });
      setInitialSnapshot(snap);
    } catch (err) {
      console.error('Error saving inventory:', err);
      toast.error(err?.response?.data?.message || 'Failed to save inventory.');
    } finally {
      setSaving(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    if (!initialSnapshot) return;
    try {
      const parsed = JSON.parse(initialSnapshot);
      setResidentialInventory(parsed.resList || []);
      setCommercialInventory(parsed.comList || []);
      setParkingConfig(parsed.pConfig || {});
      setPropertyInfo(parsed.pInfo || {});
      toast('Changes reverted to last saved state.', { icon: '↩️' });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <FaSpinner className="animate-spin text-3xl text-[#EA580C] mb-3" />
        <p className="text-sm font-semibold text-gray-700">Loading Society Inventory...</p>
        <span className="text-xs text-gray-400 mt-0.5">Fetching wings, units, and commercial spaces</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header & Action Controls ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#EA580C] text-lg font-bold shadow-xs">
              <FaBoxes />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                Society Inventory
                {hasChanges && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                    Unsaved Changes
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage residential wings, flats, commercial shops, and parking allocations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {hasChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <FaUndo className="text-xs" />
              <span>Discard</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md cursor-pointer ${
              hasChanges
                ? 'bg-gradient-to-r from-[#EA580C] to-[#f97316] hover:opacity-95 shadow-orange-500/25 ring-2 ring-orange-400/30'
                : 'bg-gray-800 hover:bg-gray-900'
            } disabled:opacity-60`}
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin text-sm" />
                <span>Saving Inventory...</span>
              </>
            ) : (
              <>
                <FaSave className="text-sm" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Units */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50/80 via-white to-white border border-orange-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#EA580C] text-white flex items-center justify-center text-lg shadow-sm shrink-0">
            <FaLayerGroup />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Units</div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              {formatNum(totals.grandTotalUnits)}
            </div>
            <div className="text-[10px] text-gray-400 truncate">
              {totals.totalWings} Wings · {totals.totalCommercialBlocks} Com. Blocks
            </div>
          </div>
        </div>

        {/* Card 2: Residential Flats */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-white border border-blue-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
            <FaBuilding />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Residential Flats</div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              {formatNum(totals.totalResUnits)}
            </div>
            <div className="text-[10px] text-blue-600 font-semibold truncate">
              {totals.totalWings} Configured Wings
            </div>
          </div>
        </div>

        {/* Card 3: Commercial Inventory */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/80 via-white to-white border border-purple-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
            <FaStore />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Commercial Units</div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              {formatNum(totals.totalComUnits)}
            </div>
            <div className="text-[10px] text-purple-600 font-semibold truncate">
              {formatNum(totals.totalComArea)} sq.ft. area
            </div>
          </div>
        </div>

        {/* Card 4: Parking Slots */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-white border border-emerald-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
            <FaCar />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">4W Parking Allocated</div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              {formatNum(totals.totalResParking + totals.totalComParking)}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold truncate">
              {parkingConfig.allocationMethod || 'By Society'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub Navigation Tabs & Search Filter ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All Inventory
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('residential')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'residential'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FaBuilding className="text-xs" />
            <span>Residential ({residentialInventory.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('commercial')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'commercial'
                ? 'bg-white text-purple-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FaStore className="text-xs" />
            <span>Commercial ({commercialInventory.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('parking')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'parking'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FaCar className="text-xs" />
            <span>Parking & Property Info</span>
          </button>
        </div>

        {/* Search filter */}
        {(activeSubTab === 'all' || activeSubTab === 'residential' || activeSubTab === 'commercial') && (
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search wing, block, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#EA580C] focus:bg-white transition-all"
            />
          </div>
        )}
      </div>

      {/* ── Section 1: Residential Inventory ── */}
      {(activeSubTab === 'all' || activeSubTab === 'residential') && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  <FaBuilding />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900">Residential Wings & Flats</h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Flats configuration, carpet area, and unit breakdown across wings.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingRes(null);
                setResModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <FaPlus className="text-xs" />
              <span>Add Residential Wing</span>
            </button>
          </div>

          {filteredResidential.length === 0 ? (
            <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <FaBuilding className="mx-auto text-2xl text-gray-300 mb-2" />
              <p className="text-xs font-bold text-gray-700">No Residential Wings Found</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Click &quot;Add Residential Wing&quot; to configure your society wings and flats.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] font-bold tracking-wider bg-gray-50/60">
                    <th className="py-2.5 px-3 rounded-l-lg">Wing / Block</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Configuration</th>
                    <th className="py-2.5 px-3 text-center">Unit Count</th>
                    <th className="py-2.5 px-3 text-right">Carpet Area</th>
                    <th className="py-2.5 px-3 text-right">Built-Up</th>
                    <th className="py-2.5 px-3 text-center">4W Parking</th>
                    <th className="py-2.5 px-3 text-center rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredResidential.map((row, idx) => (
                    <tr key={row.id || row._id || idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                            {(row.wing || row.name || 'W').charAt(0).toUpperCase()}
                          </span>
                          <span>{row.wing || row.name}</span>
                          {row.code && (
                            <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                              {row.code}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-600">{row.propertyType || 'Flat / Apartment'}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md text-[11px]">
                          {row.configuration || '2 BHK'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-black text-gray-900 text-sm">
                        {row.unitCount || row.totalFlats || 0}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-700 font-medium">
                        {formatNum(row.carpetArea)} sq.ft.
                      </td>
                      <td className="py-3 px-3 text-right text-gray-500">
                        {row.builtUpArea ? `${formatNum(row.builtUpArea)} sq.ft.` : '—'}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-700">
                        {row.parking4W || 0}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRes(row);
                              setResModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Wing"
                          >
                            <FaPen className="text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                type: 'residential',
                                id: row.id || row._id,
                                name: row.wing || row.name,
                              })
                            }
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Wing"
                          >
                            <FaTrashAlt className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sub total pill banner */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-900 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 font-bold text-blue-800">
              <FaLayerGroup />
              <span>Residential Total: {totals.totalWings} Wings</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span>Total Flats: <strong className="font-black text-gray-900">{formatNum(totals.totalResUnits)}</strong></span>
              <span>4W Parking: <strong className="font-black text-gray-900">{formatNum(totals.totalResParking)}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ── Section 2: Commercial Inventory ── */}
      {(activeSubTab === 'all' || activeSubTab === 'commercial') && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                  <FaStore />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900">Commercial Inventory</h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Shops, offices, retail spaces, showrooms, and commercial blocks.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingCom(null);
                setComModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-50 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <FaPlus className="text-xs" />
              <span>Add Commercial Space</span>
            </button>
          </div>

          {filteredCommercial.length === 0 ? (
            <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <FaStore className="mx-auto text-2xl text-gray-300 mb-2" />
              <p className="text-xs font-bold text-gray-700">No Commercial Spaces Configured</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Add shops, offices, or retail outlets configured for this society.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-left text-xs border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] font-bold tracking-wider bg-gray-50/60">
                    <th className="py-2.5 px-3 rounded-l-lg">Block / Complex</th>
                    <th className="py-2.5 px-3">Commercial Type</th>
                    <th className="py-2.5 px-3 text-right">Unit Size</th>
                    <th className="py-2.5 px-3 text-center">Unit Count</th>
                    <th className="py-2.5 px-3 text-center">Parking Allocated</th>
                    <th className="py-2.5 px-3 text-center rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCommercial.map((row, idx) => (
                    <tr key={row.id || row._id || idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                            <FaStore />
                          </span>
                          <span>{row.block}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-purple-900 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md text-[11px]">
                          {row.commercialType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-gray-700 font-medium">
                        {formatNum(row.unitSize)} sq.ft.
                      </td>
                      <td className="py-3 px-3 text-center font-black text-gray-900 text-sm">
                        {row.unitCount}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-700">
                        {row.parking || 0}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCom(row);
                              setComModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                            title="Edit Space"
                          >
                            <FaPen className="text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                type: 'commercial',
                                id: row.id || row._id,
                                name: `${row.block} (${row.commercialType})`,
                              })
                            }
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Commercial Space"
                          >
                            <FaTrashAlt className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sub total commercial strip */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-purple-900 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 font-bold text-purple-800">
              <FaStore />
              <span>Commercial Summary: {totals.totalCommercialBlocks} Blocks</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span>Total Units: <strong className="font-black text-gray-900">{formatNum(totals.totalComUnits)}</strong></span>
              <span>Total Area: <strong className="font-black text-gray-900">{formatNum(totals.totalComArea)} sq.ft.</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ── Section 3: Parking & Project Configuration ── */}
      {(activeSubTab === 'all' || activeSubTab === 'parking') && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  <FaCar />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900">Parking & Society Capacity</h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Configure total vehicular capacity and visitor parking quotas.
              </p>
            </div>
          </div>

          {/* Parking slot inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-xl space-y-1.5">
              <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                <FaCar className="text-blue-500 text-xs" />
                <span>4-Wheeler Capacity</span>
              </label>
              <input
                type="number"
                min="0"
                value={parkingConfig.fourWheeler ?? ''}
                onChange={(e) =>
                  setParkingConfig({ ...parkingConfig, fourWheeler: Number(e.target.value) })
                }
                placeholder="0"
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-xl space-y-1.5">
              <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                <FaMotorcycle className="text-emerald-500 text-xs" />
                <span>2-Wheeler Capacity</span>
              </label>
              <input
                type="number"
                min="0"
                value={parkingConfig.twoWheeler ?? ''}
                onChange={(e) =>
                  setParkingConfig({ ...parkingConfig, twoWheeler: Number(e.target.value) })
                }
                placeholder="0"
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-xl space-y-1.5">
              <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                <FiShield className="text-purple-500 text-xs" />
                <span>Visitor Parking</span>
              </label>
              <input
                type="number"
                min="0"
                value={parkingConfig.visitor ?? ''}
                onChange={(e) =>
                  setParkingConfig({ ...parkingConfig, visitor: Number(e.target.value) })
                }
                placeholder="0"
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-xl space-y-1.5">
              <label className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                <FiZap className="text-amber-500 text-xs" />
                <span>EV Charging Slots</span>
              </label>
              <input
                type="number"
                min="0"
                value={parkingConfig.evCharging ?? ''}
                onChange={(e) =>
                  setParkingConfig({ ...parkingConfig, evCharging: Number(e.target.value) })
                }
                placeholder="0"
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-[#EA580C]"
              />
            </div>
          </div>

          {/* Allocation method & Project Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Parking Allocation Method
              </label>
              <select
                value={parkingConfig.allocationMethod || 'By Society'}
                onChange={(e) =>
                  setParkingConfig({ ...parkingConfig, allocationMethod: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#EA580C]"
              >
                {PARKING_ALLOCATION_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Total Project Area (sq.ft.)
              </label>
              <input
                type="number"
                min="0"
                value={propertyInfo.totalProjectArea || ''}
                onChange={(e) =>
                  setPropertyInfo({ ...propertyInfo, totalProjectArea: e.target.value })
                }
                placeholder="e.g. 50000"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Developed Area (sq.ft.)
              </label>
              <input
                type="number"
                min="0"
                value={propertyInfo.totalDevelopedArea || ''}
                onChange={(e) =>
                  setPropertyInfo({ ...propertyInfo, totalDevelopedArea: e.target.value })
                }
                placeholder="e.g. 42000"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#EA580C]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky Unsaved Changes Notification Bottom Bar ── */}
      {hasChanges && (
        <div className="sticky bottom-4 z-20 flex items-center justify-between p-4 bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-800 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-[#EA580C] flex items-center justify-center font-bold text-sm">
              <FaExclamationTriangle />
            </div>
            <div>
              <p className="text-xs font-bold text-white">You have unsaved inventory modifications</p>
              <p className="text-[11px] text-gray-400">Remember to save before leaving this page.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={saving}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#d94f09] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {saving ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <ResidentialModal
        isOpen={resModalOpen}
        onClose={() => {
          setResModalOpen(false);
          setEditingRes(null);
        }}
        onSave={handleSaveResidential}
        editData={editingRes}
      />

      <CommercialModal
        isOpen={comModalOpen}
        onClose={() => {
          setComModalOpen(false);
          setEditingCom(null);
        }}
        onSave={handleSaveCommercial}
        editData={editingCom}
      />

      {/* ── Delete Confirmation Modal ── */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-base shrink-0">
                <FaTrashAlt />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Remove Configuration?</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Are you sure you want to remove <strong>{deleteDialog.name}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeleteDialog({ isOpen: false, type: null, id: null, name: '' })}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;
