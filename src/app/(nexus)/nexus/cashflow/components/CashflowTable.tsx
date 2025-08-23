import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign,
  Receipt,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { CashflowEntry } from '../types/cashflow'

interface CashflowTableProps {
  entries: CashflowEntry[]
  onEdit: (entry: CashflowEntry) => void
  onDelete: (id: string) => void
}

export function CashflowTable({ entries, onEdit, onDelete }: CashflowTableProps) {
  const { formatCurrency } = useCurrency()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'expense':
        return 'destructive'
      case 'income':
        return 'default'
      case 'sale':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'expense':
        return 'text-red-600'
      case 'income':
        return 'text-green-600'
      case 'sale':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Cashflow Entries ({entries.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-black text-white">
                <th className="text-left py-3 px-4 font-medium text-xs">Date</th>
                <th className="text-left py-3 px-4 font-medium text-xs">Branch</th>
                <th className="text-left py-3 px-4 font-medium text-xs">Type</th>
                <th className="text-left py-3 px-4 font-medium text-xs">Category</th>
                <th className="text-left py-3 px-4 font-medium text-xs">Description</th>
                <th className="text-left py-3 px-4 font-medium text-xs">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-xs">Receipt</th>
                <th className="text-left py-3 px-4 font-medium text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-xs">
                    {formatDate(entry.entry_date)}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {entry.branch_name || 'Unknown'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={getTypeBadgeVariant(entry.entry_type)} className="text-xs">
                      {entry.entry_type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {entry.category}
                  </td>
                  <td className="py-3 px-4 text-xs max-w-xs truncate" title={entry.description}>
                    {entry.description || '-'}
                  </td>
                  <td className={`py-3 px-4 text-xs font-medium ${getTypeColor(entry.entry_type)}`}>
                    {formatCurrency(entry.amount)}
                  </td>
                  <td className="py-3 px-4">
                    {entry.receipt_url ? (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Receipt className="h-3 w-3" />
                      </Button>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEdit(entry)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onDelete(entry.id)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {entries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No entries found</p>
            <p className="text-xs text-gray-400 mt-1">Add your first cashflow entry to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
