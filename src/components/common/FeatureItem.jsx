import React, { memo } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const FeatureItem = memo(({ text, dark = false, icon: CustomIcon = null, className = '' }) => {
  return (
    <div className={`flex items-start gap-3 text-sm sm:text-base font-medium ${className}`}>
      <span className="mt-0.5 shrink-0 text-primary">
        {CustomIcon ? <CustomIcon className="text-lg" /> : <FaCheckCircle className="text-base" />}
      </span>
      <span className={dark ? 'text-gray-300' : 'text-gray-700'}>{text}</span>
    </div>
  );
});

FeatureItem.displayName = 'FeatureItem';
export default FeatureItem;
