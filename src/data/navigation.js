export const NAV_LINKS = [
  { id: 'features', label: 'Features', href: '#features' },
  {
    id: 'modules',
    label: 'Modules',
    href: '#modules',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Visitor Management', href: '#modules' },
      { label: 'Maintenance Billing', href: '#modules' },
      { label: 'Complaint Management', href: '#modules' },
      { label: 'Facility Booking', href: '#modules' },
      { label: 'Accounts & Staff', href: '#modules' }
    ]
  },
  { id: 'pricing', label: 'Pricing', href: '#pricing' },
  {
    id: 'resources',
    label: 'Resources',
    href: '#how-it-works',
    hasDropdown: true,
    dropdownItems: [
      { label: 'How it Works', href: '#how-it-works' },
      { label: 'Case Studies', href: '#testimonials' },
      { label: 'Mobile Apps', href: '#mobile-apps' },
      { label: 'AI Assistant', href: '#ai-assistant' }
    ]
  },
  { id: 'about', label: 'About Us', href: '#footer' },
];

export const TRUSTED_AVATARS = [
  { name: 'Sarah M.', role: 'Society President', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { name: 'David K.', role: 'Treasurer', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Anita R.', role: 'Resident', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { name: 'Rajesh P.', role: 'Security Manager', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
];
