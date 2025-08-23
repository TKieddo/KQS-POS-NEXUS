'use client'

import { useState } from 'react'
import { Package, AlertTriangle, CheckCircle, X, RefreshCw, TrendingDown, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ReservedItem {
  id: string
  productName: string
  sku: string
  quantity: number
  laybyeId: string
  customerName: string
  reservedDate: string
  status: 'reserved' | 'returned' | 'sold'
}

interface InventoryOversightPanelProps {
  reservedItems: ReservedItem[]
  onReturnToInventory: (itemId: string) => void
  onViewLaybye: (laybyeId: string) => void
}

export function InventoryOversightPanel({ 
  reservedItems, 
  onReturnToInventory, 
  onViewLaybye 
}: InventoryOversightPanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'reserved' | 'returned' | 'sold'>('all')

  const filteredItems = reservedItems.filter(item => {
    if (selectedFilter === 'all') return true
    return item.status === selectedFilter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reserved': return <Package className="h-4 w-4 text-blue-600" />
      case 'returned': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'sold': return <TrendingDown className="h-4 w-4 text-purple-600" />
      default: return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reserved': return 'bg-blue-100 text-blue-800'
      case 'returned': return 'bg-green-100 text-green-800'
      case 'sold': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTotalReservedValue = () => {
    return reservedItems
      .filter(item => item.status === 'reserved')
      .reduce((sum, item) => sum + (item.quantity * 100), 0) // Mock value calculation
  }

  const getReservedCount = () => {
    return reservedItems.filter(item => item.status === 'reserved').length
  }

  const getReturnedCount = () => {
    return reservedItems.filter(item => item.status === 'returned').length
  }

  return (
    <div className="space-y-6 px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
            Inventory Oversight
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage reserved inventory for lay-byes
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="border-gray-200 hover:bg-gray-50"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Currently Reserved</p>
              <p className="text-2xl font-bold text-blue-600">
                {getReservedCount()}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Returned to Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {getReturnedCount()}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reserved Value</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                ${getTotalReservedValue().toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border-gray-200">
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All Items' },
            { value: 'reserved', label: 'Reserved' },
            { value: 'returned', label: 'Returned' },
            { value: 'sold', label: 'Sold' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === filter.value
                  ? 'bg-[#E5FF29] text-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Reserved Items Table */}
      <Card className="border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lay-bye
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reserved Date
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
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[hsl(var(--primary))]">
                      {item.productName}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {item.sku}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[hsl(var(--primary))]">
                      {item.quantity}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onViewLaybye(item.laybyeId)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {item.laybyeId}
                    </button>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[hsl(var(--primary))]">
                      {item.customerName}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(item.reservedDate).toLocaleDateString()}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {item.status === 'reserved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReturnToInventory(item.id)}
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Return
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewLaybye(item.laybyeId)}
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        View Lay-bye
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-500">No reserved items found</p>
            <p className="text-sm text-gray-400">Items will appear here when reserved for lay-byes</p>
          </div>
        )}
      </Card>
    </div>
  )
} 