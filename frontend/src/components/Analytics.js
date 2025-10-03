import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Users,
  Zap,
  DollarSign,
  Activity,
  AlertCircle
} from 'lucide-react';
import FilterPanel from './FilterPanel';
import UsageChart from './UsageChart';
import TopModelsChart from './TopModelsChart';

const Analytics = ({ analytics, loading, filters, updateFilters }) => {
  if (loading && !analytics) {
    return (
      <div className="space-y-6 animate-fade-in">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics || analytics.total_events === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <FilterPanel 
          filters={filters} 
          updateFilters={updateFilters}
          analytics={analytics}
        />
        
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Analytics Data Available
              </h3>
              <p className="text-gray-500 mb-6">
                Generate some demo data to see detailed analytics and insights
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate additional metrics
  const avgCostPerEvent = analytics.total_events > 0 ? analytics.total_cost / analytics.total_events : 0;
  const avgEventsPerDay = analytics.usage_over_time?.length > 0 
    ? analytics.usage_over_time.reduce((sum, day) => sum + day.count, 0) / analytics.usage_over_time.length 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filter Panel */}
      <FilterPanel 
        filters={filters} 
        updateFilters={updateFilters}
        analytics={analytics}
      />

      {/* Key Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Cost/Event</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${avgCostPerEvent.toFixed(4)}
                </p>
                <p className="text-sm text-blue-600">per event</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Events/Day</p>
                <p className="text-2xl font-bold text-gray-900">
                  {avgEventsPerDay.toFixed(0)}
                </p>
                <p className="text-sm text-green-600">daily average</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Models</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.top_models?.length || 0}
                </p>
                <p className="text-sm text-purple-600">in use</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.top_services?.length || 0}
                </p>
                <p className="text-sm text-orange-600">services</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Usage Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UsageChart data={analytics.usage_over_time} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-green-600" />
              <span>Top Performing Models</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopModelsChart data={analytics.top_models} />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Provider Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <span>Provider Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.top_models?.reduce((providers, model) => {
                const existing = providers.find(p => p.provider === model.provider);
                if (existing) {
                  existing.count += model.count;
                  existing.cost += model.cost || 0;
                } else {
                  providers.push({
                    provider: model.provider,
                    count: model.count,
                    cost: model.cost || 0
                  });
                }
                return providers;
              }, []).sort((a, b) => b.count - a.count).map((provider, index) => (
                <div key={provider.provider} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant="secondary"
                      className={`${
                        provider.provider === 'openai' ? 'bg-green-100 text-green-800' :
                        provider.provider === 'anthropic' ? 'bg-orange-100 text-orange-800' :
                        provider.provider === 'google' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1)}
                    </Badge>
                    <span className="text-sm font-medium text-gray-900">
                      {provider.count} events
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    ${provider.cost.toFixed(2)}
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-4">
                  No provider data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>User Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.top_users?.map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.user_id}</div>
                      <div className="text-sm text-gray-500">{user.count} requests</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${(user.cost || 0).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">spent</div>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-4">
                  No user data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cost Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Cost Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-900 mb-2">
                  Total Spend (Last {filters.days} days)
                </div>
                <div className="text-2xl font-bold text-green-800">
                  ${analytics.total_cost?.toFixed(2) || '0.00'}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900 mb-2">
                  Daily Average
                </div>
                <div className="text-2xl font-bold text-blue-800">
                  ${(analytics.total_cost / Math.max(filters.days, 1)).toFixed(2)}
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-900 mb-2">
                  Most Expensive Service
                </div>
                <div className="text-lg font-bold text-purple-800">
                  {analytics.top_services?.[0]?.service || 'N/A'}
                </div>
                <div className="text-sm text-purple-600">
                  ${analytics.top_services?.[0]?.cost?.toFixed(2) || '0.00'} spent
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;