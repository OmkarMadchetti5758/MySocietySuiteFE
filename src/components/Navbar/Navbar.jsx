import React, { useState } from 'react';
import Container from '../common/Container';
import Button from '../common/Button';
import { NAV_LINKS } from '../../data/navigation';
import { FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import logoImg from '../../assets/images/webp/MySocietySuite_FinalLogo.webp';

const DesktopNav = () => (
  <nav className="hidden lg:flex items-center gap-8">
    {NAV_LINKS.map((link) => (
      <div key={link.id} className="relative group">
        <a
          href={link.href}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors py-4"
        >
          <span>{link.label}</span>
          {link.hasDropdown && (
            <FaChevronDown className="text-[10px] text-gray-400 group-hover:text-white transition-transform group-hover:rotate-180" />
          )}
        </a>

        {/* Dropdown Menu */}
        {link.hasDropdown && link.dropdownItems && (
          <div className="absolute top-full left-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 w-48 bg-[#151515] border border-gray-800 rounded-xl shadow-xl overflow-hidden py-2 z-50">
            {link.dropdownItems.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    ))}
  </nav>
);

const MobileNav = ({ setMobileMenuOpen }) => (
  <div className="lg:hidden bg-[#0B0B0B] border-t border-gray-800 mt-4 pt-4 pb-6 space-y-3">
    {NAV_LINKS.map((link) => (
      <div key={link.id} className="space-y-1">
        <a
          href={link.href}
          onClick={() => !link.hasDropdown && setMobileMenuOpen(false)}
          className="block text-sm font-medium text-gray-300 hover:text-white px-2 py-2"
        >
          <div className="flex items-center justify-between">
            <span>{link.label}</span>
            {link.hasDropdown && <FaChevronDown className="text-[10px] text-gray-500" />}
          </div>
        </a>

        {/* Mobile Sub-items */}
        {link.hasDropdown && link.dropdownItems && (
          <div className="pl-4 ml-2 border-l border-gray-800 space-y-2 pb-2">
            {link.dropdownItems.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-gray-400 hover:text-white py-1"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    ))}
    <div className="pt-4 flex flex-col gap-2">
      <a href="#pricing" className="text-center text-sm font-medium text-gray-300 py-2 border border-gray-700 rounded-lg">
        Login
      </a>
      <Button
        variant="primary"
        size="md"
        className="w-full"
        onClick={() => setMobileMenuOpen(false)}
      >
        Start Free Trial
      </Button>
    </div>
  </div>
);

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full relative z-50 bg-[#0B0B0B] border-b border-gray-800/80 py-4">
      <Container>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="MySocietySuite Logo"
              className="h-20 object-contain"
            />
          </a>

          <DesktopNav />

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-6">
            <a href="#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Login
            </a>
            <Button
              variant="primary"
              size="md"
              className="font-semibold shadow-orange-glow rounded-lg text-sm px-5 py-2"
              onClick={() => {
                const el = document.getElementById('pricing');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Start Free Trial
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-2 text-gray-300 hover:text-white text-xl"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {mobileMenuOpen && <MobileNav setMobileMenuOpen={setMobileMenuOpen} />}
      </Container>
    </header>
  );
};

export default Navbar;
