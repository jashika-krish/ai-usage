import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Users, 
  Zap,
  Database,
  Clock,
  AlertTriangle
} from 'lucide-react';
import StatsCard from './StatsCard';
import UsageChart from './UsageChart';
import TopModelsChart from './TopModelsChart';
import RecentEvents from './RecentEvents';
import FilterPanel from './FilterPanel';

const Dashboard = ({ 
  analytics, 
  events, 
  loading, 
  filters, 
  updateFilters, 
  onGenerateDemoData 
}) => {
  if (loading && !analytics) {
    return (
      <div className="animate-fade-in">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasData = analytics && analytics.total_events > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Demo Data Section */}
      {!hasData && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">No Data Available</h3>
                  <p className="text-sm text-blue-700">
                    Generate demo data to explore the AI Usage Analyzer features
                  </p>
                </div>
              </div>
              <Button
                onClick={onGenerateDemoData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="generate-demo-data-btn"
              >
                <Zap className="h-4 w-4 mr-2" />
                {loading ? 'Generating...' : 'Generate Demo Data'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Panel */}
      <FilterPanel 
        filters={filters} 
        updateFilters={updateFilters}
        analytics={analytics}
      />

      {/* Stats Cards */}
      {analytics && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Events"
            value={analytics.total_events.toLocaleString()}
            change={`+${analytics.events_last_24h}`}
            changeLabel="last 24h"
            icon={Activity}
            color="blue"
          />
          <StatsCard
            title="Total Cost"
            value={`$${analytics.total_cost.toFixed(2)}`}
            change={`$${analytics.cost_last_24h.toFixed(2)}`}
            changeLabel="last 24h"
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title="Active Users"
            value={analytics.top_users?.length || 0}
            change="tracking"
            changeLabel="users"
            icon={Users}
            color="purple"
          />
          <StatsCard
            title="Models Used"
            value={analytics.top_models?.length || 0}
            change="tracking"
            changeLabel="models"
            icon={TrendingUp}
            color="orange"
          />
        </div>
      )}

      {/* Charts Section */}
      {analytics && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Usage Over Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UsageChart data={analytics.usage_over_time} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-green-600" />
                <span>Top Models</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TopModelsChart data={analytics.top_models} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Lists Section */}
      {analytics && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Top Users</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.top_users?.map((user, index) => (
                  <div key={user.user_id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.user_id}</div>
                        <div className="text-sm text-gray-500">{user.count} events</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">${user.cost?.toFixed(2) || '0.00'}</div>
                      <div className="text-xs text-gray-500">cost</div>
                    </div>
                  </div>
                ))}
                {(!analytics.top_users || analytics.top_users.length === 0) && (
                  <div className="text-center text-gray-500 py-4">No users data available</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-orange-600" />
                <span>Top Services</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.top_services?.map((service, index) => (
                  <div key={service.service} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{service.service}</div>
                        <div className="text-sm text-gray-500">{service.count} events</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">${service.cost?.toFixed(2) || '0.00'}</div>
                      <div className="text-xs text-gray-500">cost</div>
                    </div>
                  </div>
                ))}
                {(!analytics.top_services || analytics.top_services.length === 0) && (
                  <div className="text-center text-gray-500 py-4">No services data available</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts/Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <div className="font-medium text-green-900">API Ingestion</div>
                      <div className="text-sm text-green-700">Operational</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <div>
                      <div className="font-medium text-blue-900">Data Processing</div>
                      <div className="text-sm text-blue-700">Running</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Live
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-yellow-900">S3 Storage</div>
                      <div className="text-sm text-yellow-700">Configured</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Ready
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Events */}
      {events && events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Recent Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentEvents events={events.slice(0, 10)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;