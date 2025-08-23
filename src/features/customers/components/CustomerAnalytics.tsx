import { useState } from 'react'
import { TrendingUp, Users, DollarSign, Target, BarChart3, PieChart, Activity, Award } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'

interface CustomerSegment {
  id: string
  name: string
  description: string
  customerCount: number
  totalSpent: number
  averageSpent: number
  retentionRate: number
  color: string
}

interface CustomerInsight {
  id: string
  title: string
  description: string
  value: string
  change: number
  trend: 'up' | 'down' | 'stable'
  category: 'revenue' | 'loyalty' | 'credit' | 'engagement'
}

const mockSegments: CustomerSegment[] = [
  {
    id: '1',
    name: 'VIP Customers',
    description: 'High-value customers with excellent credit',
    customerCount: 45,
    totalSpent: 125000,
    averageSpent: 2778,
    retentionRate: 95,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: '2',
    name: 'Regular Customers',
    description: 'Consistent customers with good loyalty',
    customerCount: 180,
    totalSpent: 225000,
    averageSpent: 1250,
    retentionRate: 78,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: '3',
    name: 'New Customers',
    description: 'Recent customers with potential',
    customerCount: 75,
    totalSpent: 45000,
    averageSpent: 600,
    retentionRate: 45,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: '4',
    name: 'At Risk',
    description: 'Customers with declining engagement',
    customerCount: 30,
    totalSpent: 15000,
    averageSpent: 500,
    retentionRate: 25,
    color: 'from-red-500 to-pink-500'
  }
]

const mockInsights: CustomerInsight[] = [
  {
    id: '1',
    title: 'Customer Lifetime Value',
    description: 'Average customer value over time',
    value: '$2,450',
    change: 12.5,
    trend: 'up',
    category: 'revenue'
  },
  {
    id: '2',
    title: 'Loyalty Program Engagement',
    description: 'Active loyalty program participation',
    value: '78%',
    change: 8.2,
    trend: 'up',
    category: 'loyalty'
  },
  {
    id: '3',
    title: 'Credit Account Utilization',
    description: 'Average credit limit usage',
    value: '65%',
    change: -3.1,
    trend: 'down',
    category: 'credit'
  },
  {
    id: '4',
    title: 'Customer Retention Rate',
    description: 'Customers retained over 12 months',
    value: '82%',
    change: 5.7,
    trend: 'up',
    category: 'engagement'
  }
]

export const CustomerAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)

  const totalCustomers = mockSegments.reduce((sum, segment) => sum + segment.customerCount, 0)
  const totalRevenue = mockSegments.reduce((sum, segment) => sum + segment.totalSpent, 0)
  const averageRetention = mockSegments.reduce((sum, segment) => sum + segment.retentionRate, 0) / mockSegments.length

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Analytics</h2>
          <p className="text-gray-600 mt-1">Business intelligence and customer insights</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-32 px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29] focus:outline-none transition-all"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <PremiumButton variant="outline" size="sm" icon={BarChart3}>
            Export Report
          </PremiumButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{totalCustomers.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-black" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-black" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Retention</p>
              <p className="text-2xl font-bold text-gray-900">{averageRetention.toFixed(1)}%</p>
            </div>
            <div className="w-10 h-10 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-black" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Customer Segments</p>
              <p className="text-2xl font-bold text-gray-900">{mockSegments.length}</p>
            </div>
            <div className="w-10 h-10 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <PieChart className="h-5 w-5 text-black" />
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Customer Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-4">
            {mockInsights.map((insight) => (
              <PremiumCard key={insight.id} variant="default" className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">{insight.title}</h4>
                      {getTrendIcon(insight.trend)}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{insight.value}</span>
                      <span className={`text-xs font-medium ${getTrendColor(insight.trend)}`}>
                        {insight.change > 0 ? '+' : ''}{insight.change}%
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-[#E5FF29]/20 rounded-lg flex items-center justify-center">
                    <Award className="h-4 w-4 text-[#E5FF29]" />
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        </div>

        {/* Customer Segments */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
          <div className="space-y-4">
            {mockSegments.map((segment) => (
              <div
                key={segment.id}
                onClick={() => setSelectedSegment(selectedSegment === segment.id ? null : segment.id)}
                className="cursor-pointer"
              >
                <PremiumCard 
                  variant="default" 
                  className={`p-4 transition-all ${
                    selectedSegment === segment.id ? 'ring-2 ring-[#E5FF29]' : ''
                  }`}
                >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${segment.color}`}></div>
                      <h4 className="text-sm font-semibold text-gray-900">{segment.name}</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{segment.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">Customers:</span>
                        <span className="font-medium text-gray-900 ml-1">{segment.customerCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Revenue:</span>
                        <span className="font-medium text-gray-900 ml-1">${segment.totalSpent.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg. Spent:</span>
                        <span className="font-medium text-gray-900 ml-1">${segment.averageSpent}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Retention:</span>
                        <span className="font-medium text-gray-900 ml-1">{segment.retentionRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                </PremiumCard>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Predictive Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PremiumCard variant="default" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Customer Lifetime Value</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">VIP Customers</span>
              <span className="text-sm font-medium text-gray-900">$8,500</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Regular Customers</span>
              <span className="text-sm font-medium text-gray-900">$3,200</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '32%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Customers</span>
              <span className="text-sm font-medium text-gray-900">$1,800</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '18%' }}></div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="default" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Churn Risk Analysis</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low Risk</span>
              <span className="text-sm font-medium text-green-600">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium Risk</span>
              <span className="text-sm font-medium text-yellow-600">25%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High Risk</span>
              <span className="text-sm font-medium text-red-600">10%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '10%' }}></div>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Recommendations */}
      <PremiumCard variant="default" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
            <Award className="h-4 w-4 text-black" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Increase VIP Engagement</h4>
            <p className="text-xs text-blue-700">VIP customers show 95% retention. Consider exclusive offers to maintain engagement.</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-semibold text-green-900 mb-2">Loyalty Program Boost</h4>
            <p className="text-xs text-green-700">78% engagement rate is strong. Introduce tier-specific rewards to increase retention.</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">At-Risk Customers</h4>
            <p className="text-xs text-yellow-700">30 customers show declining engagement. Implement re-engagement campaigns.</p>
          </div>
        </div>
      </PremiumCard>
    </div>
  )
} 