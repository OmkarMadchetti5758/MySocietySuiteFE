export const NAV_LINKS = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'who-we-serve', label: 'Who we serve', href: '/who-we-serve' },
  { id: 'products', label: 'Products', href: '/#products' },
  {
    id: 'resources',
    label: 'Resources',
    href: '#resources',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Guides & Insights', href: '#resources' },
      { label: 'FAQs', href: '#faq' },
      { label: 'Case Studies', href: '#testimonials' },
    ]
  },
  { id: 'blog', label: 'Blog', href: '/blog' },
  { id: 'about', label: 'About Us', href: '#about-us' },
  { id: 'contact', label: 'Contact', href: '#contact' },
];

export const TRUSTED_AVATARS = [
  { name: 'Sarah M.', role: 'Society President', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { name: 'David K.', role: 'Treasurer', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Anita R.', role: 'Resident', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { name: 'Rajesh P.', role: 'Security Manager', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
];
