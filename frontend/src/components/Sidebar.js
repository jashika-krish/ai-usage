import React from 'react';
import { BarChart3, Activity, TrendingUp, Settings, Database, Shield } from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3,
      description: 'Overview & Analytics'
    },
    { 
      id: 'live-feed', 
      label: 'Live Feed', 
      icon: Activity,
      description: 'Real-time Events'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: TrendingUp,
      description: 'Deep Insights'
    }
  ];

  const secondaryItems = [
    { 
      id: 'governance', 
      label: 'Governance', 
      icon: Shield,
      description: 'PII & Compliance',
      disabled: true
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      description: 'Configuration',
      disabled: true
    }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-50">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">
              AI Analyzer
            </h1>
            <p className="text-sm text-gray-500">Usage Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <div className="px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  data-testid={`sidebar-${item.id}`}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 transition-colors ${
                    currentPage === item.id 
                      ? 'text-blue-600' 
                      : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${
                      currentPage === item.id ? 'text-blue-800' : 'text-gray-700'
                    }`}>
                      {item.label}
                    </div>
                    <div className={`text-xs ${
                      currentPage === item.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                  {currentPage === item.id && (
                    <div className="ml-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Items */}
        <div className="mt-8 px-3">
          <div className="px-4 mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Management
            </h3>
          </div>
          <div className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                    item.disabled 
                      ? 'text-gray-400 cursor-not-allowed opacity-60' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-500">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.description}
                    </div>
                  </div>
                  {item.disabled && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Version 1.0.0</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;