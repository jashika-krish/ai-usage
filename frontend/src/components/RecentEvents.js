import React from 'react';
import { Badge } from './ui/badge';
import { Clock, User, Zap, DollarSign } from 'lucide-react';

const RecentEvents = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No recent events
      </div>
    );
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div 
          key={event.id} 
          className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-150"
        >
          <div className="flex items-center space-x-4 flex-1">
            {/* Time */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 min-w-0">
              <Clock className="h-4 w-4" />
              <span className="truncate">
                {formatTime(event.timestamp)}
              </span>
            </div>

            {/* Provider & Model */}
            <div className="flex items-center space-x-2">
              <Badge 
                variant="secondary" 
                className={`text-xs ${getProviderColor(event.provider)}`}
              >
                {event.provider}
              </Badge>
              <span className="text-sm font-medium text-gray-900 truncate max-w-32">
                {event.model}
              </span>
            </div>

            {/* User */}
            <div className="flex items-center space-x-1 text-sm text-gray-600 min-w-0">
              <User className="h-4 w-4" />
              <span className="truncate max-w-20">
                {event.user_id}
              </span>
            </div>

            {/* Service */}
            <div className="hidden md:flex items-center space-x-1 text-sm text-gray-600">
              <Zap className="h-4 w-4" />
              <span className="truncate">
                {event.service}
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center space-x-6 text-sm">
            {/* Tokens */}
            {event.total_tokens && (
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {event.total_tokens.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">tokens</div>
              </div>
            )}

            {/* Cost */}
            {event.cost_usd && (
              <div className="flex items-center space-x-1 text-green-600">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">
                  {event.cost_usd.toFixed(4)}
                </span>
              </div>
            )}

            {/* PII Indicator */}
            {event.has_pii && (
              <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                PII
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentEvents;