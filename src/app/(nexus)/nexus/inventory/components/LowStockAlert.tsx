import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Package, Plus, Eye } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { Product } from '../hooks/useInventory'

interface LowStockAlertProps {
  products: Product[]
  onViewAllAlerts: () => void
}

export function LowStockAlert({ products, onViewAllAlerts }: LowStockAlertProps) {
  if (products.length === 0) {
    return null
  }

  const { formatCurrency } = useCurrency()

  const outOfStockProducts = products.filter(p => p.stock_quantity === 0)
  const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= (p.min_stock_level || 10))

  return (
    <Card className="bg-white border-0 shadow-lg rounded-3xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
          <div className="w-8 h-8 bg-[#E5FF29] rounded-2xl flex items-center justify-center mr-3">
            <AlertTriangle className="h-4 w-4 text-black" />
          </div>
          Stock Alerts ({products.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Out of Stock */}
          {outOfStockProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 flex items-center text-sm">
                  <div className="w-5 h-5 bg-red-100 rounded-lg flex items-center justify-center mr-2">
                    <Package className="h-3 w-3 text-red-600" />
                  </div>
                  Out of Stock
                </h4>
                <Badge className="bg-red-100 text-red-800 border-0 px-2 py-0.5 text-xs">
                  {outOfStockProducts.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {outOfStockProducts.slice(0, 3).map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-2xl border border-red-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                        <Package className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {product.category} • {product.sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-red-600">0 units</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(product.price || 0)} each
                      </p>
                    </div>
                  </div>
                ))}
                {outOfStockProducts.length > 3 && (
                  <p className="text-xs text-gray-500 text-center py-1">
                    +{outOfStockProducts.length - 3} more out of stock items
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Low Stock */}
          {lowStockProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 flex items-center text-sm">
                  <div className="w-5 h-5 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                    <AlertTriangle className="h-3 w-3 text-orange-600" />
                  </div>
                  Low Stock
                </h4>
                <Badge className="bg-orange-100 text-orange-800 border-0 px-2 py-0.5 text-xs">
                  {lowStockProducts.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {lowStockProducts.slice(0, 3).map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50/50 rounded-2xl border border-orange-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Package className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {product.category} • {product.sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-orange-600">
                        {product.stock_quantity} units
                      </p>
                      <p className="text-xs text-gray-500">
                        Threshold: {product.min_stock_level || 10}
                      </p>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length > 3 && (
                  <p className="text-xs text-gray-500 text-center py-1">
                    +{lowStockProducts.length - 3} more low stock items
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3">
            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 shadow-sm text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Restock Items
            </Button>
            <Button size="sm" variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 text-xs" onClick={onViewAllAlerts}>
              <Eye className="h-3 w-3 mr-1" />
              View All Alerts
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
