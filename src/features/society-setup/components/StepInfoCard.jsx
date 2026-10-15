import React from 'react';
import { FiInfo, FiCheck, FiCheckCircle } from 'react-icons/fi';
import {
  BuildingIllustration,
  AmenitiesIllustration,
  ContactIllustration,
  DocumentIllustration,
} from './SetupIllustrations';

const StepInfoCard = ({
  title = 'About this step',
  icon: Icon = FiInfo,
  iconColor = 'text-blue-500',
  description,
  items = [],
  tips = [],
  tipsTitle = 'Quick Tips',
  illustration,
  className = '',
}) => {
  return (
    <div className={`space-y-5 ${className}`}>
      {/* Primary Info Box */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs transition-all hover:shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Icon className={`text-base ${iconColor}`} />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
        </div>

        {description && (
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            {description}
          </p>
        )}

        {items.length > 0 && (
          <ul className="space-y-2.5 my-3">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 leading-snug">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Illustration if supplied */}
        {illustration === 'building' && <BuildingIllustration />}
        {illustration === 'amenity' && <AmenitiesIllustration />}
        {illustration === 'contact' && <ContactIllustration />}
        {illustration === 'document' && <DocumentIllustration />}
        {React.isValidElement(illustration) && illustration}
      </div>

      {/* Quick Tips Box */}
      {tips.length > 0 && (
        <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <FiCheckCircle className="text-emerald-600 text-base" />
            <h4 className="font-bold text-gray-800 text-sm">{tipsTitle}</h4>
          </div>
          <ul className="space-y-2.5">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 leading-snug">
                <FiCheck className="text-emerald-600 text-sm mt-0.5 shrink-0 stroke-[2.5]" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StepInfoCard;
