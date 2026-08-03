import React, { memo } from 'react';

const Container = memo(({ children, className = '', size = 'default' }) => {
  const maxWidths = {
    small: 'max-w-4xl',
    default: 'max-w-7xl',
    large: 'max-w-8xl',
    full: 'max-w-full'
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidths[size]} ${className}`}>
      {children}
    </div>
  );
});

Container.displayName = 'Container';
export default Container;
