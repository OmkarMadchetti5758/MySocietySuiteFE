import {
  FaUsers,
  FaCalculator,
  FaWrench,
  FaHome,
  FaUser,
  FaShieldAlt,
  FaUserShield,
  FaClipboardList,
  FaChartBar,
  FaCalendarAlt,
  FaGift,
  FaUserTie,
  FaStore,
  FaFolderOpen,
  FaCog,
  FaRobot,
  FaMoneyBillWave,
  FaIdBadge,
  FaExclamationCircle,
  FaCar,
} from 'react-icons/fa';

export const getRoleTheme = (roleKey = '') => {
  const key = roleKey.toLowerCase();
  if (key === 'admin' || key.includes('committee') || key.includes('super_admin')) {
    return {
      icon: FaUsers,
      tileBg: 'bg-blue-50 text-blue-600',
      pillBg: 'bg-blue-50 text-blue-600',
      defaultDesc: 'Full access to all modules and features.',
      usersCount: 2,
      avatars: [
        { initials: 'GA', bg: 'bg-orange-100 text-[#EA580C]' },
        { initials: 'SA', bg: 'bg-blue-100 text-blue-700' },
      ],
    };
  }
  if (key === 'accountant') {
    return {
      icon: FaCalculator,
      tileBg: 'bg-orange-50 text-[#EA580C]',
      pillBg: 'bg-orange-100/70 text-[#EA580C]',
      defaultDesc: 'Access to financial and accounting modules.',
      usersCount: 4,
      avatars: [
        { initials: 'SJ', bg: 'bg-blue-100 text-blue-700' },
        { initials: 'PK', bg: 'bg-purple-100 text-purple-700' },
        { initials: 'RD', bg: 'bg-emerald-100 text-emerald-700' },
        { initials: '+1', bg: 'bg-gray-100 text-gray-600' },
      ],
    };
  }
  if (key === 'facility_manager' || key.includes('manager')) {
    return {
      icon: FaWrench,
      tileBg: 'bg-emerald-50 text-emerald-600',
      pillBg: 'bg-emerald-50 text-emerald-600',
      defaultDesc: 'Manage maintenance, staff and vendors.',
      usersCount: 1,
      avatars: [{ initials: 'FM', bg: 'bg-emerald-100 text-emerald-700' }],
    };
  }
  if (key === 'resident_owner' || key.includes('owner')) {
    return {
      icon: FaHome,
      tileBg: 'bg-purple-50 text-purple-600',
      pillBg: 'bg-purple-50 text-purple-600',
      defaultDesc: 'Access to resident features and services.',
      usersCount: 128,
      avatars: [{ initials: 'RO', bg: 'bg-purple-100 text-purple-700' }],
    };
  }
  if (key === 'resident_tenant' || key.includes('tenant')) {
    return {
      icon: FaUser,
      tileBg: 'bg-rose-50 text-rose-600',
      pillBg: 'bg-rose-50 text-rose-600',
      defaultDesc: 'Limited access for tenants.',
      usersCount: 45,
      avatars: [{ initials: 'RT', bg: 'bg-rose-100 text-rose-700' }],
    };
  }
  if (key === 'security_guard' || key.includes('guard') || key.includes('security')) {
    return {
      icon: FaShieldAlt,
      tileBg: 'bg-amber-50 text-amber-600',
      pillBg: 'bg-amber-50 text-amber-600',
      defaultDesc: 'Access to visitor management and gate operations.',
      usersCount: 8,
      avatars: [{ initials: 'SG', bg: 'bg-amber-100 text-amber-700' }],
    };
  }
  return {
    icon: FaUserShield,
    tileBg: 'bg-blue-50 text-blue-600',
    pillBg: 'bg-blue-50 text-blue-600',
    defaultDesc: 'Custom role access permissions.',
    usersCount: 0,
    avatars: [],
  };
};

export const MATRIX_STRUCTURE = [
  {
    type: 'group',
    id: 'society_management',
    label: 'Society & Members',
    items: [
      { id: 'society_setup', label: 'Society & Flats', icon: FaHome, matchKeys: ['societyFlatSetup', 'society_flat_setup', 'society_setup'] },
      { id: 'residents', label: 'Residents', icon: FaUsers, matchKeys: ['residents', 'society_flat_setup', 'societyFlatSetup'] },
    ],
  },
  {
    type: 'group',
    id: 'community',
    label: 'Community',
    items: [
      { id: 'notices', label: 'Notices', icon: FaClipboardList, matchKeys: ['notices', 'noticeBoardPolls', 'notice_board_polls'] },
      { id: 'polls', label: 'Polls', icon: FaChartBar, matchKeys: ['polls', 'noticeBoardPolls', 'notice_board_polls'] },
      { id: 'festivals', label: 'Festivals', icon: FaGift, matchKeys: ['festivals', 'festivalCollectionManagement', 'festival_collection'] },
      { id: 'events', label: 'Events', icon: FaCalendarAlt, matchKeys: ['events', 'communityEvents', 'community_events'] },
    ],
  },
  {
    type: 'group',
    id: 'staff',
    label: 'Staff',
    items: [
      { id: 'staff', label: 'Staff', icon: FaUserTie, matchKeys: ['staff', 'staffManagement', 'staff_management'] },
      { id: 'vendors', label: 'Vendors', icon: FaStore, matchKeys: ['vendors', 'vendorManagement', 'vendor_management'] },
    ],
  },
  {
    type: 'group',
    id: 'administration',
    label: 'Administration',
    items: [
      { id: 'documents', label: 'Documents', icon: FaFolderOpen, matchKeys: ['documents', 'documentsManager', 'documents_manager'] },
      { id: 'settings', label: 'Settings', icon: FaCog, matchKeys: ['settings'] },
    ],
  },
  {
    type: 'single',
    id: 'reports',
    label: 'Reports',
    icon: FaChartBar,
    matchKeys: ['reports', 'reportsDashboard', 'reports_dashboard'],
  },
  {
    type: 'single',
    id: 'ai',
    label: 'AI Assistant',
    icon: FaRobot,
    matchKeys: ['ai', 'aiAssistant', 'ai_assistant'],
  },
  {
    type: 'group',
    id: 'operations',
    label: 'Operations & Security',
    items: [
      { id: 'visitors', label: 'Visitors', icon: FaIdBadge, matchKeys: ['visitors', 'visitorManagement', 'visitor_management'] },
      { id: 'helpdesk', label: 'Helpdesk', icon: FaExclamationCircle, matchKeys: ['helpdesk', 'complaintsHelpdesk', 'complaints_helpdesk'] },
      { id: 'amenities', label: 'Amenities', icon: FaCalendarAlt, matchKeys: ['amenities', 'amenityBooking', 'amenity_booking'] },
      { id: 'parking', label: 'Parking', icon: FaCar, matchKeys: ['parking', 'parkingManagement', 'parking_management'] },
    ],
  },
  {
    type: 'single',
    id: 'billing',
    label: 'Billing & Accounts',
    icon: FaMoneyBillWave,
    matchKeys: ['billing', 'billingAccounts', 'billing_accounts'],
  },
];

export const getFilteredMatrix = (role) => {
  if (!role) return MATRIX_STRUCTURE;

  const planAllowed = (role.activePlan?.modules && role.activePlan.modules.length > 0)
    ? new Set(role.activePlan.modules)
    : null;

  const roleAllowed = (role.permissions && role.permissions.length > 0)
    ? new Set(role.permissions.map((p) => p.moduleKey))
    : null;

  return MATRIX_STRUCTURE.map((entry) => {
    if (entry.type === 'group') {
      const filteredItems = entry.items.filter((item) => {
        const inPlan = !planAllowed || item.matchKeys.some((mk) => planAllowed.has(mk));
        const inRole = !roleAllowed || item.matchKeys.some((mk) => roleAllowed.has(mk));
        return inPlan && inRole;
      });
      if (filteredItems.length === 0) return null;
      return { ...entry, items: filteredItems };
    }
    const inPlan = !planAllowed || entry.matchKeys.some((mk) => planAllowed.has(mk));
    const inRole = !roleAllowed || entry.matchKeys.some((mk) => roleAllowed.has(mk));
    return (inPlan && inRole) ? entry : null;
  }).filter(Boolean);
};


export const formatAuditInfo = (lastAudit) => {
  if (lastAudit?.changedAt) {
    const date = new Date(lastAudit.changedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const timeStr = diffDays === 0 ? 'Today' : diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    return {
      timeStr,
      author: lastAudit.changedByName || 'Admin',
    };
  }
  return {
    timeStr: '2 days ago',
    author: 'Gera Admin',
  };
};
