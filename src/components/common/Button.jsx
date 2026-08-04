import React, { memo } from 'react';
import { motion } from 'framer-motion';

const Button = memo(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-orange-glow hover:shadow-lg focus:ring-primary/50',
    secondary: 'bg-secondary text-white hover:bg-black shadow-md focus:ring-secondary/50',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/50',
    light: 'bg-light-bg text-text-dark hover:bg-gray-200 border border-border-light focus:ring-gray-300',
    ghost: 'text-text-dark hover:text-primary hover:bg-primary/5 focus:ring-primary/30',
    dark: 'bg-dark-card text-white border border-dark-border hover:border-primary/50 hover:bg-dark-card/80'
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-base gap-1.5',
    md: 'px-6 py-2.5 text-base gap-2',
    lg: 'px-8 py-3.5 text-base gap-2.5 font-semibold',
    xl: 'px-9 py-4 text-lg gap-3 font-semibold'
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="text-current text-lg" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="text-current text-lg" />}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
