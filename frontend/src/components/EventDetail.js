import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ArrowLeft,
  Clock,
  User,
  Zap,
  DollarSign,
  Database,
  Shield,
  Eye,
  AlertTriangle,
  Copy,
  ExternalLink
} from 'lucide-react';

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // Mock event data for now - in real app, fetch from API
  const mockEvent = {
    id: eventId,
    timestamp: new Date().toISOString(),
    provider: 'openai',
    model: 'gpt-4',
    event_type: 'text_generation',
    user_id: 'user-001',
    service: 'web-app',
    prompt_tokens: 150,
    completion_tokens: 75,
    total_tokens: 225,
    cost_usd: 0.0045,
    has_pii: true,
    redacted_prompt: 'Please analyze the customer feedback and provide suggestions for [REDACTED-EMAIL]',
    s3_key: 'prompts/12345.txt',
    prompt_hash: 'a1b2c3d4e5f6...',
    response_hash: 'x1y2z3w4v5u6...',
    metadata: {
      demo: true,
      batch_id: 'batch-001',
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...'
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // In real app, show toast notification
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            data-testid="back-button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Event Details</h1>
            <p className="text-gray-600">Event ID: {eventId}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" data-testid="export-event-btn">
            <ExternalLink className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Event Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Timing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-600">Timestamp</div>
                <div className="font-medium">{formatTime(mockEvent.timestamp)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-600" />
              <span>Model Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="secondary" 
                  className={getProviderColor(mockEvent.provider)}
                >
                  {mockEvent.provider}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-gray-600">Model</div>
                <div className="font-medium">{mockEvent.model}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Event Type</div>
                <div className="font-medium">{mockEvent.event_type.replace('_', ' ')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <span>Usage & Cost</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-600">Total Tokens</div>
                <div className="font-medium">{mockEvent.total_tokens?.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Cost</div>
                <div className="font-medium text-green-600">${mockEvent.cost_usd?.toFixed(4)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-orange-600" />
            <span>Request Context</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-gray-600 mb-1">User ID</div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{mockEvent.user_id}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(mockEvent.user_id)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Service</div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{mockEvent.service}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Usage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span>Token Usage Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-800">
                {mockEvent.prompt_tokens?.toLocaleString()}
              </div>
              <div className="text-sm text-blue-600">Prompt Tokens</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800">
                {mockEvent.completion_tokens?.toLocaleString()}
              </div>
              <div className="text-sm text-green-600">Completion Tokens</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-800">
                {mockEvent.total_tokens?.toLocaleString()}
              </div>
              <div className="text-sm text-purple-600">Total Tokens</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content & Security */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-gray-600" />
              <span>Content Preview</span>
              {mockEvent.has_pii && (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  PII Detected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {mockEvent.has_pii ? 'Redacted Prompt' : 'Prompt'}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800">
                    {mockEvent.redacted_prompt}
                  </p>
                </div>
              </div>
              
              {mockEvent.s3_key && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-blue-900">
                      Full Content Available
                    </div>
                    <div className="text-xs text-blue-600">
                      Stored in S3: {mockEvent.s3_key}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Access
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>Security & Hashes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Prompt Hash</div>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-gray-100 p-2 rounded flex-1 font-mono">
                    {mockEvent.prompt_hash}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(mockEvent.prompt_hash)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Response Hash</div>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-gray-100 p-2 rounded flex-1 font-mono">
                    {mockEvent.response_hash}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(mockEvent.response_hash)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    Content Encrypted & Stored Securely
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      {mockEvent.metadata && Object.keys(mockEvent.metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-gray-600" />
              <span>Additional Metadata</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {Object.entries(mockEvent.metadata).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">{key}</span>
                  <span className="text-sm text-gray-600">{String(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventDetail;