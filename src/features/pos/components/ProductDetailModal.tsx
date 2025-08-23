'use client'

import React from 'react'
import { X, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '../types'

interface ProductDetailModalProps {
  product: Product
  onClose: () => void
  onAddToOrder: () => void
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToOrder
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header - Always Visible */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content - Horizontal Layout */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex gap-6">
            {/* Left Side - Product Image */}
            <div className="flex-shrink-0">
              <div className="w-64 h-64 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Product Information */}
            <div className="flex-1 min-w-0">
              {/* Product Name and Price */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
                  {product.name}
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </p>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Description</h4>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>

              {/* Product Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Product Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 text-sm">Product Information</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{product.category_name || 'Uncategorized'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">SKU:</span>
                      <span className="font-medium">{product.sku || 'N/A'}</span>
                    </div>
                    {product.barcode && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Barcode:</span>
                        <span className="font-medium">{product.barcode}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`font-medium ${product.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {product.has_variants && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Variants:</span>
                        <span className="font-medium text-blue-600">Available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock & Pricing */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 text-sm">Stock & Pricing</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Available Stock:</span>
                      <span className={`font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock_quantity} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Unit Price:</span>
                      <span className="font-medium">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cost Price:</span>
                      <span className="font-medium">{formatCurrency(product.cost_price || 0)}</span>
                    </div>
                    {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Stock Level:</span>
                        <span className="font-medium text-orange-600">Low Stock</span>
                      </div>
                    )}
                    {product.stock_quantity === 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Stock Level:</span>
                        <span className="font-medium text-red-600">Out of Stock</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-1 text-sm">Low Stock Warning</h4>
                  <p className="text-orange-700 text-xs">
                    Only {product.stock_quantity} units remaining. Consider reordering soon.
                  </p>
                </div>
              )}

              {product.stock_quantity === 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-1 text-sm">Out of Stock</h4>
                  <p className="text-red-700 text-xs">
                    This product is currently out of stock and cannot be added to orders.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Always Visible */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1 border-gray-200 hover:bg-gray-50 h-10 text-sm font-medium"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className="flex-1 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 h-10 text-sm font-semibold"
              onClick={onAddToOrder}
            >
              Add to Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 