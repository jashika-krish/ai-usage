import React from 'react';
import { Bell, User, Search, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

const Header = ({ currentPage, analytics }) => {
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'live-feed':
        return 'Live Event Feed';
      case 'analytics':
        return 'Analytics & Insights';
      default:
        return 'AI Usage Analyzer';
    }
  };

  const getPageDescription = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Monitor AI usage patterns and key metrics';
      case 'live-feed':
        return 'Real-time streaming of AI usage events';
      case 'analytics':
        return 'Deep dive into usage trends and performance';
      default:
        return 'Intelligence for your AI operations';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Page info */}
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getPageTitle()}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {getPageDescription()}
                </p>
              </div>
              
              {/* Quick stats */}
              {analytics && (
                <div className="hidden md:flex items-center space-x-6 ml-8">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {analytics.total_events.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Total Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      ${analytics.total_cost.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">Total Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {analytics.events_last_24h}
                    </div>
                    <div className="text-xs text-gray-500">Last 24h</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm w-64"
                data-testid="header-search"
              />
            </div>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="sm"
              data-testid="header-refresh"
              className="hidden md:flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                data-testid="header-notifications"
                className="relative"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </span>
              </Button>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-900">Admin User</div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                data-testid="header-user-menu"
                className="p-1"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;