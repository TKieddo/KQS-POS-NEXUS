'use client'

import React from 'react'
import { Package, Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '../types'

interface ProductGridProps {
  products: Product[]
  loading: boolean
  selectedCategory: string
  onProductSelect: (product: Product) => void
  onAddToOrder: (product: Product) => void
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  selectedCategory,
  onProductSelect,
  onAddToOrder
}) => {
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category_id === selectedCategory)

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <Card key={index} className="p-4 animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-6 rounded mb-2"></div>
              <div className="bg-gray-200 h-8 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">
            {selectedCategory === 'all' 
              ? 'No products available in this category'
              : 'Try selecting a different category or search for products'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="grid grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={onProductSelect}
            onAddToOrder={onAddToOrder}
          />
        ))}
      </div>
    </div>
  )
}

interface ProductCardProps {
  product: Product
  onSelect: (product: Product) => void
  onAddToOrder: (product: Product) => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onAddToOrder }) => {
  const isLowStock = product.stock_quantity <= 5
  const isOutOfStock = product.stock_quantity === 0

  return (
    <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 bg-white" style={{ border: '0.5px solid #000000' }}>
      {/* Product Image */}
      <div className="relative p-0.5">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        )}
        
        {/* View Details Button */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 h-6 w-6 p-0 bg-white/80 hover:bg-white rounded-sm"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(product)
          }}
        >
          <Eye className="h-3 w-3" />
        </Button>
        
        {/* Stock indicator */}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            Low Stock
          </div>
        )}
        
        {isOutOfStock && (
          <div className="absolute top-2 left-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(product.price)}
          </span>
          
          {!isOutOfStock && (
            <Button
              size="sm"
              className="bg-black text-white hover:bg-gray-800 h-8 w-8 p-0 rounded-full"
              onClick={(e) => {
                e.stopPropagation()
                onAddToOrder(product)
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Stock info */}
        <div className="text-xs text-gray-500">
          Stock: {product.stock_quantity} units
        </div>
      </div>
    </Card>
  )
} 