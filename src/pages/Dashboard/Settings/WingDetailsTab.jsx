import React, { useState, useEffect } from 'react';
import { blockApi } from '../../../services/blockApi';
import { societyApi } from '../../../services/societyApi';
import {
  FaBuilding, FaSpinner, FaCheck, FaTimes, FaLayerGroup,
  FaRuler, FaCar, FaChevronDown, FaChevronUp, FaHome
} from 'react-icons/fa';

const WING_STATUS_OPTIONS = ['Active', 'Inactive', 'Under Maintenance'];

const STATUS_STYLES = {
  'Active': { dot: '#22c55e', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  'Inactive': { dot: '#94a3b8', bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
  'Under Maintenance': { dot: '#f59e0b', bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
};

const WING_COLORS = [
  '#ea580c', '#7c3aed', '#0891b2', '#059669', '#dc2626',
  '#d97706', '#2563eb', '#db2777', '#65a30d', '#9333ea',
];

const defaultWing = (name = '') => ({
  name,
  code: '',
  totalFloors: '',
  unitsPerFloor: '',
  totalFlats: '',
  status: 'Active',
  assignedStaff: '',
  propertyType: '',
  configuration: '',
  unitCount: '',
  carpetArea: '',
  builtUpArea: '',
  parking4W: '',
});

const WingDetailsTab = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [wings, setWings] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [societyRes, wingsRes, staffRes] = await Promise.allSettled([
        societyApi.getCurrentSociety(),
        blockApi.getWings(),
        blockApi.getStaffList(),
      ]);

      let societyWingNames = [];
      if (societyRes.status === 'fulfilled') {
        const s = societyRes.value?.data?.society;
        if (s?.blocks && Array.isArray(s.blocks)) societyWingNames = s.blocks;
      }

      let savedWings = [];
      if (wingsRes.status === 'fulfilled') {
        savedWings = wingsRes.value?.data?.blockDoc?.wings || [];
      }

      if (staffRes.status === 'fulfilled') {
        setStaffList(staffRes.value?.data?.staff || []);
      }

      const mapWing = (w) => ({
        name: w.name,
        code: w.code || '',
        totalFloors: w.totalFloors ?? '',
        unitsPerFloor: w.unitsPerFloor ?? '',
        totalFlats: w.totalFlats ?? '',
        status: w.status || 'Active',
        assignedStaff: w.assignedStaff?._id || w.assignedStaff || '',
        propertyType: w.propertyType || '',
        configuration: w.configuration || '',
        unitCount: w.unitCount ?? '',
        carpetArea: w.carpetArea ?? '',
        builtUpArea: w.builtUpArea ?? '',
        parking4W: w.parking4W ?? '',
      });

      let merged = [];
      if (societyWingNames.length > 0) {
        merged = societyWingNames.map((name) => {
          const existing = savedWings.find((w) => w.name === name);
          return existing ? mapWing(existing) : defaultWing(name);
        });
      } else if (savedWings.length > 0) {
        merged = savedWings.map(mapWing);
      }

      setWings(merged);
      // expand first wing by default
      if (merged.length > 0) setExpanded({ 0: true });
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load wing details.');
    } finally {
      setLoading(false);
    }
  };

  const handleWingChange = (index, field, value) => {
    setWings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const toggleExpanded = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await blockApi.saveWings(wings);
      setSuccessMsg('Wing details saved successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || 'Failed to save wing details.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="wdt-loader">
        <FaSpinner className="wdt-spinner" />
        <span>Loading wing details…</span>
      </div>
    );
  }

  /* ── Empty state ── */
  if (wings.length === 0) {
    return (
      <div className="wdt-empty">
        <div className="wdt-empty-icon"><FaLayerGroup /></div>
        <h3 className="wdt-empty-title">No Wings Configured</h3>
        <p className="wdt-empty-desc">
          Go to the <strong>Society Details</strong> tab and enter the number of blocks / wings and their names first.
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .wdt-root { max-width: 920px; margin: 0 auto; font-family: 'Inter','Segoe UI',sans-serif; }

        /* Loader */
        .wdt-loader { display:flex;align-items:center;justify-content:center;gap:10px;padding:60px 0;color:#64748b;font-size:15px; }
        @keyframes wdt-spin { to { transform:rotate(360deg); } }
        .wdt-spinner { animation:wdt-spin 1s linear infinite;font-size:22px;color:#ea580c; }

        /* Empty */
        .wdt-empty { text-align:center;padding:64px 24px; }
        .wdt-empty-icon { width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,#fff7ed 0%,#fed7aa 100%);display:flex;align-items:center;justify-content:center;font-size:32px;color:#ea580c;margin:0 auto 18px;border:2px dashed #fb923c; }
        .wdt-empty-title { font-size:18px;font-weight:700;color:#0f172a;margin-bottom:8px; }
        .wdt-empty-desc { font-size:14px;color:#64748b;max-width:340px;margin:0 auto; }

        /* Toast */
        .wdt-toast { display:flex;align-items:flex-start;gap:10px;padding:14px 18px;border-radius:12px;margin-bottom:18px;font-size:14px;font-weight:500;animation:wdt-slideIn .25s ease; }
        @keyframes wdt-slideIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .wdt-toast-success { background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:1px solid #6ee7b7;color:#065f46; }
        .wdt-toast-error { background:linear-gradient(135deg,#fff1f2,#ffe4e6);border:1px solid #fca5a5;color:#991b1b; }

        /* Wing card */
        .wdt-card { background:#fff;border:1.5px solid #f1f5f9;border-radius:18px;margin-bottom:16px;box-shadow:0 2px 16px rgba(15,23,42,.05);overflow:hidden;transition:box-shadow .2s; }
        .wdt-card:hover { box-shadow:0 4px 24px rgba(15,23,42,.09); }

        /* Card header */
        .wdt-card-header { display:flex;align-items:center;gap:14px;padding:16px 22px;cursor:pointer;user-select:none;background:linear-gradient(135deg,#fff7ed 0%,#fff 100%);border-bottom:1.5px solid transparent;transition:border-color .2s; }
        .wdt-card-header.expanded { border-bottom-color:#f1f5f9; }
        .wdt-avatar { width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;font-weight:700;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.18); }
        .wdt-header-info { flex:1;min-width:0; }
        .wdt-header-name { font-size:15px;font-weight:700;color:#0f172a;letter-spacing:-.2px; }
        .wdt-header-sub { font-size:12px;color:#94a3b8;margin-top:1px; }
        .wdt-status-badge { display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600;border:1px solid; }
        .wdt-status-dot { width:6px;height:6px;border-radius:50%; }
        .wdt-chevron { color:#94a3b8;font-size:13px;transition:transform .2s; }
        .wdt-chevron.open { transform:rotate(180deg); }

        /* Card body */
        .wdt-card-body { padding:22px; }
        .wdt-section-label { font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #f1f5f9; }

        /* Grid */
        .wdt-grid { display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:22px; }
        .wdt-grid-2 { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:22px; }
        @media(max-width:700px) { .wdt-grid,.wdt-grid-2 { grid-template-columns:1fr; } }

        /* Fields */
        .wdt-field { display:flex;flex-direction:column;gap:5px; }
        .wdt-label { font-size:12px;font-weight:600;color:#475569;letter-spacing:.2px;text-transform:uppercase; }
        .wdt-required { color:#ef4444;margin-left:2px; }
        .wdt-input { width:100%;padding:9px 13px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#0f172a;background:#f8fafc;outline:none;transition:border-color .18s,box-shadow .18s,background .18s;box-sizing:border-box;font-family:inherit; }
        .wdt-input:focus { border-color:#ea580c;background:#fff;box-shadow:0 0 0 3px rgba(234,88,12,.12); }
        .wdt-input[readonly] { background:#f1f5f9;color:#94a3b8;cursor:not-allowed; }
        .wdt-select { appearance:none;cursor:pointer; }

        /* Stats mini row */
        .wdt-stats { display:flex;gap:10px;margin-bottom:22px;flex-wrap:wrap; }
        .wdt-stat-pill { display:flex;align-items:center;gap:7px;padding:8px 14px;background:linear-gradient(135deg,#fff7ed 0%,#fff 100%);border:1.5px solid #fed7aa;border-radius:12px;font-size:12px;font-weight:600;color:#92400e; }
        .wdt-stat-icon { color:#ea580c;font-size:13px; }

        /* Footer */
        .wdt-footer { display:flex;justify-content:flex-end;padding:18px 0 4px;border-top:1.5px solid #f1f5f9;margin-top:6px; }
        .wdt-save-btn { display:inline-flex;align-items:center;gap:9px;padding:11px 28px;background:linear-gradient(135deg,#ea580c 0%,#f97316 100%);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;transition:opacity .2s,transform .15s,box-shadow .2s;box-shadow:0 4px 18px rgba(234,88,12,.3);letter-spacing:.2px; }
        .wdt-save-btn:hover:not(:disabled) { opacity:.92;transform:translateY(-1px);box-shadow:0 6px 22px rgba(234,88,12,.38); }
        .wdt-save-btn:disabled { opacity:.6;cursor:not-allowed; }
        .wdt-spinner-btn { animation:wdt-spin 1s linear infinite; }
      `}</style>

      <div className="wdt-root">
        {/* Toasts */}
        {errorMsg && (
          <div className="wdt-toast wdt-toast-error">
            <FaTimes style={{ flexShrink: 0, marginTop: 2 }} />{errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="wdt-toast wdt-toast-success">
            <FaCheck style={{ flexShrink: 0, marginTop: 2 }} />{successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {wings.map((wing, index) => {
            const isOpen = !!expanded[index];
            const color = WING_COLORS[index % WING_COLORS.length];
            const statusStyle = STATUS_STYLES[wing.status] || STATUS_STYLES['Active'];

            return (
              <div className="wdt-card" key={index}>
                {/* ── Header ── */}
                <div
                  className={`wdt-card-header${isOpen ? ' expanded' : ''}`}
                  onClick={() => toggleExpanded(index)}
                >
                  <div className="wdt-avatar" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}>
                    {wing.name ? wing.name.charAt(0).toUpperCase() : String.fromCharCode(65 + index)}
                  </div>
                  <div className="wdt-header-info">
                    <div className="wdt-header-name">{wing.name || `Wing ${index + 1}`}</div>
                    <div className="wdt-header-sub">
                      {wing.code ? `Code: ${wing.code}` : 'Block / Wing'} · {wing.totalFloors ? `${wing.totalFloors} Floors` : 'Floors not set'} · {wing.totalFlats ? `${wing.totalFlats} Flats` : 'Flats not set'}
                    </div>
                  </div>
                  <div
                    className="wdt-status-badge"
                    style={{ background: statusStyle.bg, color: statusStyle.color, borderColor: statusStyle.border }}
                  >
                    <div className="wdt-status-dot" style={{ background: statusStyle.dot }} />
                    {wing.status}
                  </div>
                  <div className={`wdt-chevron${isOpen ? ' open' : ''}`}>
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>

                {/* ── Expanded Body ── */}
                {isOpen && (
                  <div className="wdt-card-body">

                    {/* Core Details */}
                    <div className="wdt-section-label">Core Details</div>
                    <div className="wdt-grid">
                      <div className="wdt-field">
                        <label className="wdt-label">Wing Name<span className="wdt-required">*</span></label>
                        <input className="wdt-input" type="text" value={wing.name} readOnly />
                      </div>
                      <div className="wdt-field">
                        <label className="wdt-label">Wing Code<span className="wdt-required">*</span></label>
                        <input
                          className="wdt-input"
                          type="text"
                          required
                          value={wing.code}
                          onChange={(e) => handleWingChange(index, 'code', e.target.value)}
                          placeholder="e.g. A, B1, T1"
                        />
                      </div>
                      <div className="wdt-field">
                        <label className="wdt-label">Status</label>
                        <select
                          className="wdt-input wdt-select"
                          value={wing.status}
                          onChange={(e) => handleWingChange(index, 'status', e.target.value)}
                        >
                          {WING_STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Floors & Flats */}
                    <div className="wdt-section-label">Floor & Unit Configuration</div>
                    <div className="wdt-grid">
                      <div className="wdt-field">
                        <label className="wdt-label">Total Floors<span className="wdt-required">*</span></label>
                        <input
                          className="wdt-input"
                          type="number"
                          required
                          min={1}
                          value={wing.totalFloors}
                          onChange={(e) => handleWingChange(index, 'totalFloors', e.target.value)}
                          placeholder="e.g. 12"
                        />
                      </div>
                      <div className="wdt-field">
                        <label className="wdt-label">Flats per Floor</label>
                        <input
                          className="wdt-input"
                          type="number"
                          min={1}
                          value={wing.unitsPerFloor}
                          onChange={(e) => handleWingChange(index, 'unitsPerFloor', e.target.value)}
                          placeholder="e.g. 4"
                        />
                      </div>
                      <div className="wdt-field">
                        <label className="wdt-label">Total Flats</label>
                        <input
                          className="wdt-input"
                          type="number"
                          min={0}
                          value={wing.totalFlats}
                          onChange={(e) => handleWingChange(index, 'totalFlats', e.target.value)}
                          placeholder="e.g. 48"
                        />
                      </div>
                      <div className="wdt-field">
                        <label className="wdt-label">Unit Count</label>
                        <input
                          className="wdt-input"
                          type="number"
                          min={0}
                          value={wing.unitCount}
                          onChange={(e) => handleWingChange(index, 'unitCount', e.target.value)}
                          placeholder="e.g. 48"
                        />
                      </div>
                    </div>

                    {/* Property & Area */}
                    <div className="wdt-section-label">Property & Area Details</div>
                    <div className="wdt-grid">
                      <div className="wdt-field">
                        <label className="wdt-label">Property Type</label>
                        <input
                          className="wdt-input"
                          type="text"
                          value={wing.propertyType}
                          onChange={(e) => handleWingChange(index, 'propertyType', e.target.value)}
                          placeholder="e.g. Residential, Commercial"
                        />
                      </div>
                      <div className="wdt-field">
                        <label className="wdt-label">Configuration</label>
                        <input
                          className="wdt-input"
                          type="text"
                          value={wing.configuration}
                          onChange={(e) => handleWingChange(index, 'configuration', e.target.value)}
                          placeholder="e.g. 2BHK, 3BHK"
                        />
                      </div>
                      <div className="wdt-field">
                        <label className="wdt-label">4-Wheeler Parking Slots</label>
                        <input
                          className="wdt-input"
                          type="number"
                          min={0}
                          value={wing.parking4W}
                          onChange={(e) => handleWingChange(index, 'parking4W', e.target.value)}
                          placeholder="e.g. 20"
                        />
                      </div>
                      <div className="wdt-field">
                        <label className="wdt-label">Carpet Area (sq ft)</label>
                        <input
                          className="wdt-input"
                          type="number"
                          min={0}
                          value={wing.carpetArea}
                          onChange={(e) => handleWingChange(index, 'carpetArea', e.target.value)}
                          placeholder="e.g. 950"
                        />
                      </div>
                      <div className="wdt-field">
                        <label className="wdt-label">Built-up Area (sq ft)</label>
                        <input
                          className="wdt-input"
                          type="number"
                          min={0}
                          value={wing.builtUpArea}
                          onChange={(e) => handleWingChange(index, 'builtUpArea', e.target.value)}
                          placeholder="e.g. 1100"
                        />
                      </div>
                      <div className="wdt-field">
                        <label className="wdt-label">Assigned Staff / Manager</label>
                        <select
                          className="wdt-input wdt-select"
                          value={wing.assignedStaff}
                          onChange={(e) => handleWingChange(index, 'assignedStaff', e.target.value)}
                        >
                          <option value="">— Select Staff —</option>
                          {staffList.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name} ({s.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quick stats summary */}
                    {(wing.totalFloors || wing.totalFlats || wing.carpetArea || wing.parking4W) && (
                      <div className="wdt-stats">
                        {wing.totalFloors && (
                          <div className="wdt-stat-pill">
                            <FaBuilding className="wdt-stat-icon" />{wing.totalFloors} Floors
                          </div>
                        )}
                        {wing.unitsPerFloor && (
                          <div className="wdt-stat-pill">
                            <FaLayerGroup className="wdt-stat-icon" />{wing.unitsPerFloor} Flats/Floor
                          </div>
                        )}
                        {wing.totalFlats && (
                          <div className="wdt-stat-pill">
                            <FaHome className="wdt-stat-icon" />{wing.totalFlats} Flats
                          </div>
                        )}
                        {wing.carpetArea && (
                          <div className="wdt-stat-pill">
                            <FaRuler className="wdt-stat-icon" />{wing.carpetArea} sq ft carpet
                          </div>
                        )}
                        {wing.parking4W && (
                          <div className="wdt-stat-pill">
                            <FaCar className="wdt-stat-icon" />{wing.parking4W} parking slots
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}

          {/* Footer */}
          <div className="wdt-footer">
            <button type="submit" className="wdt-save-btn" disabled={submitting}>
              {submitting
                ? <><FaSpinner className="wdt-spinner-btn" />Saving…</>
                : <><FaCheck />Save Wing Details</>
              }
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default WingDetailsTab;
