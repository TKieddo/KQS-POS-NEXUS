'use client'

import React, { useState } from 'react'
import { 
  Search, 
  Edit, 
  Calendar, 
  Receipt,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EditSaleModal } from '@/features/pos/components/sales/EditSaleModal'
import { formatCurrency } from '@/lib/utils'
import { PageHeader } from '@/components/ui/page-header'

interface Sale {
  id: string
  receiptNumber: string
  customerName: string
  date: string
  time: string
  total: number
  items: number
  status: 'completed' | 'pending' | 'cancelled'
  paymentMethod: string
}

export default function EditSalesPage() {
  const [sales, setSales] = useState<Sale[]>([
    {
      id: '1',
      receiptNumber: 'RCP-001',
      customerName: 'John Doe',
      date: '2024-01-15',
      time: '14:30',
      total: 125.50,
      items: 3,
      status: 'completed',
      paymentMethod: 'Credit Card'
    },
    {
      id: '2',
      receiptNumber: 'RCP-002',
      customerName: 'Jane Smith',
      date: '2024-01-15',
      time: '15:45',
      total: 89.99,
      items: 2,
      status: 'completed',
      paymentMethod: 'Cash'
    },
    {
      id: '3',
      receiptNumber: 'RCP-003',
      customerName: 'Mike Johnson',
      date: '2024-01-14',
      time: '12:15',
      total: 234.75,
      items: 5,
      status: 'completed',
      paymentMethod: 'Credit Card'
    }
  ])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale)
    setShowEditModal(true)
  }

  const handleSaveSale = (updatedSale: any) => {
    console.log('Sale updated:', updatedSale)
    // Update the sale in the list
    setSales(prev => prev.map(sale => 
      sale.id === updatedSale.id ? { ...sale, ...updatedSale } : sale
    ))
    setShowEditModal(false)
    setSelectedSale(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PageHeader
        title="Edit Sales"
        description="Modify existing sales and payments"
        icon={<Edit className="h-4 w-4 text-black" />}
      />

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search sales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Recent Sales ({filteredSales.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSales.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No sales found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-gray-600" />
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">
                            {sale.receiptNumber}
                          </h3>
                          <Badge className={getStatusColor(sale.status)}>
                            {sale.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{sale.customerName}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {sale.date} at {sale.time}
                          </span>
                          <span>{sale.items} items</span>
                          <span>{sale.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(sale.total)}
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSale(sale)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        {selectedSale && (
          <EditSaleModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setSelectedSale(null)
            }}
            saleId={selectedSale.id}
            onSave={handleSaveSale}
          />
        )}
      </div>
    </div>
  )
} 