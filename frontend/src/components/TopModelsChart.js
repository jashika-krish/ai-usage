import React from 'react';
import { Badge } from './ui/badge';

const TopModelsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No models data available
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));
  
  const getProviderColor = (provider) => {
    const colors = {
      'openai': 'bg-green-500',
      'anthropic': 'bg-orange-500', 
      'google': 'bg-blue-500',
      'cohere': 'bg-purple-500',
      'other': 'bg-gray-500'
    };
    return colors[provider.toLowerCase()] || colors.other;
  };

  const getProviderBadgeColor = (provider) => {
    const colors = {
      'openai': 'bg-green-100 text-green-800',
      'anthropic': 'bg-orange-100 text-orange-800',
      'google': 'bg-blue-100 text-blue-800', 
      'cohere': 'bg-purple-100 text-purple-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[provider.toLowerCase()] || colors.other;
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
                #{index + 1}
              </div>
              <div>
                <div className="font-medium text-gray-900">{item.model}</div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getProviderBadgeColor(item.provider)}`}
                >
                  {item.provider}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{item.count}</div>
              <div className="text-xs text-gray-500">events</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full ${getProviderColor(item.provider)} transition-all duration-500 ease-out`}
                style={{ 
                  width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%`,
                  minWidth: item.count > 0 ? '8px' : '0'
                }}
              />
            </div>
            <div className="text-sm text-gray-600 font-medium w-20 text-right">
              ${(item.cost || 0).toFixed(2)}
            </div>
          </div>
        </div>
      ))}
      
      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {data.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <div className="text-gray-500">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              ${data.reduce((sum, item) => sum + (item.cost || 0), 0).toFixed(2)}
            </div>
            <div className="text-gray-500">Total Cost</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopModelsChart;