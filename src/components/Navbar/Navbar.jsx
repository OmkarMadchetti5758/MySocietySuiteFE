import React, { useState, useEffect } from 'react';
import { NAV_LINKS } from '../../data/navigation';
import { FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import logoImg from '../../assets/images/webp/MySocietySuite_FinalLogo.webp';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 flex flex-col items-center transition-all duration-500 ${
        scrolled ? 'py-3 bg-transparent' : 'py-4 bg-[#0B0B0B]'
      }`}
    >
      {/* Floating pill-shaped navbar */}
      <div
        className={`relative flex items-center justify-between gap-4 px-2 py-1.5 rounded-full transition-all duration-500 w-[92%] max-w-4xl ${
          scrolled
            ? 'bg-[#111]/95 shadow-[0_8px_40px_rgba(0,0,0,0.45)] border border-white/[0.08] backdrop-blur-xl'
            : 'bg-[#111]/90 border border-white/[0.08] backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
        }`}
      >
        {/* Logo Circle */}
        <a href="#" className="shrink-0 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-black/70 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
            <img
              src={logoImg}
              alt="MySocietySuite Logo"
              className="w-9 h-9 object-contain"
            />
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <div key={link.id} className="relative group">
              <a
                href={link.href}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 px-4 py-2 rounded-full hover:bg-white/5"
              >
                <span>{link.label}</span>
                {link.hasDropdown && (
                  <FaChevronDown className="text-[9px] text-gray-500 group-hover:text-gray-300 transition-transform duration-200 group-hover:rotate-180" />
                )}
              </a>

              {/* Dropdown */}
              {link.hasDropdown && link.dropdownItems && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 w-52 bg-[#161616]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-50">
                  {link.dropdownItems.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <a
            href="#pricing"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5"
          >
            Login
          </a>
          <a
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white text-gray-900 text-sm font-semibold px-5 py-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 shadow-sm cursor-pointer"
          >
            Start Free Trial
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="lg:hidden p-2.5 mr-1 text-gray-400 hover:text-white text-lg transition-colors rounded-full hover:bg-white/5"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 w-[92%] max-w-4xl bg-[#111]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <div key={link.id}>
              <a
                href={link.href}
                onClick={() => !link.hasDropdown && setMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm font-medium text-gray-300 hover:text-white px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <span>{link.label}</span>
                {link.hasDropdown && <FaChevronDown className="text-[10px] text-gray-500" />}
              </a>
              {link.hasDropdown && link.dropdownItems && (
                <div className="ml-4 pl-3 border-l border-white/10 space-y-0.5 mb-1">
                  {link.dropdownItems.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-sm text-gray-500 hover:text-gray-200 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-3 mt-2 border-t border-white/10 flex flex-col gap-2">
            <a
              href="#pricing"
              className="text-center text-sm font-medium text-gray-400 py-2.5 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
            >
              Login
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center bg-white text-gray-900 text-sm font-semibold py-2.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
