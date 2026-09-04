import React from 'react';
import { X, UserCheck, UserPlus } from 'lucide-react';

const options = [
  {
    mode: 'existing',
    icon: UserCheck,
    title: 'Existing Resident',
    description: 'Link a resident already registered in the society.',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    hoverBorder: 'hover:border-blue-400',
  },
  {
    mode: 'new',
    icon: UserPlus,
    title: 'New Resident',
    description: 'Register a brand-new resident and send them an invite.',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    hoverBorder: 'hover:border-orange-400',
  },
];

const ResidentSourcePicker = ({ flat, onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
        style={{ animation: 'pickerIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Allocate Resident</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Flat {flat.flatNumber} &middot; Choose how to proceed
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="px-6 py-5 space-y-3">
          {options.map(({ mode, icon: Icon, title, description, iconBg, iconColor, hoverBorder }) => (
            <button
              key={mode}
              onClick={() => onSelect(mode)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 bg-white text-left transition-all duration-150 ${hoverBorder} hover:shadow-sm group`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} transition-transform group-hover:scale-110`}
              >
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
              </div>
            </button>
          ))}
        </div>

        <style>{`
          @keyframes pickerIn {
            from { opacity: 0; transform: scale(0.92) translateY(8px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ResidentSourcePicker;
