/**
 * Setup Wizard Constants
 * Defines step keys, labels, statuses, and configuration options.
 */

export const SETUP_STEPS = Object.freeze([
  {
    step: 1,
    key: 'society_details',
    title: 'Society Details',
    breadcrumb: 'Society Details',
    subtitle: 'Set up your society legal and registration information.',
  },
  {
    step: 2,
    key: 'property_inventory',
    title: 'Property Inventory & Create',
    breadcrumb: 'Property Inventory & Create',
    subtitle: 'Define property inventory, residential & commercial wings, and parking capacity.',
  },
  {
    step: 3,
    key: 'amenities',
    title: 'Amenities',
    breadcrumb: 'Amenities',
    subtitle: 'Configure the amenities available in your society.',
  },
  {
    step: 4,
    key: 'contacts',
    title: 'Contacts',
    breadcrumb: 'Contact Details',
    subtitle: 'Add important contacts related to your society.',
  },
  {
    step: 5,
    key: 'documents',
    title: 'Documents',
    breadcrumb: 'Document Details',
    subtitle: 'Upload and manage important documents and certificates of your society.',
  },
  {
    step: 6,
    key: 'review_activate',
    title: 'Review & Activate',
    breadcrumb: 'Review & Activate',
    subtitle: 'Review all the information you\'ve added before activating your society.',
  },
]);

export const SETUP_STATUS = Object.freeze({
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
});

export const STEP_STATUS = Object.freeze({
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
});

export const SOCIETY_TYPES = [
  'Mixed (Residential + Commercial)',
  'Residential',
  'Commercial',
  'Co-operative Housing Society',
  'Gated Community / Villa',
];

export const RESIDENTIAL_PROPERTY_TYPES = [
  'Flat / Apartment',
  'Row House',
  'Penthouse',
  'Villa',
  'Duplex',
];

export const RESIDENTIAL_CONFIGURATIONS = [
  '1 RK',
  '1 BHK',
  '2 BHK',
  '2.5 BHK',
  '3 BHK',
  '4 BHK',
  '5+ BHK',
  'Studio',
];

export const COMMERCIAL_TYPES = [
  'Shop',
  'Office',
  'Showroom',
  'Restaurant / Cafe',
  'Warehouse / Storage',
  'ATM',
];

export const PARKING_ALLOCATION_METHODS = [
  'By Society',
  'First Come First Serve',
  'Purchased / Assigned',
  'Lottery / Annual Rotation',
];

export const AMENITY_CATEGORIES = [
  'Recreation',
  'Sports',
  'Community',
  'Fitness & Wellness',
  'Convenience',
];

export const AMENITY_STATUS = {
  ACTIVE: 'Active',
  UNDER_MAINTENANCE: 'Under Maintenance',
  INACTIVE: 'Inactive',
};

export const CONTACT_CATEGORIES = [
  'Essential',
  'Emergency',
  'Service Providers',
];

export const DOCUMENT_CATEGORIES = [
  'Legal',
  'Governance',
  'Plans & Layouts',
  'NOC',
  'Marketing',
  'Financial',
];

export const DOCUMENT_STATUS = {
  VERIFIED: 'Verified',
  EXPIRING_SOON: 'Expiring Soon',
  EXPIRED: 'Expired',
  PENDING: 'Pending Verification',
};

export const STORAGE_KEYS = {
  SETUP_DRAFT: 'msquare_society_setup_draft',
  SETUP_STATUS: 'msquare_society_setup_status',
  CURRENT_STEP: 'msquare_society_setup_step',
};
