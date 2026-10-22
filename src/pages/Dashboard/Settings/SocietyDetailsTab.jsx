import React, { useState, useEffect, useRef } from 'react';
import { societyApi } from '../../../services/societyApi';
import {
  FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaLayerGroup,
  FaCamera, FaCalendarAlt, FaParking, FaInfoCircle, FaCheck, FaTimes,
  FaHashtag, FaClipboardList, FaSpinner, FaCar, FaMotorcycle,
  FaChargingStation
} from 'react-icons/fa';


/* ─────────────── helpers ─────────────── */
const SOCIETY_TYPES = [
  'Residential',
  'Commercial',
  'Mixed',
  'Mixed (Residential + Commercial)',
  'Co-operative Housing Society',
  'Gated Community / Villa',
];

const toDateInputValue = (val) => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

/* ─────────────── sub-components ─────────────── */
const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="sdt-card">
    <div className="sdt-card-header">
      <div className="sdt-card-icon-wrap"><Icon /></div>
      <h3 className="sdt-card-title">{title}</h3>
    </div>
    <div className="sdt-card-body">{children}</div>
  </div>
);

const Field = ({ label, required, children, colSpan }) => (
  <div className={`sdt-field${colSpan === 2 ? ' sdt-col-2' : ''}`}>
    <label className="sdt-label">
      {label}{required && <span className="sdt-required">*</span>}
    </label>
    {children}
  </div>
);

const Input = ({ icon: Icon, ...props }) => (
  <div className="sdt-input-wrap">
    {Icon && <Icon className="sdt-input-icon" />}
    <input className={`sdt-input${Icon ? ' sdt-input-with-icon' : ''}`} {...props} />
  </div>
);

const Select = ({ icon: Icon, children, ...props }) => (
  <div className="sdt-input-wrap">
    {Icon && <Icon className="sdt-input-icon" />}
    <select className={`sdt-input sdt-select${Icon ? ' sdt-input-with-icon' : ''}`} {...props}>
      {children}
    </select>
  </div>
);

const Textarea = (props) => (
  <textarea className="sdt-input sdt-textarea" {...props} />
);

/* ─────────────── main component ─────────────── */
const SocietyDetailsTab = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    societyName: '', registrationNumber: '', societyCode: '',
    societyType: '', registrationDate: '',
    street: '', city: '', state: '', zipCode: '', country: 'India',
    contactPhone: '', contactEmail: '',
    numberOfBlocks: 0,
    projectName: '', developerName: '', projectStartDate: '',
    expectedCompletionDate: '', actualCompletionDate: '', possessionStartDate: '',
    totalProjectArea: '', totalDevelopedArea: '', numberOfBuildings: '', propertyType: '',
    fourWheeler: 0, twoWheeler: 0, visitorParking: 0, evCharging: 0,
    allocationMethod: 'By Society',
  });

  const [blocks, setBlocks] = useState([]);
  const [savedBlocks, setSavedBlocks] = useState([]);

  useEffect(() => { fetchSocietyDetails(); }, []);

  const fetchSocietyDetails = async () => {
    try {
      setLoading(true);
      const data = await societyApi.getCurrentSociety();
      const s = data.data.society;
      setForm({
        societyName: s.name || '',
        registrationNumber: s.registrationNumber || '',
        societyCode: s.societyCode || '',
        societyType: s.societyType || '',
        registrationDate: toDateInputValue(s.registrationDate),
        street: s.address?.street || '',
        city: s.address?.city || '',
        state: s.address?.state || '',
        zipCode: s.address?.zipCode || '',
        country: s.address?.country || 'India',
        contactPhone: s.contactPhone || '',
        contactEmail: s.contactEmail || '',
        numberOfBlocks: s.numberOfBlocks || 0,
        projectName: s.projectInfo?.projectName || '',
        developerName: s.projectInfo?.developerName || '',
        projectStartDate: toDateInputValue(s.projectInfo?.projectStartDate),
        expectedCompletionDate: toDateInputValue(s.projectInfo?.expectedCompletionDate),
        actualCompletionDate: toDateInputValue(s.projectInfo?.actualCompletionDate),
        possessionStartDate: toDateInputValue(s.projectInfo?.possessionStartDate),
        totalProjectArea: s.projectInfo?.totalProjectArea ?? '',
        totalDevelopedArea: s.projectInfo?.totalDevelopedArea ?? '',
        numberOfBuildings: s.projectInfo?.numberOfBuildings ?? '',
        propertyType: s.projectInfo?.propertyType || '',
        fourWheeler: s.parkingConfig?.fourWheeler ?? 0,
        twoWheeler: s.parkingConfig?.twoWheeler ?? 0,
        visitorParking: s.parkingConfig?.visitor ?? 0,
        evCharging: s.parkingConfig?.evCharging ?? 0,
        allocationMethod: s.parkingConfig?.allocationMethod || 'By Society',
      });
      if (s.logo) setLogoPreview(s.logo);
      const blks = Array.isArray(s.blocks) ? s.blocks : [];
      setBlocks(blks);
      setSavedBlocks(blks);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch society details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'numberOfBlocks') {
        const num = parseInt(value, 10) || 0;
        setBlocks(Array(num).fill('').map((_, i) => blocks[i] ?? ''));
      }
      return updated;
    });
  };

  const handleBlockChange = (index, value) => {
    setBlocks((prev) => { const nb = [...prev]; nb[index] = value; return nb; });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const data = new FormData();
      if (form.societyName) data.append('name', form.societyName);
      if (form.registrationNumber) data.append('registrationNumber', form.registrationNumber);
      if (form.societyCode) data.append('societyCode', form.societyCode);
      if (form.societyType) data.append('societyType', form.societyType);
      if (form.registrationDate) data.append('registrationDate', form.registrationDate);
      if (logoFile) data.append('logo', logoFile);
      if (form.street) data.append('address', form.street);
      if (form.city) data.append('city', form.city);
      if (form.state) data.append('state', form.state);
      if (form.zipCode) data.append('pinCode', form.zipCode);
      if (form.country) data.append('country', form.country);
      if (form.contactPhone) data.append('contactPhone', form.contactPhone);
      if (form.contactEmail) data.append('contactEmail', form.contactEmail);
      data.append('numberOfBlocks', form.numberOfBlocks);
      if (blocks.length > 0) data.append('blocks', JSON.stringify(blocks));
      const projectInfo = {
        projectName: form.projectName,
        developerName: form.developerName,
        propertyType: form.propertyType,
        projectStartDate: form.projectStartDate || undefined,
        expectedCompletionDate: form.expectedCompletionDate || undefined,
        actualCompletionDate: form.actualCompletionDate || undefined,
        possessionStartDate: form.possessionStartDate || undefined,
        totalProjectArea: form.totalProjectArea !== '' ? Number(form.totalProjectArea) : undefined,
        totalDevelopedArea: form.totalDevelopedArea !== '' ? Number(form.totalDevelopedArea) : undefined,
        numberOfBuildings: form.numberOfBuildings !== '' ? Number(form.numberOfBuildings) : undefined,
      };
      data.append('projectInfo', JSON.stringify(projectInfo));
      const parkingConfig = {
        fourWheeler: Number(form.fourWheeler) || 0,
        twoWheeler: Number(form.twoWheeler) || 0,
        visitor: Number(form.visitorParking) || 0,
        evCharging: Number(form.evCharging) || 0,
        allocationMethod: form.allocationMethod,
      };
      data.append('parkingConfig', JSON.stringify(parkingConfig));
      await societyApi.updateCurrentSociety(data);
      setSuccessMsg('Society details updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update society details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="sdt-loader">
        <FaSpinner className="sdt-spinner" />
        <span>Loading society details…</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .sdt-root { max-width: 900px; margin: 0 auto; font-family: 'Inter','Segoe UI',sans-serif; }
        .sdt-loader { display:flex;align-items:center;justify-content:center;gap:10px;padding:60px 0;color:#64748b;font-size:15px; }
        @keyframes sdt-spin { to { transform: rotate(360deg); } }
        .sdt-spinner { animation: sdt-spin 1s linear infinite; font-size:22px; color:#ea580c; }
        .sdt-toast { display:flex;align-items:flex-start;gap:10px;padding:14px 18px;border-radius:12px;margin-bottom:18px;font-size:14px;font-weight:500;animation:sdt-slideIn .25s ease; }
        @keyframes sdt-slideIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .sdt-toast-success { background:linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%);border:1px solid #6ee7b7;color:#065f46; }
        .sdt-toast-error { background:linear-gradient(135deg,#fff1f2 0%,#ffe4e6 100%);border:1px solid #fca5a5;color:#991b1b; }
        .sdt-logo-area { display:flex;align-items:center;gap:20px;margin-bottom:22px;padding:20px;background:linear-gradient(135deg,#fff7ed 0%,#fff 100%);border:1.5px dashed #fed7aa;border-radius:16px; }
        .sdt-logo-preview { width:72px;height:72px;border-radius:16px;object-fit:cover;border:2px solid #fdba74;box-shadow:0 4px 14px rgba(234,88,12,.15); }
        .sdt-logo-placeholder { width:72px;height:72px;border-radius:16px;background:linear-gradient(135deg,#fff7ed 0%,#fed7aa 100%);display:flex;align-items:center;justify-content:center;border:2px dashed #fb923c;color:#ea580c;font-size:26px; }
        .sdt-logo-btn { display:inline-flex;align-items:center;gap:8px;padding:9px 18px;background:#ea580c;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:background .2s; }
        .sdt-logo-btn:hover { background:#c2410c; }
        .sdt-logo-hint { font-size:12px;color:#94a3b8;margin-top:4px; }
        .sdt-card { background:#fff;border:1.5px solid #f1f5f9;border-radius:18px;margin-bottom:22px;box-shadow:0 2px 16px rgba(15,23,42,.05);overflow:hidden;transition:box-shadow .2s; }
        .sdt-card:hover { box-shadow:0 4px 24px rgba(15,23,42,.09); }
        .sdt-card-header { display:flex;align-items:center;gap:12px;padding:16px 22px 14px;background:linear-gradient(135deg,#fff7ed 0%,#fff 100%);border-bottom:1.5px solid #f1f5f9; }
        .sdt-card-icon-wrap { width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#ea580c 0%,#f97316 100%);display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;flex-shrink:0;box-shadow:0 2px 8px rgba(234,88,12,.3); }
        .sdt-card-title { font-size:15px;font-weight:700;color:#0f172a;letter-spacing:-.2px; }
        .sdt-card-body { padding:22px; }
        .sdt-grid { display:grid;grid-template-columns:1fr 1fr;gap:18px; }
        .sdt-grid-3 { display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px; }
        @media(max-width:680px) { .sdt-grid,.sdt-grid-3{grid-template-columns:1fr;} }
        .sdt-field { display:flex;flex-direction:column;gap:6px; }
        .sdt-col-2 { grid-column:span 2; }
        @media(max-width:680px) { .sdt-col-2{grid-column:span 1;} }
        .sdt-label { font-size:12.5px;font-weight:600;color:#475569;letter-spacing:.2px;text-transform:uppercase; }
        .sdt-required { color:#ef4444;margin-left:3px; }
        .sdt-input-wrap { position:relative; }
        .sdt-input-icon { position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:13px;pointer-events:none; }
        .sdt-input { width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#0f172a;background:#f8fafc;outline:none;transition:border-color .18s,box-shadow .18s,background .18s;box-sizing:border-box;font-family:inherit; }
        .sdt-input-with-icon { padding-left:34px; }
        .sdt-input:focus { border-color:#ea580c;background:#fff;box-shadow:0 0 0 3px rgba(234,88,12,.12); }
        .sdt-input[readonly],.sdt-input[disabled] { background:#f1f5f9;color:#94a3b8;cursor:not-allowed;border-color:#e2e8f0; }
        .sdt-select { appearance:none;cursor:pointer; }
        .sdt-textarea { resize:vertical;min-height:78px; }
        .sdt-num-input { width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;color:#0f172a;background:#f8fafc;outline:none;transition:border-color .18s,box-shadow .18s;box-sizing:border-box;font-family:inherit; }
        .sdt-num-input:focus { border-color:#ea580c;background:#fff;box-shadow:0 0 0 3px rgba(234,88,12,.12); }
        .sdt-parking-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:14px; }
        @media(max-width:680px) { .sdt-parking-grid{grid-template-columns:1fr 1fr;} }
        .sdt-parking-box { background:linear-gradient(135deg,#fff7ed 0%,#fff 100%);border:1.5px solid #fed7aa;border-radius:14px;padding:16px 14px 12px;display:flex;flex-direction:column;align-items:center;gap:8px; }
        .sdt-parking-icon { width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#ea580c 0%,#f97316 100%);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;box-shadow:0 2px 8px rgba(234,88,12,.25); }
        .sdt-parking-label { font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.3px;text-align:center; }
        .sdt-blocks-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:18px; }
        @media(max-width:680px) { .sdt-blocks-grid{grid-template-columns:repeat(2,1fr);} }
        .sdt-block-chip input { width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:13px;color:#0f172a;background:#f8fafc;outline:none;box-sizing:border-box;font-family:inherit;transition:border-color .18s,box-shadow .18s;text-align:center;font-weight:600; }
        .sdt-block-chip input:focus { border-color:#ea580c;background:#fff;box-shadow:0 0 0 3px rgba(234,88,12,.12); }
        .sdt-block-chip input[readonly] { background:#f1f5f9;color:#94a3b8;cursor:not-allowed; }
        .sdt-block-index { font-size:10px;font-weight:600;color:#94a3b8;text-align:center;margin-top:4px;text-transform:uppercase;letter-spacing:.3px; }
        .sdt-footer { display:flex;justify-content:flex-end;align-items:center;gap:14px;padding:18px 0 4px;border-top:1.5px solid #f1f5f9;margin-top:6px; }
        .sdt-save-btn { display:inline-flex;align-items:center;gap:9px;padding:11px 28px;background:linear-gradient(135deg,#ea580c 0%,#f97316 100%);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;transition:opacity .2s,transform .15s,box-shadow .2s;box-shadow:0 4px 18px rgba(234,88,12,.3);letter-spacing:.2px; }
        .sdt-save-btn:hover:not(:disabled) { opacity:.92;transform:translateY(-1px);box-shadow:0 6px 22px rgba(234,88,12,.38); }
        .sdt-save-btn:disabled { opacity:.6;cursor:not-allowed; }
        .sdt-save-btn-spinner { animation:sdt-spin 1s linear infinite; }
      `}</style>

      <div className="sdt-root">
        {error && (
          <div className="sdt-toast sdt-toast-error">
            <FaTimes style={{ flexShrink: 0, marginTop: 2 }} />{error}
          </div>
        )}
        {successMsg && (
          <div className="sdt-toast sdt-toast-success">
            <FaCheck style={{ flexShrink: 0, marginTop: 2 }} />{successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Logo */}
          <div className="sdt-logo-area">
            {logoPreview
              ? <img src={logoPreview} alt="Society Logo" className="sdt-logo-preview" />
              : <div className="sdt-logo-placeholder"><FaBuilding /></div>
            }
            <div>
              <button type="button" className="sdt-logo-btn" onClick={() => fileInputRef.current?.click()}>
                <FaCamera />{logoPreview ? 'Change Logo' : 'Upload Logo'}
              </button>
              <p className="sdt-logo-hint">PNG, JPG or WEBP · max 2 MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
          </div>

          {/* Basic */}
          <SectionCard icon={FaBuilding} title="Basic Information">
            <div className="sdt-grid">
              <Field label="Society Name" required>
                <Input icon={FaBuilding} type="text" name="societyName" value={form.societyName} readOnly placeholder="Society name" />
              </Field>
              <Field label="Society Type">
                <Select icon={FaInfoCircle} name="societyType" value={form.societyType} onChange={handleChange}>
                  <option value="">Select type…</option>
                  {SOCIETY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Registration Number">
                <Input icon={FaHashtag} type="text" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} placeholder="e.g. MH/PNE/2024/001" />
              </Field>
              <Field label="Society Code">
                <Input icon={FaClipboardList} type="text" name="societyCode" value={form.societyCode} onChange={handleChange} placeholder="e.g. SOC-001" />
              </Field>
              <Field label="Registration Date">
                <Input icon={FaCalendarAlt} type="date" name="registrationDate" value={form.registrationDate} onChange={handleChange} />
              </Field>
            </div>
          </SectionCard>

          {/* Address */}
          <SectionCard icon={FaMapMarkerAlt} title="Address & Location">
            <div className="sdt-grid">
              <Field label="Street / Area" required colSpan={2}>
                <Textarea name="street" rows={2} value={form.street} onChange={handleChange} placeholder="Building number, street name, locality…" />
              </Field>
              <Field label="City" required>
                <Input type="text" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Pune" />
              </Field>
              <Field label="State" required>
                <Input type="text" name="state" value={form.state} onChange={handleChange} placeholder="e.g. Maharashtra" />
              </Field>
              <Field label="PIN / ZIP Code">
                <Input type="text" name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="e.g. 411001" />
              </Field>
              <Field label="Country">
                <Input type="text" name="country" value={form.country} onChange={handleChange} placeholder="India" />
              </Field>
            </div>
          </SectionCard>

          {/* Contact */}
          <SectionCard icon={FaPhone} title="Contact Details">
            <div className="sdt-grid">
              <Field label="Contact Phone">
                <Input icon={FaPhone} type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+91 98765 43210" />
              </Field>
              <Field label="Contact Email">
                <Input icon={FaEnvelope} type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="admin@mysociety.in" />
              </Field>
            </div>
          </SectionCard>

          {/* Blocks */}
          <SectionCard icon={FaLayerGroup} title="Blocks / Wings Configuration">
            <div style={{ maxWidth: 280 }}>
              <Field label="Number of Blocks / Wings">
                <input className="sdt-num-input" type="number" name="numberOfBlocks" min={0} max={50} value={form.numberOfBlocks} onChange={handleChange} placeholder="e.g. 4" />
              </Field>
            </div>
            {blocks.length > 0 && (
              <div className="sdt-blocks-grid">
                {blocks.map((block, idx) => {
                  const isSaved = idx < savedBlocks.length;
                  return (
                    <div className="sdt-block-chip" key={idx}>
                      <input type="text" required value={block} readOnly={isSaved}
                        onChange={isSaved ? undefined : (e) => handleBlockChange(idx, e.target.value)}
                        placeholder={`Wing ${idx + 1}`} />
                      <div className="sdt-block-index">Block {idx + 1}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Parking */}
          <SectionCard icon={FaParking} title="Parking Configuration">
            <div className="sdt-parking-grid" style={{ marginBottom: 20 }}>
              {[
                { icon: FaCar, label: '4-Wheeler', name: 'fourWheeler' },
                { icon: FaMotorcycle, label: '2-Wheeler', name: 'twoWheeler' },
                { icon: FaParking, label: 'Visitor', name: 'visitorParking' },
                { icon: FaChargingStation, label: 'EV Charging', name: 'evCharging' },
              ].map(({ icon: Ico, label, name }) => (
                <div className="sdt-parking-box" key={name}>
                  <div className="sdt-parking-icon"><Ico /></div>
                  <div className="sdt-parking-label">{label}</div>
                  <input className="sdt-num-input" type="number" name={name} min={0} value={form[name]} onChange={handleChange}
                    style={{ textAlign: 'center', fontWeight: 700, fontSize: 16 }} />
                </div>
              ))}
            </div>
            <Field label="Allocation Method">
              <Select name="allocationMethod" value={form.allocationMethod} onChange={handleChange}>
                <option value="By Society">By Society</option>
                <option value="First Come First Serve">First Come First Serve</option>
                <option value="By Lottery">By Lottery</option>
                <option value="By Flat Size">By Flat Size</option>
              </Select>
            </Field>
          </SectionCard>

          {/* Project Info */}
          <SectionCard icon={FaClipboardList} title="Project Information">
            <div className="sdt-grid">
              <Field label="Project Name">
                <Input type="text" name="projectName" value={form.projectName} onChange={handleChange} placeholder="e.g. Green Valley Phase 2" />
              </Field>
              <Field label="Developer / Builder Name">
                <Input type="text" name="developerName" value={form.developerName} onChange={handleChange} placeholder="e.g. Godrej Properties" />
              </Field>
              <Field label="Property Type">
                <Input type="text" name="propertyType" value={form.propertyType} onChange={handleChange} placeholder="e.g. Apartment, Villa, Duplex" />
              </Field>
              <Field label="Number of Buildings">
                <input className="sdt-num-input" type="number" name="numberOfBuildings" min={0} value={form.numberOfBuildings} onChange={handleChange} placeholder="e.g. 5" />
              </Field>
              <Field label="Total Project Area (sq ft)">
                <input className="sdt-num-input" type="number" name="totalProjectArea" min={0} value={form.totalProjectArea} onChange={handleChange} placeholder="e.g. 200000" />
              </Field>
              <Field label="Total Developed Area (sq ft)">
                <input className="sdt-num-input" type="number" name="totalDevelopedArea" min={0} value={form.totalDevelopedArea} onChange={handleChange} placeholder="e.g. 150000" />
              </Field>
              <Field label="Project Start Date">
                <Input icon={FaCalendarAlt} type="date" name="projectStartDate" value={form.projectStartDate} onChange={handleChange} />
              </Field>
              <Field label="Expected Completion Date">
                <Input icon={FaCalendarAlt} type="date" name="expectedCompletionDate" value={form.expectedCompletionDate} onChange={handleChange} />
              </Field>
              <Field label="Actual Completion Date">
                <Input icon={FaCalendarAlt} type="date" name="actualCompletionDate" value={form.actualCompletionDate} onChange={handleChange} />
              </Field>
              <Field label="Possession Start Date">
                <Input icon={FaCalendarAlt} type="date" name="possessionStartDate" value={form.possessionStartDate} onChange={handleChange} />
              </Field>
            </div>
          </SectionCard>

          {/* Footer */}
          <div className="sdt-footer">
            <button type="submit" className="sdt-save-btn" disabled={submitting}>
              {submitting
                ? <><FaSpinner className="sdt-save-btn-spinner" />Saving…</>
                : <><FaCheck />Save Society Details</>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SocietyDetailsTab;

