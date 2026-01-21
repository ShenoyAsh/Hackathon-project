import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  variant = 'default',
  hover = true,
  animated = false,
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    xs: 'p-3',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const shadows = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-card',
    lg: 'shadow-card-hover',
    xl: 'shadow-soft-lg',
    glow: 'shadow-glow',
  };

  const roundness = {
    none: 'rounded-none',
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
  };

  const variants = {
    default: 'bg-white border border-secondary-200/60',
    glass: 'bg-white/80 backdrop-blur-xl border border-white/50 shadow-glass',
    outline: 'bg-transparent border border-secondary-300',
    gradient: 'bg-gradient-to-br from-white via-primary-50/30 to-accent-50/30 border border-white/60',
    elevated: 'bg-white border-0',
    dark: 'bg-secondary-900 border border-secondary-800',
    success: 'bg-success-50 border border-success-200',
    warning: 'bg-warning-50 border border-warning-200',
    error: 'bg-error-50 border border-error-200',
    info: 'bg-info-50 border border-info-200',
  };

  const hoverEffects = hover ? 'hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300' : '';
  const animationEffects = animated ? 'animate-fade-in' : '';

  return (
    <div
      className={`
        ${variants[variant]} 
        ${paddings[padding]} 
        ${shadows[shadow]} 
        ${roundness[rounded]} 
        ${hoverEffects}
        ${animationEffects}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
