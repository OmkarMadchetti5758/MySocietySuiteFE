import React, { useState, useEffect } from 'react';
import { NAV_LINKS } from '../../data/navigation';
import { FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import logoImg from '../../assets/images/webp/MySocietySuite_FinalLogo.webp';
import navLogoImg from '../../assets/images/webp/nav_logo.webp';
import LoginModal from '../Auth/LoginModal';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 flex flex-col items-center transition-all duration-500 ${scrolled ? 'pt-4 bg-transparent' : 'bg-white shadow-sm'
        }`}
    >
      {/* Navbar Container */}
      <div
        className={`relative flex items-center justify-between transition-all duration-500 mx-auto ${scrolled
          ? 'w-[90%] max-w-4xl px-2 py-1.5 rounded-full bg-[#111]/95 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl gap-4'
          : 'w-full max-w-[1400px] px-6 lg:px-10 py-0 md:py-0 bg-transparent gap-8'
          }`}
      >
        {/* Logo */}
        <a href="#" className={`shrink-0 flex items-center justify-center transition-all duration-500 ${scrolled ? 'w-12 h-12 rounded-full bg-black/70 overflow-hidden shadow-inner' : ''
          }`}>
          {scrolled ? (
            <img
              src={logoImg}
              alt="MySocietySuite Icon"
              className="transition-all duration-500 object-contain w-18 h-18 max-w-none"
            />
          ) : (
            <img
              src={navLogoImg}
              alt="MySocietySuite Full Logo"
              /* Customize the height and width of the initial logo here: */
              className="transition-all duration-500 object-contain origin-left h-20 md:h-20 w-auto"
            />
          )}
        </a>

        {/* Desktop Nav Links */}
        <nav className={`hidden lg:flex items-center flex-1 justify-center transition-all duration-500 ${scrolled ? 'gap-0.5' : 'gap-8'
          }`}>
          {NAV_LINKS.map((link) => {
            const isActive = link.label === 'Home'; // Example active state
            return (
              <div key={link.id} className="relative group flex items-center h-full">
                <a
                  href={link.href}
                  className={`flex items-center gap-1.5 text-base font-medium transition-all duration-300 ${scrolled
                    ? 'text-gray-300 hover:text-white px-4 py-2 rounded-full hover:bg-white/5'
                    : `py-2 relative ${isActive ? 'text-[#FF6B00]' : 'text-gray-600 hover:text-gray-900'}`
                    }`}
                >
                  <span>{link.label}</span>
                  {link.hasDropdown && (
                    <FaChevronDown className={`text-[9px] transition-transform duration-200 group-hover:rotate-180 ${scrolled ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400'
                      }`} />
                  )}
                  {/* Active underline for non-scrolled state */}
                  {!scrolled && isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FF6B00] rounded-t-sm" />
                  )}
                </a>

                {/* Dropdown */}
                {link.hasDropdown && link.dropdownItems && (
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 w-52 rounded-2xl shadow-2xl overflow-hidden py-2 z-50 ${scrolled
                    ? 'bg-[#161616]/95 backdrop-blur-xl border border-white/10'
                    : 'bg-white border border-gray-100 shadow-lg'
                    }`}>
                    {link.dropdownItems.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.href}
                        className={`block px-4 py-2.5 text-base transition-colors ${scrolled
                          ? 'text-gray-400 hover:text-white hover:bg-white/5'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className={`text-[15px] font-semibold transition-all duration-300 ${scrolled
              ? 'text-gray-400 hover:text-white px-4 py-2 rounded-full hover:bg-white/5'
              : 'text-gray-700 hover:text-gray-900 border-2 border-gray-200 px-6 py-2.5 rounded-lg hover:bg-gray-50'
              }`}
          >
            Login
          </button>
          <a
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`text-[15px] font-bold transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-center ${scrolled
              ? 'bg-white text-gray-900 px-5 py-2.5 rounded-full hover:bg-gray-100 active:bg-gray-200'
              : 'bg-[#FF6B00] text-white px-6 py-3 rounded-lg hover:bg-[#e66000] active:bg-[#cc5500]'
              }`}
          >
            {scrolled ? 'Book Demo' : 'Book a Demo'}
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className={`lg:hidden p-2.5 mr-1 text-lg transition-colors rounded-full ${scrolled ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
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
                className="flex items-center justify-between text-base font-medium text-gray-300 hover:text-white px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
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
                      className="block text-base text-gray-500 hover:text-gray-200 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-3 mt-2 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsLoginModalOpen(true);
              }}
              className="text-center text-base font-medium text-gray-400 py-2.5 rounded-full border border-white/10 hover:bg-white/5 transition-colors w-full"
            >
              Login / Register
            </button>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center bg-white text-gray-900 text-base font-semibold py-2.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              Book Demo
            </a>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
};

export default Navbar;
