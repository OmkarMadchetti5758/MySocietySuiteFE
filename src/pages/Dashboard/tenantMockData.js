/**
 * Mock tenant dataset and pure helpers for the Tenant Management UI.
 * Initial 5 rows and summary totals (24 total: 18 Active, 2 Inactive, 4 Vacated)
 * match the approved UI specification and reference design.
 */

export const INITIAL_TENANTS = [
  {
    id: 1,
    name: 'Rahul Patil',
    contactNumber: '9876543210',
    email: 'rahul.patil@email.com',
    wing: 'Wing-A',
    flatNumber: 'A-101',
    ownerName: 'Gajanan Shinde',
    allottedMonth: 'Apr 2026',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Sneha Joshi',
    contactNumber: '9823012345',
    email: 'sneha.joshi@email.com',
    wing: 'Wing-A',
    flatNumber: 'A-102',
    ownerName: 'Gajanan Shinde',
    allottedMonth: 'Mar 2026',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Amit Kulkarni',
    contactNumber: '9765432189',
    email: 'amit.kulkarni@email.com',
    wing: 'Wing-B',
    flatNumber: 'B-201',
    ownerName: 'Rohit Deshmukh',
    allottedMonth: 'Jan 2026',
    status: 'Inactive',
  },
  {
    id: 4,
    name: 'Priya More',
    contactNumber: '9098765432',
    email: 'priya.more@email.com',
    wing: 'Wing-B',
    flatNumber: 'B-203',
    ownerName: 'Rohit Deshmukh',
    allottedMonth: 'Oct 2025',
    status: 'Vacated',
  },
  {
    id: 5,
    name: 'Nilesh Desai',
    contactNumber: '9823456789',
    email: 'nilesh.desai@email.com',
    wing: 'Wing-C',
    flatNumber: 'C-301',
    ownerName: 'Sachin Pawar',
    allottedMonth: 'Aug 2025',
    status: 'Active',
  },
  {
    id: 6,
    name: 'Pooja Chavan',
    contactNumber: '9811223344',
    email: 'pooja.chavan@email.com',
    wing: 'Wing-A',
    flatNumber: 'A-103',
    ownerName: 'Madhav Gokhale',
    allottedMonth: 'Feb 2026',
    status: 'Active',
  },
  {
    id: 7,
    name: 'Rohan Shinde',
    contactNumber: '9822334455',
    email: 'rohan.shinde@email.com',
    wing: 'Wing-A',
    flatNumber: 'A-104',
    ownerName: 'Sunita Gokhale',
    allottedMonth: 'Jan 2026',
    status: 'Active',
  },
  {
    id: 8,
    name: 'Kavita Bhosale',
    contactNumber: '9833445566',
    email: 'kavita.bhosale@email.com',
    wing: 'Wing-B',
    flatNumber: 'B-202',
    ownerName: 'Prakash Kale',
    allottedMonth: 'Dec 2025',
    status: 'Active',
  },
  {
    id: 9,
    name: 'Siddharth Nair',
    contactNumber: '9844556677',
    email: 'siddharth.nair@email.com',
    wing: 'Wing-B',
    flatNumber: 'B-204',
    ownerName: 'Anjali Patwardhan',
    allottedMonth: 'Nov 2025',
    status: 'Active',
  },
  {
    id: 10,
    name: 'Meera Sawant',
    contactNumber: '9855667788',
    email: 'meera.sawant@email.com',
    wing: 'Wing-C',
    flatNumber: 'C-302',
    ownerName: 'Sachin Pawar',
    allottedMonth: 'Oct 2025',
    status: 'Inactive',
  },
  {
    id: 11,
    name: 'Vikram Jadhav',
    contactNumber: '9866778899',
    email: 'vikram.jadhav@email.com',
    wing: 'Wing-C',
    flatNumber: 'C-303',
    ownerName: 'Deepak Salunkhe',
    allottedMonth: 'Sep 2025',
    status: 'Active',
  },
  {
    id: 12,
    name: 'Neha Phadke',
    contactNumber: '9877889900',
    email: 'neha.phadke@email.com',
    wing: 'Wing-A',
    flatNumber: 'A-201',
    ownerName: 'Milind Apte',
    allottedMonth: 'Sep 2025',
    status: 'Vacated',
  },
  {
    id: 13,
    name: 'Aditya Gaikwad',
    contactNumber: '9888990011',
    email: 'aditya.gaikwad@email.com',
    wing: 'Wing-A',
    flatNumber: 'A-202',
    ownerName: 'Madhav Gokhale',
    allottedMonth: 'Aug 2025',
    status: 'Active',
  },
  {
    id: 14,
    name: 'Tanvi Rane',
    contactNumber: '9899001122',
    email: 'tanvi.rane@email.com',
    wing: 'Wing-B',
    flatNumber: 'B-301',
    ownerName: 'Prakash Kale',
    allottedMonth: 'Jul 2025',
    status: 'Active',
  },
  {
    id: 15,
    name: 'Omkar Kadam',
    contactNumber: '9711223344',
    email: 'omkar.kadam@email.com',
    wing: 'Wing-B',
    flatNumber: 'B-302',
    ownerName: 'Anjali Patwardhan',
    allottedMonth: 'Jul 2025',
    status: 'Vacated',
  },
  {
    id: 16,
    name: 'Swati Mane',
    contactNumber: '9722334455',
    email: 'swati.mane@email.com',
    wing: 'Wing-C',
    flatNumber: 'C-304',
    ownerName: 'Deepak Salunkhe',
    allottedMonth: 'Jun 2025',
    status: 'Active',
  },
  {
    id: 17,
    name: 'Kunal Deshpande',
    contactNumber: '9733445566',
    email: 'kunal.deshpande@email.com',
    wing: 'Wing-D',
    flatNumber: 'D-101',
    ownerName: 'Ramesh Bhat',
    allottedMonth: 'Jun 2025',
    status: 'Active',
  },
  {
    id: 18,
    name: 'Manali Thorat',
    contactNumber: '9744556677',
    email: 'manali.thorat@email.com',
    wing: 'Wing-D',
    flatNumber: 'D-102',
    ownerName: 'Ramesh Bhat',
    allottedMonth: 'May 2025',
    status: 'Active',
  },
  {
    id: 19,
    name: 'Prasad Kulkarni',
    contactNumber: '9755667788',
    email: 'prasad.kulkarni@email.com',
    wing: 'Wing-D',
    flatNumber: 'D-201',
    ownerName: 'Seema Dixit',
    allottedMonth: 'May 2025',
    status: 'Active',
  },
  {
    id: 20,
    name: 'Aarti Kamat',
    contactNumber: '9766778899',
    email: 'aarti.kamat@email.com',
    wing: 'Wing-A',
    flatNumber: 'A-203',
    ownerName: 'Sunita Gokhale',
    allottedMonth: 'Apr 2025',
    status: 'Vacated',
  },
  {
    id: 21,
    name: 'Nikhil Jagtap',
    contactNumber: '9777889900',
    email: 'nikhil.jagtap@email.com',
    wing: 'Wing-B',
    flatNumber: 'B-303',
    ownerName: 'Milind Apte',
    allottedMonth: 'Apr 2025',
    status: 'Active',
  },
  {
    id: 22,
    name: 'Shraddha Babar',
    contactNumber: '9788990011',
    email: 'shraddha.babar@email.com',
    wing: 'Wing-C',
    flatNumber: 'C-401',
    ownerName: 'Seema Dixit',
    allottedMonth: 'Mar 2025',
    status: 'Active',
  },
  {
    id: 23,
    name: 'Harshal Mahajan',
    contactNumber: '9799001122',
    email: 'harshal.mahajan@email.com',
    wing: 'Wing-D',
    flatNumber: 'D-202',
    ownerName: 'Kishore Patankar',
    allottedMonth: 'Feb 2025',
    status: 'Active',
  },
  {
    id: 24,
    name: 'Pallavi Shelar',
    contactNumber: '9611223344',
    email: 'pallavi.shelar@email.com',
    wing: 'Wing-D',
    flatNumber: 'D-301',
    ownerName: 'Kishore Patankar',
    allottedMonth: 'Jan 2025',
    status: 'Active',
  },
];

const ROLE_ALIASES = {
  committee_member: 'admin',
  committee_admin: 'admin',
  resident: 'resident_owner',
};

/**
 * Resolves the signed-in user's Tenant module visibility mode from localStorage.
 * Returns { hasAccess, isAdmin, isOwner, user } without altering backend RBAC logic.
 */
export function resolveTenantViewContext() {
  try {
    const rawUser = localStorage.getItem('user');
    const rawRoleKeys = localStorage.getItem('roleKeys');
    const user = rawUser ? JSON.parse(rawUser) : {};
    const parsedKeys = rawRoleKeys ? JSON.parse(rawRoleKeys) : [];
    const roleKeys = Array.isArray(user.roleKeys)
      ? user.roleKeys
      : Array.isArray(parsedKeys)
        ? parsedKeys
        : [];

    const normalized = new Set(
      [user.role, ...roleKeys]
        .filter(Boolean)
        .map((role) => ROLE_ALIASES[role] || role)
    );

    const isVendor = normalized.has('vendor');
    const isGuard = normalized.has('security_guard') || normalized.has('security');
    if (isVendor || isGuard) {
      return { hasAccess: false, isAdmin: false, isOwner: false, user };
    }

    const isAdmin = normalized.has('admin') || normalized.has('super_admin');
    const isOwner = normalized.has('resident_owner');

    return {
      hasAccess: isAdmin || isOwner,
      isAdmin,
      isOwner: !isAdmin && isOwner,
      user,
    };
  } catch {
    return { hasAccess: false, isAdmin: false, isOwner: false, user: {} };
  }
}

/**
 * Mock society flats used for tenancy allotment eligibility checks.
 * Includes eligible (owner-assigned + Vacant), Occupied, and unassigned-owner flats
 * so eligibility filtering can be verified accurately without backend calls.
 */
export const INITIAL_MOCK_FLATS = [
  // Eligible: Owner assigned + Vacant
  { id: 'flat-a-105', flatNumber: 'A-105', wing: 'Wing-A', ownerName: 'Gajanan Shinde', occupancyStatus: 'Vacant' },
  { id: 'flat-b-203', flatNumber: 'B-203', wing: 'Wing-B', ownerName: 'Rohit Deshmukh', occupancyStatus: 'Vacant' },
  { id: 'flat-a-201', flatNumber: 'A-201', wing: 'Wing-A', ownerName: 'Milind Apte', occupancyStatus: 'Vacant' },
  { id: 'flat-b-302', flatNumber: 'B-302', wing: 'Wing-B', ownerName: 'Anjali Patwardhan', occupancyStatus: 'Vacant' },
  { id: 'flat-a-203', flatNumber: 'A-203', wing: 'Wing-A', ownerName: 'Sunita Gokhale', occupancyStatus: 'Vacant' },
  { id: 'flat-c-305', flatNumber: 'C-305', wing: 'Wing-C', ownerName: 'Sachin Pawar', occupancyStatus: 'Vacant' },
  { id: 'flat-d-103', flatNumber: 'D-103', wing: 'Wing-D', ownerName: 'Ramesh Bhat', occupancyStatus: 'Vacant' },
  { id: 'flat-d-203', flatNumber: 'D-203', wing: 'Wing-D', ownerName: 'Seema Dixit', occupancyStatus: 'Vacant' },

  // Ineligible: Already Occupied (must be excluded)
  { id: 'flat-a-101', flatNumber: 'A-101', wing: 'Wing-A', ownerName: 'Gajanan Shinde', occupancyStatus: 'Occupied' },
  { id: 'flat-a-102', flatNumber: 'A-102', wing: 'Wing-A', ownerName: 'Gajanan Shinde', occupancyStatus: 'Occupied' },
  { id: 'flat-b-201', flatNumber: 'B-201', wing: 'Wing-B', ownerName: 'Rohit Deshmukh', occupancyStatus: 'Occupied' },
  { id: 'flat-c-301', flatNumber: 'C-301', wing: 'Wing-C', ownerName: 'Sachin Pawar', occupancyStatus: 'Occupied' },
  { id: 'flat-d-202', flatNumber: 'D-202', wing: 'Wing-D', ownerName: 'Kishore Patankar', occupancyStatus: 'Occupied' },
  { id: 'flat-d-301', flatNumber: 'D-301', wing: 'Wing-D', ownerName: 'Kishore Patankar', occupancyStatus: 'Occupied' },
  { id: 'flat-d-302', flatNumber: 'D-302', wing: 'Wing-D', ownerName: 'Kishore Patankar', occupancyStatus: 'Occupied' },

  // Ineligible: Vacant without assigned Owner (must be excluded)
  { id: 'flat-a-401', flatNumber: 'A-401', wing: 'Wing-A', ownerName: '', occupancyStatus: 'Vacant' },
  { id: 'flat-c-402', flatNumber: 'C-402', wing: 'Wing-C', ownerName: null, occupancyStatus: 'Vacant' },
  { id: 'flat-d-401', flatNumber: 'D-401', wing: 'Wing-D', ownerName: '', occupancyStatus: 'Vacant' },
];

const FALLBACK_OWNER_VACANT_FLAT_ID = 'flat-a-105';
const FALLBACK_OWNER_TENANT_IDS = new Set([1, 2]);

// Module-scoped UI mock state persisted across route transitions during the SPA session.
let mockTenantsStore = INITIAL_TENANTS.map((tenant) => ({ ...tenant }));
let mockFlatsStore = INITIAL_MOCK_FLATS.map((flat) => ({ ...flat }));
let nextTenantNumericId = 25;

export function getMockTenants() {
  return mockTenantsStore.map((tenant) => ({ ...tenant }));
}

export function getMockFlats() {
  return mockFlatsStore.map((flat) => ({ ...flat }));
}

export function resetMockTenantStore() {
  mockTenantsStore = INITIAL_TENANTS.map((tenant) => ({ ...tenant }));
  mockFlatsStore = INITIAL_MOCK_FLATS.map((flat) => ({ ...flat }));
  nextTenantNumericId = 25;
}

function ownerMatchesFlatOrTenant(record, user) {
  const ownerName = (user?.name || '').trim().toLowerCase();
  const ownerFlat = (user?.flatNumber || '').trim().toLowerCase();

  const nameMatch = ownerName && (record.ownerName || '').trim().toLowerCase() === ownerName;
  const flatMatch =
    ownerFlat &&
    ((record.flatNumber || '').toLowerCase() === ownerFlat ||
      `${record.wing} / ${record.flatNumber}`.toLowerCase() === ownerFlat ||
      (record.flatNumber || '').toLowerCase().endsWith(ownerFlat.replace(/^wing-/i, '')));
  return Boolean(nameMatch || flatMatch);
}

/**
 * Filters tenants according to role context, incorporating newly registered tenants
 * for both Society Admin and Resident Owner accounts.
 */
export function getRoleScopedTenants(tenants, { hasAccess, isAdmin, isOwner, user }) {
  if (!hasAccess) return [];
  if (isAdmin) return tenants;
  if (!isOwner) return [];

  const knownMockOwner =
    tenants.some((tenant) => ownerMatchesFlatOrTenant(tenant, user)) ||
    mockFlatsStore.some((flat) => ownerMatchesFlatOrTenant(flat, user));

  if (knownMockOwner) {
    return tenants.filter((tenant) => ownerMatchesFlatOrTenant(tenant, user));
  }

  const displayOwner = user?.name?.trim() || 'Flat Owner';
  return tenants
    .filter((tenant) => tenant.registeredByFallbackOwner || FALLBACK_OWNER_TENANT_IDS.has(tenant.id))
    .map((tenant) => ({
      ...tenant,
      ownerName: displayOwner,
    }));
}

/**
 * Returns ONLY eligible flats (owner assigned AND occupancyStatus === 'Vacant').
 * Society Admin sees all eligible society flats; Resident Owner sees only their own.
 */
export function getEligibleFlatsForUser(flats, { hasAccess, isAdmin, isOwner, user }) {
  if (!hasAccess) return [];

  const ownerAssignedVacantFlats = flats.filter(
    (flat) => Boolean(flat.ownerName && flat.ownerName.trim()) && flat.occupancyStatus === 'Vacant'
  );

  if (isAdmin) {
    return ownerAssignedVacantFlats;
  }

  if (!isOwner) return [];

  const ownsKnownFlats = flats.some((flat) => ownerMatchesFlatOrTenant(flat, user));
  if (ownsKnownFlats) {
    return ownerAssignedVacantFlats.filter((flat) => ownerMatchesFlatOrTenant(flat, user));
  }

  const displayOwner = user?.name?.trim() || 'Flat Owner';
  return ownerAssignedVacantFlats
    .filter((flat) => flat.id === FALLBACK_OWNER_VACANT_FLAT_ID)
    .map((flat) => ({
      ...flat,
      ownerName: displayOwner,
    }));
}

/**
 * Adds a newly registered tenant into local mock state and updates the flat's
 * mock occupancy status to Occupied when Status is Active.
 */
export function registerMockTenant(submission, viewContext) {
  const flatRecord = mockFlatsStore.find((flat) => flat.id === submission.flatId);
  const ownerName =
    submission.ownerName ||
    flatRecord?.ownerName ||
    viewContext?.user?.name?.trim() ||
    'Flat Owner';

  const isFallbackOwnerUser =
    Boolean(viewContext?.isOwner) &&
    !INITIAL_TENANTS.some((tenant) => ownerMatchesFlatOrTenant(tenant, viewContext.user)) &&
    !INITIAL_MOCK_FLATS.some((flat) => ownerMatchesFlatOrTenant(flat, viewContext.user));

  const newTenant = {
    id: nextTenantNumericId++,
    flatId: submission.flatId,
    name: submission.fullName,
    contactNumber: submission.mobileNumber,
    email: submission.email || '',
    wing: flatRecord?.wing || submission.wing,
    flatNumber: flatRecord?.flatNumber || submission.flatNumber,
    ownerName,
    allottedMonth: submission.allottedMonth,
    status: submission.status || 'Active',
    personalDetails: submission.personalDetails,
    professionalDetails: submission.professionalDetails,
    referenceDetails: submission.referenceDetails,
    createdAt: new Date().toISOString(),
    registeredByFallbackOwner: isFallbackOwnerUser,
  };

  mockTenantsStore = [newTenant, ...mockTenantsStore];

  if (flatRecord && newTenant.status === 'Active') {
    flatRecord.occupancyStatus = 'Occupied';
  }

  return newTenant;
}

/**
 * Updates a tenant's status in local mock state while preserving history records
 * and keeping flat Vacant/Occupied consistency across multiple tenants.
 */
export function updateMockTenantStatus(tenantId, nextStatus) {
  let affectedFlatKey = null;

  mockTenantsStore = mockTenantsStore.map((tenant) => {
    if (tenant.id !== tenantId) return tenant;
    affectedFlatKey = `${tenant.wing}::${tenant.flatNumber}`;
    return { ...tenant, status: nextStatus };
  });

  if (affectedFlatKey) {
    const [wing, flatNumber] = affectedFlatKey.split('::');
    const hasRemainingActiveTenant = mockTenantsStore.some(
      (tenant) =>
        tenant.wing === wing &&
        tenant.flatNumber === flatNumber &&
        tenant.status === 'Active'
    );

    mockFlatsStore = mockFlatsStore.map((flat) => {
      if (flat.wing !== wing || flat.flatNumber !== flatNumber) return flat;
      return {
        ...flat,
        occupancyStatus: hasRemainingActiveTenant ? 'Occupied' : 'Vacant',
      };
    });
  }

  return getMockTenants();
}

export function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

const AVATAR_TONES = [
  'bg-orange-100 text-orange-600',
  'bg-purple-100 text-purple-600',
  'bg-blue-100 text-blue-600',
  'bg-rose-100 text-rose-500',
  'bg-emerald-100 text-emerald-600',
];

export function getAvatarTone(id) {
  return AVATAR_TONES[(Math.max(1, Number(id) || 1) - 1) % AVATAR_TONES.length];
}

const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const TENANT_FORM_OPTIONS = {
  genders: ['Male', 'Female', 'Other'],
  employmentTypes: ['Salaried', 'Self Employed'],
  statuses: ['Active', 'Inactive', 'Vacated'],
  relations: ['Friend', 'Relative', 'Colleague', 'Neighbour', 'Other'],
  months: [
    { value: 'Jan', label: 'January' },
    { value: 'Feb', label: 'February' },
    { value: 'Mar', label: 'March' },
    { value: 'Apr', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'Jun', label: 'June' },
    { value: 'Jul', label: 'July' },
    { value: 'Aug', label: 'August' },
    { value: 'Sep', label: 'September' },
    { value: 'Oct', label: 'October' },
    { value: 'Nov', label: 'November' },
    { value: 'Dec', label: 'December' },
  ],
  years: ['2024', '2025', '2026', '2027', '2028'],
  documentTypes: [
    'Aadhaar Card',
    'PAN Card',
    'Passport',
    'Voter ID',
    'Driving Licence',
    'Address Proof',
    'Rent Agreement',
    'Police Verification Certificate',
    'Owner NOC / Permission Letter',
    'Tenant Photograph',
    'Other Document',
  ],
};

export const MAX_TENANT_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_TENANT_DOCUMENT_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf'];
export const ALLOWED_TENANT_DOCUMENT_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
];

/**
 * Formats a byte count into a human-readable KB or MB string.
 */
export function formatDocumentFileSize(bytes = 0) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return `${kb >= 100 ? Math.round(kb) : kb.toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Validates a selected tenant document against allowed types (JPG, JPEG, PNG, PDF)
 * and maximum file size (5 MB).
 */
export function validateTenantDocumentFile(file) {
  if (!file || typeof file.name !== 'string') {
    return {
      valid: false,
      error: 'Please select a valid document file.',
      isImage: false,
      extension: '',
    };
  }

  const parts = file.name.split('.');
  const extension = parts.length > 1 ? parts.pop().toLowerCase() : '';
  const mimeType = (file.type || '').toLowerCase();

  const isAllowedExtension = ALLOWED_TENANT_DOCUMENT_EXTENSIONS.includes(extension);
  const isAllowedMime = !mimeType || ALLOWED_TENANT_DOCUMENT_MIME_TYPES.includes(mimeType);

  if (!isAllowedExtension || !isAllowedMime) {
    return {
      valid: false,
      error: 'Unsupported file type. Only JPG, JPEG, PNG, and PDF files are allowed.',
      isImage: false,
      extension,
    };
  }

  if (file.size > MAX_TENANT_DOCUMENT_SIZE_BYTES) {
    return {
      valid: false,
      error: 'File size exceeds the maximum limit of 5 MB.',
      isImage: false,
      extension,
    };
  }

  const isImage = extension !== 'pdf' && mimeType !== 'application/pdf';
  return {
    valid: true,
    error: '',
    isImage,
    extension,
  };
}

export const INITIAL_REGISTRATION_FORM = {
  // Section 1: Personal Details
  fullName: '',
  mobileNumber: '',
  email: '',
  dateOfBirth: '',
  gender: '',
  completeAddress: '',
  emergencyContactNumber: '',

  // Section 2: Professional Details (Optional)
  employmentType: '',
  companyName: '',
  companyDescription: '',
  organizationName: '',
  organizationAddress: '',
  yearOfIncorporation: '',

  // Section 3: Tenancy Details
  flatId: '',
  allottedMonthName: '',
  allottedYear: '',
  status: 'Active',

  // Section 4: Reference Details (Optional)
  referenceName: '',
  referenceContactNumber: '',
  referenceRelation: '',
};

export function normalizeIndianMobile(value = '') {
  return String(value).replace(/[\s-]/g, '').replace(/^\+91/, '');
}

/**
 * Validates the tenant registration form across required, format, and flat-eligibility rules.
 */
export function validateTenantRegistration(formData, eligibleFlats = []) {
  const errors = {};

  if (!formData.fullName?.trim()) {
    errors.fullName = 'Full Name is required';
  }

  const compactMobile = normalizeIndianMobile(formData.mobileNumber);
  if (!compactMobile) {
    errors.mobileNumber = 'Mobile Number is required';
  } else if (!INDIAN_MOBILE_REGEX.test(compactMobile)) {
    errors.mobileNumber = 'Enter a valid 10-digit Indian mobile number (starting with 6-9)';
  }

  const trimmedEmail = (formData.email || '').trim();
  if (!trimmedEmail) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Enter a valid email address';
  }

  const compactEmergency = normalizeIndianMobile(formData.emergencyContactNumber);
  if (compactEmergency && !INDIAN_MOBILE_REGEX.test(compactEmergency)) {
    errors.emergencyContactNumber = 'Enter a valid 10-digit Indian mobile number';
  }

  const matchedFlat = eligibleFlats.find((flat) => flat.id === formData.flatId);
  if (!formData.flatId) {
    errors.flatId = 'Please select an eligible vacant flat';
  } else if (!matchedFlat) {
    errors.flatId = 'Selected flat is not eligible for allotment';
  }

  if (!formData.allottedMonthName || !formData.allottedYear) {
    errors.allottedMonth = 'Please select allotted month and year';
  }

  const compactReferenceMobile = normalizeIndianMobile(formData.referenceContactNumber);
  if (compactReferenceMobile && !INDIAN_MOBILE_REGEX.test(compactReferenceMobile)) {
    errors.referenceContactNumber = 'Enter a valid 10-digit Indian mobile number';
  }

  const documents = Array.isArray(formData.documents) ? formData.documents : [];
  if (documents.length > 0) {
    const seenDocTypes = new Set();
    const documentErrors = {};

    documents.forEach((doc) => {
      if (!doc || !doc.id) return;
      const docType = (doc.documentType || '').trim();
      const otherName = (doc.otherDocumentName || '').trim();
      const hasFile = Boolean(doc.file);

      // Completely untouched rows do not block optional registration
      if (!docType && !otherName && !hasFile) {
        return;
      }

      const rowError = {};

      if (!docType) {
        rowError.documentType = 'Please select a document type';
      } else if (seenDocTypes.has(docType)) {
        rowError.documentType = 'This document type is already selected in another row';
      } else {
        seenDocTypes.add(docType);
      }

      if (docType === 'Other Document' && !otherName) {
        rowError.otherDocumentName = 'Please enter the document name';
      }

      if (!hasFile) {
        rowError.file = 'Please upload a file (JPG, JPEG, PNG, or PDF up to 5 MB)';
      }

      if (Object.keys(rowError).length > 0) {
        documentErrors[doc.id] = rowError;
      }
    });

    if (Object.keys(documentErrors).length > 0) {
      errors.documents = documentErrors;
    }
  }

  return errors;
}

/**
 * Builds the clean tenant submission payload, omitting fields from unselected employment types.
 */
export function buildTenantSubmissionPayload(formData, eligibleFlats = []) {
  const selectedFlat = eligibleFlats.find((flat) => flat.id === formData.flatId);

  let professionalDetails = null;
  if (formData.employmentType === 'Salaried') {
    professionalDetails = {
      employmentType: 'Salaried',
      companyName: formData.companyName.trim(),
      companyDescription: formData.companyDescription.trim(),
    };
  } else if (formData.employmentType === 'Self Employed') {
    professionalDetails = {
      employmentType: 'Self Employed',
      organizationName: formData.organizationName.trim(),
      organizationAddress: formData.organizationAddress.trim(),
      yearOfIncorporation: formData.yearOfIncorporation.trim(),
    };
  }

  const referenceName = formData.referenceName.trim();
  const referenceContactNumber = normalizeIndianMobile(formData.referenceContactNumber);
  const referenceRelation = formData.referenceRelation;
  const hasReference = Boolean(referenceName || referenceContactNumber || referenceRelation);

  return {
    fullName: formData.fullName.trim(),
    mobileNumber: normalizeIndianMobile(formData.mobileNumber),
    email: formData.email.trim(),
    flatId: selectedFlat?.id || formData.flatId,
    wing: selectedFlat?.wing || '',
    flatNumber: selectedFlat?.flatNumber || '',
    ownerName: selectedFlat?.ownerName || '',
    allottedMonth: `${formData.allottedMonthName} ${formData.allottedYear}`,
    status: formData.status || 'Active',
    personalDetails: {
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      completeAddress: formData.completeAddress.trim(),
      emergencyContactNumber: normalizeIndianMobile(formData.emergencyContactNumber),
    },
    professionalDetails,
    referenceDetails: hasReference
      ? {
          referenceName,
          referenceContactNumber,
          referenceRelation,
        }
      : null,
  };
}

const MODAL_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function hasDisplayValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== '' && String(value).trim() !== '-';
}

export function formatTenantDateDisplay(dateStr) {
  if (!hasDisplayValue(dateStr)) return '';
  const match = String(dateStr).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr;
  const [, year, month, day] = match;
  const monthLabel = MODAL_MONTHS[Number(month) - 1] || month;
  return `${day} ${monthLabel} ${year}`;
}

/**
 * Builds all four View Details modal sections for a tenant record.
 * Always preserves section headings (including Professional Details and Reference Details)
 * while omitting blank optional fields and keeping only relevant employment-type fields.
 */
export function buildTenantDetailSections(tenant) {
  if (!tenant) return [];

  const personal = tenant.personalDetails || {};
  const prof = tenant.professionalDetails || {};
  const ref = tenant.referenceDetails || {};

  const employmentType = prof.employmentType || tenant.employmentType;
  const professionalFields = [];
  if (hasDisplayValue(employmentType)) {
    professionalFields.push({ label: 'Employment Type', value: employmentType });
    if (employmentType === 'Salaried') {
      professionalFields.push(
        { label: 'Company Name', value: prof.companyName ?? tenant.companyName },
        {
          label: 'Company Description',
          value: prof.companyDescription ?? tenant.companyDescription,
          fullWidth: true,
        }
      );
    } else if (employmentType === 'Self Employed') {
      professionalFields.push(
        { label: 'Organization Name', value: prof.organizationName ?? tenant.organizationName },
        {
          label: 'Organization Address',
          value: prof.organizationAddress ?? tenant.organizationAddress,
          fullWidth: true,
        },
        {
          label: 'Year of Incorporation',
          value: prof.yearOfIncorporation ?? tenant.yearOfIncorporation,
        }
      );
    }
  }

  const rawSections = [
    {
      id: 'personal',
      title: 'Personal Details',
      fields: [
        { label: 'Full Name', value: tenant.name },
        { label: 'Mobile Number', value: tenant.contactNumber },
        { label: 'Email', value: tenant.email },
        {
          label: 'Date of Birth',
          value: formatTenantDateDisplay(personal.dateOfBirth ?? tenant.dateOfBirth),
        },
        { label: 'Gender', value: personal.gender ?? tenant.gender },
        {
          label: 'Emergency Contact',
          value: personal.emergencyContactNumber ?? tenant.emergencyContactNumber,
        },
        {
          label: 'Address',
          value: personal.completeAddress ?? tenant.completeAddress,
          fullWidth: true,
        },
      ],
    },
    {
      id: 'professional',
      title: 'Professional Details',
      emptyMessage: 'No professional details provided.',
      fields: professionalFields,
    },
    {
      id: 'tenancy',
      title: 'Tenancy Details',
      fields: [
        { label: 'Flat / Wing', value: `${tenant.wing} / ${tenant.flatNumber}` },
        { label: 'Owner Name', value: tenant.ownerName },
        { label: 'Allotted Month and Year', value: tenant.allottedMonth },
        { label: 'Current Tenant Status', value: tenant.status, isStatus: true },
      ],
    },
    {
      id: 'reference',
      title: 'Reference Details',
      emptyMessage: 'No reference details provided.',
      fields: [
        { label: 'Reference Name', value: ref.referenceName ?? tenant.referenceName },
        {
          label: 'Reference Contact Number',
          value: ref.referenceContactNumber ?? tenant.referenceContactNumber,
        },
        { label: 'Reference Relation', value: ref.referenceRelation ?? tenant.referenceRelation },
      ],
    },
  ];

  return rawSections.map((section) => ({
    ...section,
    fields: section.fields.filter((field) => hasDisplayValue(field.value)),
  }));
}

