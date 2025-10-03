import React from 'react';
import { Card, CardContent } from './ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  color = 'blue',
  trend = 'up'
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100',
      change: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      iconBg: 'bg-green-100',
      change: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      iconBg: 'bg-purple-100',
      change: 'text-purple-600'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      iconBg: 'bg-orange-100',
      change: 'text-orange-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      iconBg: 'bg-red-100',
      change: 'text-red-600'
    }
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <Card className="stats-card hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${classes.iconBg}`}>
                <Icon className={`h-6 w-6 ${classes.icon}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {value}
                </p>
              </div>
            </div>
            
            {change && (
              <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                <div className={`flex items-center space-x-1 text-sm font-medium ${classes.change}`}>
                  {trend === 'up' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>{change}</span>
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  {changeLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;