import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Building2,
  User,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  INITIAL_REGISTRATION_FORM,
  TENANT_FORM_OPTIONS,
  buildTenantSubmissionPayload,
  getEligibleFlatsForUser,
  getMockFlats,
  registerMockTenant,
  resolveTenantViewContext,
  validateTenantRegistration,
} from './tenantMockData';

const getControlClass = (hasError) =>
  `w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
      : 'border-gray-200 focus:border-[#EA580C] focus:ring-orange-500/20'
  }`;

const FieldLabel = ({ htmlFor, label, required = false }) => (
  <label htmlFor={htmlFor} className="block text-xs font-bold text-gray-700 mb-1.5">
    {label}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const FieldError = ({ message }) =>
  message ? (
    <p role="alert" className="text-xs text-red-500 mt-1 font-medium">
      {message}
    </p>
  ) : null;

const SectionCard = ({ stepNumber, title, subtitle, optional = false, icon: Icon, children }) => (
  <section className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
    <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50/40">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-[#FFF3E8] text-[#EA580C] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-[#0F172A]">
              {stepNumber}. {title}
            </h2>
            {optional && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500">
                Optional
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>

    <div className="p-5 sm:p-6">{children}</div>
  </section>
);

/**
 * Complete 4-section Tenant Registration Form UI (mock-data backed, frontend only).
 */
const TenantRegistrationPage = () => {
  const navigate = useNavigate();
  const { societyId } = useParams();

  const viewContext = useMemo(() => resolveTenantViewContext(), []);
  const eligibleFlats = useMemo(
    () => getEligibleFlatsForUser(getMockFlats(), viewContext),
    [viewContext]
  );

  const [formData, setFormData] = useState(INITIAL_REGISTRATION_FORM);
  const [errors, setErrors] = useState({});

  const targetSocietyId = societyId || localStorage.getItem('societyDatabase');
  const listingPath = targetSocietyId
    ? `/${targetSocietyId}/dashboard/tenant`
    : '/dashboard/tenant';

  if (!viewContext.hasAccess) {
    return null;
  }

  const selectedFlat = eligibleFlats.find((flat) => flat.id === formData.flatId) || null;

  const updateField = (field, value, errorKey = field) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const handleEmploymentTypeChange = (nextType) => {
    setFormData((prev) => ({
      ...prev,
      employmentType: nextType,
      // Explicitly clear fields belonging to any unselected employment type
      companyName: nextType === 'Salaried' ? prev.companyName : '',
      companyDescription: nextType === 'Salaried' ? prev.companyDescription : '',
      organizationName: nextType === 'Self Employed' ? prev.organizationName : '',
      organizationAddress: nextType === 'Self Employed' ? prev.organizationAddress : '',
      yearOfIncorporation: nextType === 'Self Employed' ? prev.yearOfIncorporation : '',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateTenantRegistration(formData, eligibleFlats);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the highlighted validation errors.');
      return;
    }

    const payload = buildTenantSubmissionPayload(formData, eligibleFlats);
    const created = registerMockTenant(payload, viewContext);
    toast.success(`${created.name} registered for ${created.wing} / ${created.flatNumber}.`);
    navigate(listingPath);
  };

  return (
    <div className="w-full space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(listingPath)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#EA580C] transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tenant Management
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            New Tenant Registration
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Register a new tenant and assign an eligible vacant flat.
          </p>
        </div>

        {viewContext.isOwner && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#EA580C] border border-orange-100 w-fit">
            Owner Flat View
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Section 1: Personal Details */}
        <SectionCard
          stepNumber={1}
          title="Personal Details"
          subtitle="Basic contact and demographic information of the tenant."
          icon={User}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <FieldLabel htmlFor="tenant-full-name" label="Full Name" required />
                <input
                  id="tenant-full-name"
                  type="text"
                  placeholder="e.g. Rahul Patil"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className={getControlClass(Boolean(errors.fullName))}
                />
                <FieldError message={errors.fullName} />
              </div>

              <div>
                <FieldLabel htmlFor="tenant-mobile" label="Mobile Number" required />
                <input
                  id="tenant-mobile"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  maxLength={14}
                  value={formData.mobileNumber}
                  onChange={(e) => updateField('mobileNumber', e.target.value)}
                  className={getControlClass(Boolean(errors.mobileNumber))}
                />
                <FieldError message={errors.mobileNumber} />
              </div>

              <div>
                <FieldLabel htmlFor="tenant-email" label="Email" />
                <input
                  id="tenant-email"
                  type="email"
                  placeholder="e.g. tenant@email.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={getControlClass(Boolean(errors.email))}
                />
                <FieldError message={errors.email} />
              </div>

              <div>
                <FieldLabel htmlFor="tenant-dob" label="Date of Birth" />
                <input
                  id="tenant-dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className={getControlClass(false)}
                />
              </div>

              <div>
                <FieldLabel htmlFor="tenant-gender" label="Gender" />
                <select
                  id="tenant-gender"
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className={getControlClass(false)}
                >
                  <option value="">Select Gender</option>
                  {TENANT_FORM_OPTIONS.genders.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="tenant-emergency-contact" label="Emergency Contact Number" />
                <input
                  id="tenant-emergency-contact"
                  type="tel"
                  placeholder="e.g. 9823012345"
                  maxLength={14}
                  value={formData.emergencyContactNumber}
                  onChange={(e) => updateField('emergencyContactNumber', e.target.value)}
                  className={getControlClass(Boolean(errors.emergencyContactNumber))}
                />
                <FieldError message={errors.emergencyContactNumber} />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="tenant-address" label="Complete Address" />
              <textarea
                id="tenant-address"
                rows={3}
                placeholder="Permanent or previous residential address..."
                value={formData.completeAddress}
                onChange={(e) => updateField('completeAddress', e.target.value)}
                className={getControlClass(false)}
              />
            </div>
          </div>
        </SectionCard>

        {/* Section 2: Professional Details (Optional) */}
        <SectionCard
          stepNumber={2}
          title="Professional Details"
          subtitle="Employment background for society verification records."
          optional
          icon={Briefcase}
        >
          <div className="space-y-5">
            <div className="max-w-sm">
              <FieldLabel htmlFor="tenant-employment-type" label="Employment Type" />
              <select
                id="tenant-employment-type"
                value={formData.employmentType}
                onChange={(e) => handleEmploymentTypeChange(e.target.value)}
                className={getControlClass(false)}
              >
                <option value="">Select Employment Type</option>
                {TENANT_FORM_OPTIONS.employmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {formData.employmentType === 'Salaried' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                <div>
                  <FieldLabel htmlFor="tenant-company-name" label="Company Name" />
                  <input
                    id="tenant-company-name"
                    type="text"
                    placeholder="e.g. Infosys Ltd."
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    className={getControlClass(false)}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="tenant-company-desc" label="Company Description" />
                  <input
                    id="tenant-company-desc"
                    type="text"
                    placeholder="e.g. IT Services / Role & Department"
                    value={formData.companyDescription}
                    onChange={(e) => updateField('companyDescription', e.target.value)}
                    className={getControlClass(false)}
                  />
                </div>
              </div>
            )}

            {formData.employmentType === 'Self Employed' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
                <div>
                  <FieldLabel htmlFor="tenant-org-name" label="Organization Name" />
                  <input
                    id="tenant-org-name"
                    type="text"
                    placeholder="e.g. Patil Enterprises"
                    value={formData.organizationName}
                    onChange={(e) => updateField('organizationName', e.target.value)}
                    className={getControlClass(false)}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="tenant-org-address" label="Organization Address" />
                  <input
                    id="tenant-org-address"
                    type="text"
                    placeholder="e.g. FC Road, Pune"
                    value={formData.organizationAddress}
                    onChange={(e) => updateField('organizationAddress', e.target.value)}
                    className={getControlClass(false)}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="tenant-org-year" label="Year of Incorporation" />
                  <input
                    id="tenant-org-year"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="e.g. 2019"
                    value={formData.yearOfIncorporation}
                    onChange={(e) => updateField('yearOfIncorporation', e.target.value)}
                    className={getControlClass(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Section 3: Tenancy Details */}
        <SectionCard
          stepNumber={3}
          title="Tenancy Details"
          subtitle="Assign an owner-allocated vacant flat, allotment month, and current status."
          icon={Building2}
        >
          <div className="space-y-5">
            {eligibleFlats.length === 0 && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-800"
              >
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">No eligible vacant flats available</p>
                  <p className="mt-0.5 text-amber-700">
                    Only flats with an assigned Owner and Vacant occupancy status can be allotted to a new tenant.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <FieldLabel htmlFor="tenant-flat-select" label="Select Flat" required />
                <select
                  id="tenant-flat-select"
                  value={formData.flatId}
                  disabled={eligibleFlats.length === 0}
                  onChange={(e) => updateField('flatId', e.target.value)}
                  className={`${getControlClass(Boolean(errors.flatId))} disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {eligibleFlats.length === 0
                      ? 'No eligible vacant flats available'
                      : 'Select an eligible vacant flat'}
                  </option>
                  {eligibleFlats.map((flat) => (
                    <option key={flat.id} value={flat.id}>
                      {flat.flatNumber} — {flat.wing} (Owner: {flat.ownerName})
                    </option>
                  ))}
                </select>
                <FieldError message={errors.flatId} />
              </div>

              <div>
                <FieldLabel htmlFor="tenant-allotted-month" label="Allotted Month" required />
                <div className="grid grid-cols-2 gap-2.5">
                  <select
                    id="tenant-allotted-month"
                    aria-label="Allotted Month"
                    value={formData.allottedMonthName}
                    onChange={(e) =>
                      updateField('allottedMonthName', e.target.value, 'allottedMonth')
                    }
                    className={getControlClass(Boolean(errors.allottedMonth))}
                  >
                    <option value="">Month</option>
                    {TENANT_FORM_OPTIONS.months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>

                  <select
                    id="tenant-allotted-year"
                    aria-label="Allotted Year"
                    value={formData.allottedYear}
                    onChange={(e) => updateField('allottedYear', e.target.value, 'allottedMonth')}
                    className={getControlClass(Boolean(errors.allottedMonth))}
                  >
                    <option value="">Year</option>
                    {TENANT_FORM_OPTIONS.years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <FieldError message={errors.allottedMonth} />
              </div>

              <div>
                <FieldLabel htmlFor="tenant-status" label="Current Status" />
                <select
                  id="tenant-status"
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className={getControlClass(false)}
                >
                  {TENANT_FORM_OPTIONS.statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedFlat && (
              <div className="rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-700">
                <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800">
                  <UserCheck className="w-4 h-4 text-[#EA580C]" />
                  Flat Owner: {selectedFlat.ownerName}
                </span>
                <span>Wing / Block: {selectedFlat.wing}</span>
                <span>Flat Number: {selectedFlat.flatNumber}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                  Current Occupancy: {selectedFlat.occupancyStatus}
                </span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Section 4: Reference Details (Optional) */}
        <SectionCard
          stepNumber={4}
          title="Reference Details"
          subtitle="Optional local contact or guarantor reference for the tenant."
          optional
          icon={Users}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <FieldLabel htmlFor="tenant-reference-name" label="Reference Name" />
              <input
                id="tenant-reference-name"
                type="text"
                placeholder="e.g. Suresh Kulkarni"
                value={formData.referenceName}
                onChange={(e) => updateField('referenceName', e.target.value)}
                className={getControlClass(false)}
              />
            </div>

            <div>
              <FieldLabel htmlFor="tenant-reference-contact" label="Reference Contact Number" />
              <input
                id="tenant-reference-contact"
                type="tel"
                placeholder="e.g. 9823456789"
                maxLength={14}
                value={formData.referenceContactNumber}
                onChange={(e) => updateField('referenceContactNumber', e.target.value)}
                className={getControlClass(Boolean(errors.referenceContactNumber))}
              />
              <FieldError message={errors.referenceContactNumber} />
            </div>

            <div>
              <FieldLabel htmlFor="tenant-reference-relation" label="Reference Relation" />
              <select
                id="tenant-reference-relation"
                value={formData.referenceRelation}
                onChange={(e) => updateField('referenceRelation', e.target.value)}
                className={getControlClass(false)}
              >
                <option value="">Select Relation</option>
                {TENANT_FORM_OPTIONS.relations.map((relation) => (
                  <option key={relation} value={relation}>
                    {relation}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Form Actions */}
        <div className="bg-white rounded-2xl border border-gray-200/80 px-5 sm:px-6 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(listingPath)}
            className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#DC4E07] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Tenant</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TenantRegistrationPage;
