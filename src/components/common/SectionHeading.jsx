import React, { memo } from 'react';
import Badge from './Badge';

const SectionHeading = memo(({
  badge,
  title,
  highlightedText,
  subtitle,
  align = 'center',
  dark = false,
  className = ''
}) => {
  const alignStyles = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto'
  };

  return (
    <div className={`flex flex-col max-w-3xl mb-12 sm:mb-16 ${alignStyles[align]} ${className}`}>
      {badge && (
        <Badge variant={dark ? 'dark' : 'primary'} className="mb-4">
          {badge}
        </Badge>
      )}
      
      <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight ${dark ? 'text-white' : 'text-text-dark'}`}>
        {title}{' '}
        {highlightedText && (
          <span className="orange-gradient-text block sm:inline mt-1 sm:mt-0">
            {highlightedText}
          </span>
        )}
      </h2>

      {subtitle && (
        <p className={`mt-4 text-base sm:text-lg leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
});

SectionHeading.displayName = 'SectionHeading';
export default SectionHeading;
