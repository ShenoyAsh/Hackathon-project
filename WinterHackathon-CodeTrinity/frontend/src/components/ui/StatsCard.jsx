import React from 'react';
import { Icon } from 'lucide-react';
import Card from './Card';
import Badge from './Badge';

const StatsCard = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  color = 'primary',
  trend = null,
  size = 'md',
  animated = true,
  ...props
}) => {
  const colorClasses = {
    primary: {
      bg: 'from-primary-100 to-primary-200',
      icon: 'text-primary-600',
      trend: 'text-primary-600',
    },
    success: {
      bg: 'from-success-100 to-success-200',
      icon: 'text-success-600',
      trend: 'text-success-600',
    },
    warning: {
      bg: 'from-warning-100 to-warning-200',
      icon: 'text-warning-600',
      trend: 'text-warning-600',
    },
    error: {
      bg: 'from-error-100 to-error-200',
      icon: 'text-error-600',
      trend: 'text-error-600',
    },
    info: {
      bg: 'from-info-100 to-info-200',
      icon: 'text-info-600',
      trend: 'text-info-600',
    },
  };

  const sizes = {
    sm: {
      title: 'text-xs',
      value: 'text-2xl',
      icon: 'w-6 h-6',
      padding: 'p-4',
    },
    md: {
      title: 'text-sm',
      value: 'text-3xl',
      icon: 'w-8 h-8',
      padding: 'p-6',
    },
    lg: {
      title: 'text-base',
      value: 'text-4xl',
      icon: 'w-10 h-10',
      padding: 'p-8',
    },
  };

  const currentColor = colorClasses[color] || colorClasses.primary;
  const currentSize = sizes[size] || sizes.md;

  const changeColor = changeType === 'positive' ? 'text-success-600' : 'text-error-600';

  return (
    <Card 
      variant="gradient" 
      hover={true} 
      animated={animated} 
      className={`group ${currentSize.padding}`}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${currentSize.title} font-medium text-secondary-600 group-hover:text-primary-600 transition-colors`}>
            {title}
          </p>
          <p className={`${currentSize.value} font-bold text-secondary-900 mt-1`}>
            {value}
          </p>
          
          <div className="flex items-center space-x-3 mt-2">
            {change && (
              <p className={`text-xs font-medium ${changeColor}`}>
                {changeType === 'positive' ? '+' : ''}{change}
              </p>
            )}
            
            {trend && (
              <div className="flex items-center space-x-1">
                <Icon className={`w-3 h-3 ${currentColor.trend}`} />
                <span className="text-xs text-secondary-500">{trend}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className={`p-4 bg-gradient-to-br ${currentColor.bg} rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`${currentSize.icon} ${currentColor.icon}`} />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
