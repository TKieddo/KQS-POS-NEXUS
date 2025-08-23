import { useState } from 'react'
import { FileText, Mail, Download, Calendar, Filter, Eye, Send, Clock } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { Modal } from '@/components/ui/modal'

interface Statement {
  id: string
  customerId: string
  customerName: string
  type: 'credit' | 'loyalty' | 'combined'
  period: string
  generatedDate: string
  status: 'draft' | 'sent' | 'delivered'
  totalAmount: number
  transactions: number
  downloadUrl?: string
}

interface StatementTemplate {
  id: string
  name: string
  description: string
  type: 'credit' | 'loyalty' | 'combined'
  isDefault: boolean
}

const mockStatements: Statement[] = [
  {
    id: '1',
    customerId: 'CUST-001',
    customerName: 'John Smith',
    type: 'combined',
    period: 'January 2024',
    generatedDate: '2024-01-31',
    status: 'sent',
    totalAmount: 1250.50,
    transactions: 8
  },
  {
    id: '2',
    customerId: 'CUST-002',
    customerName: 'Sarah Johnson',
    type: 'credit',
    period: 'January 2024',
    generatedDate: '2024-01-31',
    status: 'delivered',
    totalAmount: 2800.00,
    transactions: 12
  },
  {
    id: '3',
    customerId: 'CUST-003',
    customerName: 'Mike Wilson',
    type: 'loyalty',
    period: 'January 2024',
    generatedDate: '2024-01-31',
    status: 'draft',
    totalAmount: 0,
    transactions: 5
  }
]

const mockTemplates: StatementTemplate[] = [
  {
    id: '1',
    name: 'Standard Credit Statement',
    description: 'Monthly credit account statement with payment history',
    type: 'credit',
    isDefault: true
  },
  {
    id: '2',
    name: 'Loyalty Points Summary',
    description: 'Loyalty program activity and points summary',
    type: 'loyalty',
    isDefault: false
  },
  {
    id: '3',
    name: 'Combined Statement',
    description: 'Complete statement with both credit and loyalty information',
    type: 'combined',
    isDefault: false
  }
]

export const StatementGenerator = () => {
  const [selectedStatement, setSelectedStatement] = useState<Statement | null>(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'credit' | 'loyalty' | 'combined'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent' | 'delivered'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStatements = mockStatements.filter(statement => {
    const matchesTypeFilter = filter === 'all' || statement.type === filter
    const matchesStatusFilter = statusFilter === 'all' || statement.status === statusFilter
    const matchesSearch = statement.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTypeFilter && matchesStatusFilter && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'sent': return 'text-blue-600 bg-blue-100'
      case 'draft': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit': return '💳'
      case 'loyalty': return '⭐'
      case 'combined': return '📊'
      default: return '📄'
    }
  }

  const totalStatements = mockStatements.length
  const sentStatements = mockStatements.filter(s => s.status === 'sent').length
  const deliveredStatements = mockStatements.filter(s => s.status === 'delivered').length
  const draftStatements = mockStatements.filter(s => s.status === 'draft').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statement Generator</h2>
          <p className="text-gray-600 mt-1">Generate and manage customer statements</p>
        </div>
        <div className="flex gap-3">
          <PremiumButton variant="outline" size="sm" icon={Download}>
            Bulk Export
          </PremiumButton>
          <PremiumButton size="sm" icon={FileText} gradient="brand">
            Generate Statement
          </PremiumButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Statements</p>
              <p className="text-2xl font-bold text-gray-900">{totalStatements}</p>
            </div>
            <div className="w-10 h-10 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-black" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-blue-600">{sentStatements}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{deliveredStatements}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-yellow-600">{draftStatements}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <div className="flex items-center gap-2">
            {[
              { value: 'all', label: 'All Types' },
              { value: 'credit', label: 'Credit' },
              { value: 'loyalty', label: 'Loyalty' },
              { value: 'combined', label: 'Combined' }
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value as any)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === filterOption.value 
                    ? 'bg-[#E5FF29] text-black' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {[
              { value: 'all', label: 'All Status' },
              { value: 'draft', label: 'Draft' },
              { value: 'sent', label: 'Sent' },
              { value: 'delivered', label: 'Delivered' }
            ].map((statusOption) => (
              <button
                key={statusOption.value}
                onClick={() => setStatusFilter(statusOption.value as any)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === statusOption.value 
                    ? 'bg-[#E5FF29] text-black' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {statusOption.label}
              </button>
            ))}
          </div>
        </div>
        
        <PremiumInput
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
          className="w-64 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
        />
      </div>

      {/* Statements Table */}
      <PremiumCard variant="default" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statement Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generated Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStatements.map((statement) => (
                <tr key={statement.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{statement.customerName}</div>
                      <div className="text-sm text-gray-500">{statement.customerId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(statement.type)}</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">{statement.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{statement.period}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{statement.generatedDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${statement.totalAmount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{statement.transactions} transactions</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(statement.status)}`}>
                      {statement.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedStatement(statement)}
                        className="text-[#E5FF29] hover:text-[#E5FF29]/80 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowEmailModal(true)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800 transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PremiumCard>

      {/* Statement Templates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statement Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockTemplates.map((template) => (
            <PremiumCard key={template.id} variant="default" className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-black" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">{template.name}</h4>
                </div>
                {template.isDefault && (
                  <span className="text-xs font-medium text-[#E5FF29] bg-[#E5FF29]/10 px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 capitalize">{template.type}</span>
                <PremiumButton size="sm" variant="outline">
                  Use Template
                </PremiumButton>
              </div>
            </PremiumCard>
          ))}
        </div>
      </div>

      {/* Generate Statement Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Statement"
        maxWidth="lg"
      >
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PremiumInput
              label="Customer"
              placeholder="Select customer"
              size="sm"
              className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
            />
            <PremiumInput
              label="Statement Type"
              placeholder="Select type"
              size="sm"
              className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
            />
            <PremiumInput
              label="Period Start"
              type="date"
              size="sm"
              className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
            />
            <PremiumInput
              label="Period End"
              type="date"
              size="sm"
              className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <PremiumButton variant="outline" onClick={() => setShowGenerateModal(false)}>
              Cancel
            </PremiumButton>
            <PremiumButton gradient="brand">
              Generate Statement
            </PremiumButton>
          </div>
        </div>
      </Modal>

      {/* Email Statement Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Send Statement via Email"
        maxWidth="md"
      >
        <div className="p-6 space-y-4">
          <PremiumInput
            label="Email Address"
            type="email"
            placeholder="customer@example.com"
            size="sm"
            className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
          />
          <PremiumInput
            label="Subject"
            placeholder="Your statement for January 2024"
            size="sm"
            className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              rows={4}
              className="w-full p-3 bg-white border border-gray-200 focus:border-[#E5FF29] focus:ring-2 focus:ring-[#E5FF29]/20 rounded-xl transition-all duration-300 text-sm"
              placeholder="Optional custom message..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <PremiumButton variant="outline" onClick={() => setShowEmailModal(false)}>
              Cancel
            </PremiumButton>
            <PremiumButton gradient="brand" icon={Send}>
              Send Statement
            </PremiumButton>
          </div>
        </div>
      </Modal>
    </div>
  )
} 