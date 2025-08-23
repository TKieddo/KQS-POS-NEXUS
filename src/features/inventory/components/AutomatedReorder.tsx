import React, { useState, useEffect } from 'react'
import { AlertTriangle, Package, Settings, Truck, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface ReorderSuggestion {
  id: string
  productName: string
  sku: string
  currentStock: number
  reorderPoint: number
  suggestedQuantity: number
  supplier: string
  leadTime: number
  cost: number
  priority: 'high' | 'medium' | 'low'
  lastOrderDate: string
}

interface ReorderRule {
  id: string
  productId: string
  productName: string
  reorderPoint: number
  reorderQuantity: number
  supplier: string
  leadTime: number
  isActive: boolean
}

interface AutomatedReorderProps {
  suggestions: ReorderSuggestion[]
  rules: ReorderRule[]
  onReorder: (suggestion: ReorderSuggestion) => void
  onBulkReorder: (suggestions: ReorderSuggestion[]) => void
  onManageRules: () => void
}

export const AutomatedReorder = ({
  suggestions,
  rules,
  onReorder,
  onBulkReorder,
  onManageRules
}: AutomatedReorderProps) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  const [filterPriority, setFilterPriority] = useState<string>('all')

  const getPriorityColor = (priority: ReorderSuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityIcon = (priority: ReorderSuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'low':
        return <Package className="h-4 w-4 text-green-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredSuggestions = filterPriority === 'all' 
    ? suggestions 
    : suggestions.filter(suggestion => suggestion.priority === filterPriority)

  const handleSelectSuggestion = (id: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedSuggestions.length === filteredSuggestions.length) {
      setSelectedSuggestions([])
    } else {
      setSelectedSuggestions(filteredSuggestions.map(s => s.id))
    }
  }

  const selectedSuggestionsData = suggestions.filter(s => selectedSuggestions.includes(s.id))

  return (
    <div className="space-y-6">
      {/* Reorder Suggestions */}
      <Card className="rounded-2xl p-4 shadow-lg bg-white border-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-black">Reorder Suggestions</h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {suggestions.filter(s => s.priority === 'high').length} High Priority
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <Button
              onClick={onManageRules}
              variant="outline"
              className="border-gray-300 text-black hover:bg-gray-50"
            >
              <Settings className="mr-2 h-4 w-4" />
              Manage Rules
            </Button>
            {selectedSuggestions.length > 0 && (
              <Button
                onClick={() => onBulkReorder(selectedSuggestionsData)}
                className="bg-[#E5FF29] text-black hover:bg-[#e5ff29]/90"
              >
                <Truck className="mr-2 h-4 w-4" />
                Bulk Reorder ({selectedSuggestions.length})
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325] rounded-l-xl">
                  <input
                    type="checkbox"
                    checked={selectedSuggestions.length === filteredSuggestions.length && filteredSuggestions.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Product</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Current Stock</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Reorder Point</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Suggested Qty</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Supplier</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Lead Time</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Cost</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Priority</th>
                <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325] rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuggestions.map((suggestion) => (
                <tr key={suggestion.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedSuggestions.includes(suggestion.id)}
                      onChange={() => handleSelectSuggestion(suggestion.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div>
                      <p className="font-medium text-black">{suggestion.productName}</p>
                      <p className="text-xs text-gray-500">{suggestion.sku}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`font-semibold ${
                      suggestion.currentStock <= suggestion.reorderPoint ? 'text-red-600' : 'text-black'
                    }`}>
                      {suggestion.currentStock}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-600">{suggestion.reorderPoint}</td>
                  <td className="px-3 py-3 font-semibold text-black">{suggestion.suggestedQuantity}</td>
                  <td className="px-3 py-3 text-gray-600">{suggestion.supplier}</td>
                  <td className="px-3 py-3 text-gray-600">{suggestion.leadTime} days</td>
                  <td className="px-3 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(suggestion.cost)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(suggestion.priority)}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Button
                      size="sm"
                      onClick={() => onReorder(suggestion)}
                      className="bg-[#E5FF29] text-black hover:bg-[#e5ff29]/90"
                    >
                      <Truck className="mr-1 h-3 w-3" />
                      Reorder
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSuggestions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No reorder suggestions found.</p>
          </div>
        )}
      </Card>

      {/* Reorder Rules Summary */}
      <Card className="rounded-2xl p-4 shadow-lg bg-white border-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">Reorder Rules</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Active Rules: {rules.filter(r => r.isActive).length}</span>
            <span>Total Rules: {rules.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.slice(0, 6).map((rule) => (
            <div key={rule.id} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-black truncate">{rule.productName}</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {rule.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Reorder Point: {rule.reorderPoint}</p>
                <p>Reorder Quantity: {rule.reorderQuantity}</p>
                <p>Supplier: {rule.supplier}</p>
                <p>Lead Time: {rule.leadTime} days</p>
              </div>
            </div>
          ))}
        </div>

        {rules.length > 6 && (
          <div className="text-center mt-4">
            <Button
              variant="outline"
              onClick={onManageRules}
              className="border-gray-300 text-black hover:bg-gray-50"
            >
              View All Rules ({rules.length})
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
} 