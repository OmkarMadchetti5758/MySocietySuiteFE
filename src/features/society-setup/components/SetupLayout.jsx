import React from 'react';
import { FiBell, FiHeadphones } from 'react-icons/fi';
import logoImg from '../../../assets/images/webp/MySocietySuite_FinalLogo.webp';
import { useSetupWizard } from '../hooks/useSetupWizard';

const SetupLayout = ({ children }) => {
  const { currentStep, steps } = useSetupWizard();

  const activeStepMeta = steps.find((s) => s.step === currentStep) || steps[0];

  return (
    <div className="h-screen bg-[#F8F9FA] flex flex-col overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 z-10 shrink-0">
        {/* Left: Branding & Breadcrumb */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="MySocietySuite" className="h-9 w-auto object-contain" />
            <div className="hidden sm:flex flex-col">
              <span className="font-extrabold text-gray-900 text-sm tracking-tight leading-tight">
                MySocietySuite
              </span>
              <span className="text-[8px] font-bold text-gray-400 tracking-wider uppercase">
                Society Setup
              </span>
            </div>
          </div>

          <span className="text-gray-300 hidden md:inline">|</span>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600">
            <span className="text-gray-900 font-bold">Register Society</span>
            <span className="text-gray-300">›</span>
            <span className="text-[#EA580C] font-semibold">{activeStepMeta.breadcrumb}</span>
          </div>
        </div>

        {/* Top Right: Need Help & Profile */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Need Help Link */}
          <a
            href="tel:+919226605656"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50/60 border border-orange-100 text-[#EA580C] hover:bg-orange-50 transition-colors text-xs font-semibold"
          >
            <FiHeadphones className="text-sm" />
            <span>Support: +91 9226605656</span>
          </a>

          {/* Notification Bell */}
          <div className="relative cursor-pointer p-2 rounded-full hover:bg-gray-50 transition-colors">
            <FiBell className="text-gray-600 text-lg" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#EA580C] rounded-full" />
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 text-[#EA580C] font-bold text-xs flex items-center justify-center">
              AD
            </div>
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-xs font-bold text-gray-900">Admin</span>
              <span className="text-[10px] text-gray-400">Society Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable Page Body - Full Width Content without Sidebar */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 custom-scrollbar">
        <div className="max-w-[1700px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SetupLayout;
