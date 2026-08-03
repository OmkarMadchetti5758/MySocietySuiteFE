import React, { memo } from 'react';
import { motion } from 'framer-motion';

const Card = memo(({ 
  children, 
  className = '', 
  hoverEffect = true,
  dark = false,
  onClick,
  ...props 
}) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -6, transition: { duration: 0.2 } } : {}}
      onClick={onClick}
      className={`rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
        dark 
          ? 'bg-dark-card border border-dark-border text-white shadow-xl' 
          : 'bg-white border border-border-light text-text-dark shadow-sm hover:shadow-card-hover'
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';
export default Card;
