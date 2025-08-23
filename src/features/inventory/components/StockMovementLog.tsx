import { useState } from 'react'
import { ArrowUpDown, Package, Truck, AlertTriangle, Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface StockMovement {
  id: string
  productName: string
  sku: string
  type: 'stock-in' | 'stock-out' | 'transfer' | 'damage' | 'loss'
  quantity: number
  fromLocation: string
  toLocation?: string
  reason: string
  date: string
  user: string
  reference: string
}

interface StockMovementLogProps {
  movements: StockMovement[]
  onAddMovement: () => void
}

export const StockMovementLog = ({ movements, onAddMovement }: StockMovementLogProps) => {
  const [filterType, setFilterType] = useState<string>('all')

  const getMovementIcon = (type: StockMovement['type']) => {
    switch (type) {
      case 'stock-in':
        return <ArrowUpDown className="h-4 w-4 text-green-600" />
      case 'stock-out':
        return <ArrowUpDown className="h-4 w-4 text-red-600" />
      case 'transfer':
        return <Truck className="h-4 w-4 text-blue-600" />
      case 'damage':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'loss':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const getMovementTypeLabel = (type: StockMovement['type']) => {
    switch (type) {
      case 'stock-in':
        return 'Stock In'
      case 'stock-out':
        return 'Stock Out'
      case 'transfer':
        return 'Transfer'
      case 'damage':
        return 'Damage'
      case 'loss':
        return 'Loss'
      default:
        return 'Movement'
    }
  }

  const getMovementTypeColor = (type: StockMovement['type']) => {
    switch (type) {
      case 'stock-in':
        return 'bg-green-100 text-green-800'
      case 'stock-out':
        return 'bg-red-100 text-red-800'
      case 'transfer':
        return 'bg-blue-100 text-blue-800'
      case 'damage':
        return 'bg-orange-100 text-orange-800'
      case 'loss':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredMovements = filterType === 'all' 
    ? movements 
    : movements.filter(movement => movement.type === filterType)

  return (
    <Card className="rounded-2xl p-4 shadow-lg bg-white border-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black">Stock Movement Log</h3>
        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Movements</option>
            <option value="stock-in">Stock In</option>
            <option value="stock-out">Stock Out</option>
            <option value="transfer">Transfers</option>
            <option value="damage">Damage</option>
            <option value="loss">Loss</option>
          </select>
          <Button
            onClick={onAddMovement}
            className="bg-[#E5FF29] text-black hover:bg-[#e5ff29]/90"
          >
            <Package className="mr-2 h-4 w-4" />
            Add Movement
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325] rounded-l-xl">Type</th>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Product</th>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Quantity</th>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">From</th>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">To</th>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Reason</th>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Date</th>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">User</th>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325] rounded-r-xl">Reference</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.map((movement) => (
              <tr key={movement.id} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    {getMovementIcon(movement.type)}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getMovementTypeColor(movement.type)}`}>
                      {getMovementTypeLabel(movement.type)}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div>
                    <p className="font-medium text-black">{movement.productName}</p>
                    <p className="text-xs text-gray-500">{movement.sku}</p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className={`font-semibold ${
                    movement.type === 'stock-in' ? 'text-green-600' : 
                    movement.type === 'stock-out' ? 'text-red-600' : 
                    'text-black'
                  }`}>
                    {movement.type === 'stock-out' || movement.type === 'damage' || movement.type === 'loss' ? '-' : '+'}
                    {movement.quantity}
                  </span>
                </td>
                <td className="px-3 py-3 text-gray-600">{movement.fromLocation}</td>
                <td className="px-3 py-3 text-gray-600">{movement.toLocation || '-'}</td>
                <td className="px-3 py-3 text-gray-600 max-w-xs truncate">{movement.reason}</td>
                <td className="px-3 py-3 text-gray-600">
                  {new Date(movement.date).toLocaleDateString()}
                </td>
                <td className="px-3 py-3 text-gray-600">{movement.user}</td>
                <td className="px-3 py-3 text-gray-600 font-mono text-xs">{movement.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMovements.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No movements found for the selected filter.</p>
        </div>
      )}
    </Card>
  )
} 