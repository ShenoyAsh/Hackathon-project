// src/components/ui/Button.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  as,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transform group overflow-hidden';

  const variants = {
    primary: 'btn-primary shadow-button hover:shadow-button-hover focus:ring-primary-500',
    secondary: 'btn-secondary shadow-card hover:shadow-card-hover focus:ring-secondary-500',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-button hover:shadow-button-hover focus:ring-green-500',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-button hover:shadow-button-hover focus:ring-amber-500',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-button hover:shadow-button-hover focus:ring-red-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    glass: 'btn-glass shadow-glass focus:ring-white/50 text-white border border-white/20 hover:bg-white/10',
    gradient: 'btn-primary shadow-button hover:shadow-button-hover focus:ring-primary-500 bg-size-300 bg-pos-0 hover:bg-pos-100 transition-all duration-500',
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
    xl: 'px-10 py-4 text-xl',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  const renderIcon = () => {
    if (!Icon) return null;
    return <Icon className={`${iconSizes[size]} ${iconPosition === 'left' ? 'mr-2' : 'ml-2'} transition-transform group-hover:scale-110`} />;
  };

  const defaultClass = 'shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400';
  const combinedClassName = `${defaultClass} ${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl">
          <Loader2 className={`h-5 w-5 animate-spin ${iconSizes[size]}`} />
        </div>
      )}
      <span className={`flex items-center justify-center ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
        {iconPosition === 'left' && renderIcon()}
        {children}
        {iconPosition === 'right' && renderIcon()}
      </span>
    </>
  );

  // If 'to' prop is passed, render as Link
  if (props.to) {
    const Component = motion(Link);
    return (
      <Component
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className={combinedClassName}
        {...props}
      >
        {content}
      </Component>
    );
  }

  // If 'href' is passed, render as a tag
  if (props.href) {
    return (
      <motion.a
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className={combinedClassName}
        {...props}
      >
        {content}
      </motion.a>
    );
  }

  // Default button
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={combinedClassName}
      disabled={isLoading || disabled}
      {...props}
    >
      {content}
    </motion.button>
  );
};

export default Button;
