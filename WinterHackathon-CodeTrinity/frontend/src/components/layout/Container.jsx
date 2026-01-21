import React from 'react';

const Container = ({ 
  children, 
  className = '',
  size = 'default',
  ...props 
}) => {
  const maxWidths = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-7xl',
    default: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div 
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${maxWidths[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
