'use client'

import React, { useState } from 'react'
import { Package, Tags, Palette, ShoppingBag } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoriesManager } from '@/features/settings/components/products/CategoriesManager'
import { VariantTypesManager } from '@/features/settings/components/products/VariantTypesManager'
import { VariantOptionsManager } from '@/features/settings/components/products/VariantOptionsManager'
import { ProductsManager } from '@/features/settings/components/products/ProductsManager'

interface ProductSettingsProps {
  className?: string
}

export const ProductSettings: React.FC<ProductSettingsProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('categories')

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#E5FF29] flex items-center justify-center">
            <Package className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Products Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage all product-related settings including categories, variants, and product catalog
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 px-6 pt-6">
              <TabsList className="grid w-full grid-cols-4 bg-gray-50">
                <TabsTrigger 
                  value="categories" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black"
                >
                  <Tags className="h-4 w-4" />
                  Categories
                </TabsTrigger>
                <TabsTrigger 
                  value="variant-types" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black"
                >
                  <Palette className="h-4 w-4" />
                  Variant Types
                </TabsTrigger>
                <TabsTrigger 
                  value="variant-options" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Variant Options
                </TabsTrigger>
                <TabsTrigger 
                  value="products" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black"
                >
                  <Package className="h-4 w-4" />
                  Products
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="categories" className="space-y-6 mt-0">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">Product Categories</h2>
                  <p className="text-sm text-gray-600">
                    Organize your products into categories. Categories help with product organization and variant configuration.
                  </p>
                </div>
                <CategoriesManager />
              </TabsContent>

              <TabsContent value="variant-types" className="space-y-6 mt-0">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">Variant Types</h2>
                  <p className="text-sm text-gray-600">
                    Define the types of variants your products can have (e.g., Size, Color, Brand, Style).
                  </p>
                </div>
                <VariantTypesManager />
              </TabsContent>

              <TabsContent value="variant-options" className="space-y-6 mt-0">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">Variant Options</h2>
                  <p className="text-sm text-gray-600">
                    Create specific options for each variant type (e.g., Small/Medium/Large for Size, Red/Blue/Green for Color).
                  </p>
                </div>
                <VariantOptionsManager />
              </TabsContent>

              <TabsContent value="products" className="space-y-6 mt-0">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                  <p className="text-sm text-gray-600">
                    Manage your complete product catalog with full variant support.
                  </p>
                </div>
                <ProductsManager />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
