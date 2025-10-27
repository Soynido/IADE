import React from 'react';
import { Card } from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}

const variantClasses = {
  default: 'bg-white dark:bg-gray-800',
  primary: 'bg-gradient-to-br from-iade-blue-50 to-iade-blue-100 dark:from-iade-blue-900/30 dark:to-iade-blue-800/30 border-2 border-iade-blue-200 dark:border-iade-blue-700',
  success: 'bg-gradient-to-br from-iade-green-50 to-iade-green-100 dark:from-iade-green-900/30 dark:to-iade-green-800/30 border-2 border-iade-green-200 dark:border-iade-green-700',
  warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border-2 border-yellow-200 dark:border-yellow-700',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className = '',
}) => {
  return (
    <Card
      variant="elevated"
      padding="md"
      className={`${variantClasses[variant]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-iade-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-iade-gray-900 dark:text-gray-100">{value}</p>
          
          {subtitle && (
            <p className="text-xs text-iade-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}

          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`flex items-center text-sm font-semibold ${
                trend.positive !== false ? 'text-iade-green-600' : 'text-red-600'
              }`}>
                {trend.positive !== false ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-iade-gray-500">{trend.label}</span>
            </div>
          )}
        </div>

        {icon && (
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-gray-700 bg-opacity-50 dark:bg-opacity-50">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

