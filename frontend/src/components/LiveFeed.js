import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  RefreshCw, 
  Play, 
  Pause, 
  Activity, 
  Clock,
  User,
  Zap,
  DollarSign,
  Eye,
  AlertTriangle
} from 'lucide-react';
import FilterPanel from './FilterPanel';

const LiveFeed = ({ events, loading, onRefresh, filters, updateFilters }) => {
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto refresh every 10 seconds when enabled
  useEffect(() => {
    let interval;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        onRefresh();
        setLastRefresh(new Date());
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isAutoRefresh, onRefresh]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getProviderColor = (provider) => {
    const colors = {
      'openai': 'bg-green-100 text-green-800',
      'anthropic': 'bg-orange-100 text-orange-800',
      'google': 'bg-blue-100 text-blue-800',
      'cohere': 'bg-purple-100 text-purple-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[provider.toLowerCase()] || colors.other;
  };

  const getEventTypeColor = (eventType) => {
    const colors = {
      'text_generation': 'bg-blue-100 text-blue-800',
      'image_generation': 'bg-purple-100 text-purple-800',
      'embedding': 'bg-green-100 text-green-800',
      'fine_tuning': 'bg-yellow-100 text-yellow-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[eventType] || colors.other;
  };

  const handleRefresh = () => {
    onRefresh();
    setLastRefresh(new Date());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filter Panel */}
      <FilterPanel 
        filters={filters} 
        updateFilters={updateFilters}
        analytics={{ top_models: [], top_users: [], top_services: [] }} // Empty for live feed
      />

      {/* Live Feed Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Live Event Feed</span>
              <Badge 
                variant={isAutoRefresh ? "default" : "secondary"} 
                className={isAutoRefresh ? "bg-green-500 animate-pulse" : ""}
              >
                {isAutoRefresh ? 'Live' : 'Paused'}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={isAutoRefresh ? "text-green-600 border-green-200" : ""}
                data-testid="toggle-auto-refresh-btn"
              >
                {isAutoRefresh ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Auto Refresh
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                data-testid="manual-refresh-btn"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Event Stream */}
      <Card>
        <CardContent className="p-0">
          {loading && events.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">Loading events...</p>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">No events found</p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your filters or generate some demo data
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {events.map((event, index) => (
                <div 
                  key={event.id} 
                  className={`p-6 hover:bg-gray-50 transition-colors duration-150 ${
                    index === 0 ? 'animate-slide-in' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center mt-1">
                      <div className={`w-3 h-3 rounded-full ${
                        index < 3 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                      }`} />
                      {index < events.length - 1 && (
                        <div className="w-px h-16 bg-gray-200 mt-2" />
                      )}
                    </div>

                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant="secondary" 
                            className={getProviderColor(event.provider)}
                          >
                            {event.provider}
                          </Badge>
                          <span className="font-medium text-gray-900">
                            {event.model}
                          </span>
                          <Badge 
                            variant="outline"
                            className={getEventTypeColor(event.event_type)}
                          >
                            {event.event_type.replace('_', ' ')}
                          </Badge>
                          {event.has_pii && (
                            <Badge variant="outline" className="text-red-600 border-red-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              PII Detected
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(event.timestamp)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">User:</span> {event.user_id}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">Service:</span> {event.service}
                          </span>
                        </div>

                        {event.total_tokens && (
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">Tokens:</span> {event.total_tokens.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {event.cost_usd && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">Cost:</span> ${event.cost_usd.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Event details */}
                      {event.redacted_prompt && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {event.has_pii ? 'Redacted Prompt' : 'Prompt Sample'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-gray-500"
                              data-testid={`view-event-${event.id}`}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {event.redacted_prompt}
                          </p>
                        </div>
                      )}

                      {/* Metadata */}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <Badge 
                              key={key} 
                              variant="outline" 
                              className="text-xs text-gray-500"
                            >
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Load More Button */}
      {events.length >= 100 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => onRefresh(events.length + 100)}
            disabled={loading}
            data-testid="load-more-events-btn"
          >
            {loading ? 'Loading...' : 'Load More Events'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LiveFeed;