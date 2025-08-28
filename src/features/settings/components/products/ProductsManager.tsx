'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Package, ExternalLink, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  color: string
}

interface Product {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  price: number
  stock_quantity: number
  has_variants: boolean
  is_active: boolean
  category: Category | null
  created_at: string
}

export const ProductsManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          sku,
          barcode,
          price,
          stock_quantity,
          has_variants,
          is_active,
          created_at,
          category:categories(id, name, color)
        `)
        .order('name')
        .limit(50) // Limit for performance

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-gray-500">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Badge variant="outline">
            {filteredProducts.length} of {products.length} products
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="ghost" size="sm">
              Products
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Full Product Manager
            </Button>
          </Link>
          <Link href="/products">
            <Button className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Products Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products Overview
          </CardTitle>
          <CardDescription>
            This is a simplified view of your products. Use the full Product Manager for detailed product management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{products.length}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {products.filter(p => p.is_active).length}
              </div>
              <div className="text-sm text-gray-600">Active Products</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {products.filter(p => p.has_variants).length}
              </div>
              <div className="text-sm text-gray-600">Products with Variants</div>
            </div>
          </div>

          {/* Quick Product List */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 mb-3">Recent Products</h4>
            {filteredProducts.slice(0, 10).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {product.category && (
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: product.category.color }}
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.name}</span>
                      {product.has_variants && (
                        <Badge variant="outline" className="text-xs">
                          Has Variants
                        </Badge>
                      )}
                      <Badge 
                        variant={product.is_active ? "default" : "secondary"}
                        className={product.is_active ? "bg-green-100 text-green-800" : ""}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-4">
                      {product.sku && <span>SKU: {product.sku}</span>}
                      <span>Stock: {product.stock_quantity}</span>
                      <span>Price: R{product.price.toFixed(2)}</span>
                      {product.category && <span>Category: {product.category.name}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredProducts.length > 10 && (
              <div className="text-center pt-4">
                <Link href="/products">
                  <Button variant="outline">
                    View All {products.length} Products
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action for Full Management */}
      <Card className="border-[#E5FF29] bg-gradient-to-r from-[#E5FF29]/10 to-[#E5FF29]/5">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Need Full Product Management?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            This section focuses on product configuration. For complete product management including 
            adding/editing products, managing variants, inventory, and more, use the dedicated product manager.
          </p>
          <Link href="/products">
            <Button className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90">
              <Package className="h-4 w-4 mr-2" />
              Open Product Manager
            </Button>
          </Link>
        </CardContent>
      </Card>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">
            {searchTerm ? 'No products found matching your search' : 'No products created yet'}
          </div>
          {!searchTerm && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-4">
                Start by creating categories and variant options, then add your first product
              </p>
              <Link href="/products">
                <Button className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Product
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
