import React from 'react';

const UsageChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No usage data available
      </div>
    );
  }

  // Simple bar chart implementation
  const maxCount = Math.max(...data.map(d => d.count));
  const maxCost = Math.max(...data.map(d => d.cost || 0));

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Events Count</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">Cost ($)</span>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{item.date}</span>
              <div className="flex items-center space-x-4">
                <span className="text-blue-600 font-medium">{item.count} events</span>
                <span className="text-green-600 font-medium">${(item.cost || 0).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              {/* Events bar */}
              <div className="flex items-center space-x-2">
                <div className="w-16 text-xs text-gray-500">Events</div>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out"
                    style={{ 
                      width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%`,
                      minWidth: item.count > 0 ? '4px' : '0'
                    }}
                  />
                </div>
              </div>
              
              {/* Cost bar */}
              <div className="flex items-center space-x-2">
                <div className="w-16 text-xs text-gray-500">Cost</div>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 ease-out"
                    style={{ 
                      width: `${maxCost > 0 ? ((item.cost || 0) / maxCost) * 100 : 0}%`,
                      minWidth: (item.cost || 0) > 0 ? '4px' : '0'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
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

export default UsageChart;