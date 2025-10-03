import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Filter, X, Calendar } from 'lucide-react';

const FilterPanel = ({ filters, updateFilters, analytics }) => {
  const clearFilters = () => {
    updateFilters({
      provider: "all",
      model: "all", 
      user_id: "all",
      service: "all",
      days: 7
    });
  };

  const hasActiveFilters = (filters.provider && filters.provider !== "all") || 
                         (filters.model && filters.model !== "all") || 
                         (filters.user_id && filters.user_id !== "all") || 
                         (filters.service && filters.service !== "all");

  // Extract unique values from analytics for filter options
  const getUniqueProviders = () => {
    if (!analytics?.top_models) return [];
    return [...new Set(analytics.top_models.map(m => m.provider))];
  };

  const getUniqueModels = () => {
    if (!analytics?.top_models) return [];
    return [...new Set(analytics.top_models.map(m => m.model))];
  };

  const getUniqueUsers = () => {
    if (!analytics?.top_users) return [];
    return analytics.top_users.map(u => u.user_id);
  };

  const getUniqueServices = () => {
    if (!analytics?.top_services) return [];
    return analytics.top_services.map(s => s.service);
  };

  return (
    <Card className="border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {Object.values(filters).filter(Boolean).length - 1} active
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-900"
              data-testid="clear-filters-btn"
            >
              <X className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {/* Time Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Time Range</label>
            <Select 
              value={filters.days.toString()} 
              onValueChange={(value) => updateFilters({ days: parseInt(value) })}
            >
              <SelectTrigger data-testid="time-range-filter">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Provider */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Provider</label>
            <Select value={filters.provider} onValueChange={(value) => updateFilters({ provider: value })}>
              <SelectTrigger data-testid="provider-filter">
                <SelectValue placeholder="All providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All providers</SelectItem>
                {getUniqueProviders().map(provider => (
                  <SelectItem key={provider} value={provider}>
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </SelectItem>
                ))}
                {/* Fallback options if no data */}
                {getUniqueProviders().length === 0 && (
                  <>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Model</label>
            <Select value={filters.model} onValueChange={(value) => updateFilters({ model: value })}>
              <SelectTrigger data-testid="model-filter">
                <SelectValue placeholder="All models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All models</SelectItem>
                {getUniqueModels().map(model => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
                {/* Fallback options if no data */}
                {getUniqueModels().length === 0 && (
                  <>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3-opus">Claude-3 Opus</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* User */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">User</label>
            <Select value={filters.user_id} onValueChange={(value) => updateFilters({ user_id: value })}>
              <SelectTrigger data-testid="user-filter">
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {getUniqueUsers().map(user => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
                {/* Fallback options if no data */}
                {getUniqueUsers().length === 0 && (
                  <>
                    <SelectItem value="user-001">user-001</SelectItem>
                    <SelectItem value="user-002">user-002</SelectItem>
                    <SelectItem value="user-003">user-003</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Service */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Service</label>
            <Select value={filters.service} onValueChange={(value) => updateFilters({ service: value })}>
              <SelectTrigger data-testid="service-filter">
                <SelectValue placeholder="All services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All services</SelectItem>
                {getUniqueServices().map(service => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
                {/* Fallback options if no data */}
                {getUniqueServices().length === 0 && (
                  <>
                    <SelectItem value="web-app">web-app</SelectItem>
                    <SelectItem value="api-service">api-service</SelectItem>
                    <SelectItem value="chatbot">chatbot</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quick Actions</label>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ days: 1 })}
                data-testid="today-filter-btn"
                className="text-xs"
              >
                Today
              </Button>
              <Button
                variant="outline" 
                size="sm"
                onClick={() => updateFilters({ days: 7 })}
                data-testid="week-filter-btn"
                className="text-xs"
              >
                Week
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {filters.provider && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    Provider: {filters.provider}
                    <button
                      onClick={() => updateFilters({ provider: "" })}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.model && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    Model: {filters.model}
                    <button
                      onClick={() => updateFilters({ model: "" })}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.user_id && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    User: {filters.user_id}
                    <button
                      onClick={() => updateFilters({ user_id: "" })}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.service && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    Service: {filters.service}
                    <button
                      onClick={() => updateFilters({ service: "" })}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterPanel;