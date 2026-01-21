import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  pulse = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium tracking-wide rounded-full whitespace-nowrap shadow-sm border transition-all duration-200 relative overflow-hidden';

  const variants = {
    default: 'bg-secondary-100 text-secondary-700 border-secondary-200 hover:bg-secondary-200',
    primary: 'bg-primary-100 text-primary-700 border-primary-200 hover:bg-primary-200',
    success: 'bg-success-100 text-success-700 border-success-200 hover:bg-success-200',
    warning: 'bg-warning-100 text-warning-700 border-warning-200 hover:bg-warning-200',
    danger: 'bg-error-100 text-error-700 border-error-200 hover:bg-error-200',
    info: 'bg-info-100 text-info-700 border-info-200 hover:bg-info-200',
    gradient: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-500 hover:from-primary-600 hover:to-primary-700',
    glass: 'bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/30',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[0.625rem] uppercase',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`mr-1.5 ${dotSizes[size]} rounded-full bg-current ${pulse ? 'animate-pulse' : ''}`}></span>
      )}
      <span className="relative z-10">{children}</span>
      {variant === 'gradient' && (
        <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></span>
      )}
    </span>
  );
};

export default Badge;
