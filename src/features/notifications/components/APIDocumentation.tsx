import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Code, 
  Copy, 
  Check, 
  ExternalLink,
  Download,
  Play,
  Terminal
} from 'lucide-react'

export interface APIDocumentationProps {
  className?: string
}

export const APIDocumentation: React.FC<APIDocumentationProps> = ({ className }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (code: string, language: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(language)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const codeExamples = {
    javascript: `// Send notification via JavaScript
const sendNotification = async (data) => {
  const response = await fetch('/api/notifications/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      type: 'email',
      recipient: 'user@example.com',
      subject: 'Test Notification',
      message: 'This is a test notification',
      template: 'default'
    })
  });
  
  return response.json();
};`,

    curl: `# Send notification via cURL
curl -X POST https://api.kqspos.com/notifications/send \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "type": "email",
    "recipient": "user@example.com",
    "subject": "Test Notification",
    "message": "This is a test notification",
    "template": "default"
  }'`,

    python: `# Send notification via Python
import requests

def send_notification(data):
    url = "https://api.kqspos.com/notifications/send"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_API_KEY"
    }
    
    response = requests.post(url, json=data, headers=headers)
    return response.json()

# Example usage
notification_data = {
    "type": "email",
    "recipient": "user@example.com",
    "subject": "Test Notification",
    "message": "This is a test notification",
    "template": "default"
}

result = send_notification(notification_data)
print(result)`,

    webhook: `// Webhook endpoint example
app.post('/webhook/notifications', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;
  
  // Verify webhook signature
  if (!verifySignature(signature, payload, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process notification
  const { type, recipient, subject, message } = payload;
  
  // Your notification logic here
  console.log('Received notification:', { type, recipient, subject, message });
  
  res.json({ success: true });
});`
  }

  const endpoints = [
    {
      method: 'POST',
      path: '/api/notifications/send',
      description: 'Send a notification',
      parameters: [
        { name: 'type', type: 'string', required: true, description: 'Notification type (email, sms, push)' },
        { name: 'recipient', type: 'string', required: true, description: 'Recipient address/number' },
        { name: 'subject', type: 'string', required: false, description: 'Notification subject' },
        { name: 'message', type: 'string', required: true, description: 'Notification message' },
        { name: 'template', type: 'string', required: false, description: 'Template name' }
      ]
    },
    {
      method: 'GET',
      path: '/api/notifications/rules',
      description: 'Get notification rules',
      parameters: [
        { name: 'branch_id', type: 'string', required: false, description: 'Branch ID filter' },
        { name: 'type', type: 'string', required: false, description: 'Filter by notification type' },
        { name: 'active', type: 'boolean', required: false, description: 'Filter by active status' }
      ]
    },
    {
      method: 'POST',
      path: '/api/notifications/rules',
      description: 'Create notification rule',
      parameters: [
        { name: 'name', type: 'string', required: true, description: 'Rule name' },
        { name: 'type', type: 'string', required: true, description: 'Notification type' },
        { name: 'condition', type: 'string', required: true, description: 'Trigger condition' },
        { name: 'action', type: 'string', required: true, description: 'Action frequency' },
        { name: 'recipients', type: 'array', required: true, description: 'Recipient list' }
      ]
    },
    {
      method: 'GET',
      path: '/api/notifications/logs',
      description: 'Get notification logs',
      parameters: [
        { name: 'limit', type: 'number', required: false, description: 'Number of logs to return' },
        { name: 'status', type: 'string', required: false, description: 'Filter by status' },
        { name: 'type', type: 'string', required: false, description: 'Filter by type' }
      ]
    }
  ]

  return (
    <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-xl font-semibold text-gray-900">API Documentation</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Docs
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          {/* Quick Start */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Quick Start</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                Get started with the KQS POS Notification API in minutes. All requests require authentication using your API key.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-900">Base URL:</span>
                <code className="bg-white px-2 py-1 rounded border">https://api.kqspos.com</code>
                <Button
                  onClick={() => copyToClipboard('https://api.kqspos.com', 'base-url')}
                  variant="ghost"
                  size="sm"
                >
                  {copiedCode === 'base-url' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Code Examples</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Object.entries(codeExamples).map(([language, code]) => (
                <div key={language} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 capitalize">{language}</h4>
                    <Button
                      onClick={() => copyToClipboard(code, language)}
                      variant="ghost"
                      size="sm"
                    >
                      {copiedCode === language ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* API Endpoints */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">API Endpoints</h3>
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                      endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {endpoint.path}
                    </code>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>
                  
                  {endpoint.parameters.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-900">Parameters:</h5>
                      <div className="space-y-1">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <div key={paramIndex} className="flex items-start gap-2 text-sm">
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                              {param.name}
                            </code>
                            <span className="text-gray-500">({param.type})</span>
                            {param.required && (
                              <span className="text-red-500 text-xs">required</span>
                            )}
                            <span className="text-gray-600">- {param.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Authentication */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Authentication</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-3">
                All API requests require authentication using your API key. Include it in the Authorization header:
              </p>
              <div className="bg-blue-900 text-blue-100 p-3 rounded text-sm font-mono">
                Authorization: Bearer YOUR_API_KEY
              </div>
            </div>
          </div>

          {/* Rate Limiting */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Rate Limiting</h3>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                API requests are rate limited to prevent abuse:
              </p>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• 60 requests per minute for standard accounts</li>
                <li>• 300 requests per minute for premium accounts</li>
                <li>• Rate limit headers are included in all responses</li>
              </ul>
            </div>
          </div>

          {/* Error Handling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Error Handling</h3>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Common Error Codes</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-4">
                    <code className="text-red-600">400</code>
                    <span className="text-gray-600">Bad Request - Invalid parameters</span>
                  </div>
                  <div className="flex gap-4">
                    <code className="text-red-600">401</code>
                    <span className="text-gray-600">Unauthorized - Invalid API key</span>
                  </div>
                  <div className="flex gap-4">
                    <code className="text-red-600">429</code>
                    <span className="text-gray-600">Too Many Requests - Rate limit exceeded</span>
                  </div>
                  <div className="flex gap-4">
                    <code className="text-red-600">500</code>
                    <span className="text-gray-600">Internal Server Error</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Testing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Interactive Testing</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                Test the API endpoints directly from your browser using our interactive documentation.
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Play className="h-4 w-4 mr-2" />
                Open Interactive Docs
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 