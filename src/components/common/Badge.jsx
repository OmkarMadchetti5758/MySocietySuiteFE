import React, { memo } from 'react';

const Badge = memo(({ children, variant = 'primary', className = '', icon: Icon = null }) => {
  const variants = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
    dark: 'bg-dark-card text-primary border border-dark-border',
    success: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    light: 'bg-gray-100 text-gray-700 border border-gray-200'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full tracking-wide uppercase ${variants[variant]} ${className}`}>
      {Icon && <Icon className="text-sm" />}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';
export default Badge;
