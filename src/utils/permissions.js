export const PERMISSION_LEVELS = {
  NO_ACCESS: 0,
  VIEW: 1,
  MANAGE: 2,
  FULL: 3,
};

export const loadStoredPermissions = () => {
  try {
    const raw = localStorage.getItem('permissions');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const MODULE_ALIASES = {
  festival_collection: ['festival_collection', 'festivals', 'festivalCollectionManagement', 'community_events'],
  festivals: ['festivals', 'festival_collection', 'festivalCollectionManagement', 'community_events'],
  community_events: ['community_events', 'events', 'festival_collection', 'festivals'],
  events: ['events', 'community_events', 'festivals', 'festival_collection'],
  notice_board_polls: ['notice_board_polls', 'notices', 'polls', 'noticeBoardPolls'],
  notices: ['notices', 'notice_board_polls', 'noticeBoardPolls'],
  polls: ['polls', 'notice_board_polls', 'noticeBoardPolls'],
  society_flat_setup: ['society_flat_setup', 'societyFlatSetup', 'residents'],
  residents: ['residents', 'society_flat_setup', 'societyFlatSetup'],
  complaints_helpdesk: ['complaints_helpdesk', 'complaintsHelpdesk', 'helpdesk'],
  helpdesk: ['helpdesk', 'complaints_helpdesk', 'complaintsHelpdesk'],
  staff_management: ['staff_management', 'staffManagement', 'staff'],
  staff: ['staff', 'staff_management', 'staffManagement'],
  vendor_management: ['vendor_management', 'vendorManagement', 'vendors'],
  vendors: ['vendors', 'vendor_management', 'vendorManagement'],
  visitor_management: ['visitor_management', 'visitorManagement', 'visitors'],
  visitors: ['visitors', 'visitor_management', 'visitorManagement'],
  amenity_booking: ['amenity_booking', 'amenityBooking', 'amenities'],
  amenities: ['amenities', 'amenity_booking', 'amenityBooking'],
  parking_management: ['parking_management', 'parkingManagement', 'parking'],
  parking: ['parking', 'parking_management', 'parkingManagement'],
  documents_manager: ['documents_manager', 'documentsManager', 'documents'],
  documents: ['documents', 'documents_manager', 'documentsManager'],
  billing_accounts: ['billing_accounts', 'billingAccounts', 'billing'],
  billing: ['billing', 'billing_accounts', 'billingAccounts'],
  reports_dashboard: ['reports_dashboard', 'reportsDashboard', 'reports'],
  reports: ['reports', 'reports_dashboard', 'reportsDashboard'],
  ai_assistant: ['ai_assistant', 'aiAssistant', 'ai'],
  ai: ['ai', 'ai_assistant', 'aiAssistant'],
  settings: ['settings'],
};

export const hasModuleAccess = (permissions, moduleId, minLevel = PERMISSION_LEVELS.VIEW) => {
  if (!permissions) return false;
  const targetLevel = typeof minLevel === 'string' ? (PERMISSION_LEVELS[minLevel] ?? PERMISSION_LEVELS.VIEW) : minLevel;

  const moduleIds = Array.isArray(moduleId) ? moduleId : [moduleId];
  return moduleIds.some((id) => {
    const keysToCheck = [id, ...(MODULE_ALIASES[id] || [])];
    return keysToCheck.some((k) => {
      const perm = permissions[k];
      return Boolean(perm && perm.level >= targetLevel);
    });
  });
};

export const hasModuleScope = (permissions, moduleId, minLevel = PERMISSION_LEVELS.MANAGE, excludedScopes = ['own', 'assigned', 'none']) => {
  if (!permissions) return false;
  const targetLevel = typeof minLevel === 'string' ? (PERMISSION_LEVELS[minLevel] ?? PERMISSION_LEVELS.MANAGE) : minLevel;
  const moduleIds = Array.isArray(moduleId) ? moduleId : [moduleId];

  return moduleIds.some((id) => {
    const keysToCheck = [id, ...(MODULE_ALIASES[id] || [])];
    return keysToCheck.some((k) => {
      const perm = permissions[k];
      if (!perm) return false;
      if (perm.level < targetLevel) return false;
      if (perm.scope && excludedScopes.includes(perm.scope)) return false;
      return true;
    });
  });
};
