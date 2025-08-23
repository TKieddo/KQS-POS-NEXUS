'use client'

import React, { useState, useEffect } from 'react'
import { ProductLookupPage } from '@/features/products/components/ProductLookupPage'

// Mock data for development
const mockProducts = [
  {
    id: '1',
    name: 'Premium Cotton T-Shirt',
    sku: 'TSH-001',
    barcode: '1234567890123',
    description: 'High-quality cotton t-shirt with comfortable fit and durable construction.',
    category: 'Clothing',
    price: 29.99,
    cost: 15.00,
    stockQuantity: 45,
    minStockLevel: 10,
    maxStockLevel: 100,
    supplier: 'Fashion Supplier Co.',
    location: 'Warehouse A',
    status: 'active' as const,
    tags: ['cotton', 'comfortable', 'casual'],
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Designer Jeans',
    sku: 'JEA-002',
    barcode: '1234567890124',
    description: 'Stylish designer jeans with perfect fit and modern styling.',
    category: 'Clothing',
    price: 89.99,
    cost: 45.00,
    stockQuantity: 8,
    minStockLevel: 15,
    maxStockLevel: 50,
    supplier: 'Denim World',
    location: 'Warehouse B',
    status: 'active' as const,
    tags: ['denim', 'designer', 'stylish'],
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'],
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    name: 'Wireless Bluetooth Headphones',
    sku: 'AUD-003',
    barcode: '1234567890125',
    description: 'High-quality wireless headphones with noise cancellation and long battery life.',
    category: 'Electronics',
    price: 149.99,
    cost: 75.00,
    stockQuantity: 0,
    minStockLevel: 5,
    maxStockLevel: 25,
    supplier: 'Tech Gadgets Inc.',
    location: 'Warehouse A',
    status: 'active' as const,
    tags: ['wireless', 'bluetooth', 'noise-cancelling'],
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    name: 'Organic Coffee Beans',
    sku: 'COF-004',
    barcode: '1234567890126',
    description: 'Premium organic coffee beans sourced from sustainable farms.',
    category: 'Food & Beverage',
    price: 24.99,
    cost: 12.00,
    stockQuantity: 120,
    minStockLevel: 20,
    maxStockLevel: 200,
    supplier: 'Organic Farms Ltd.',
    location: 'Warehouse C',
    status: 'active' as const,
    tags: ['organic', 'coffee', 'sustainable'],
    images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400'],
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z'
  },
  {
    id: '5',
    name: 'Smartphone Case',
    sku: 'ACC-005',
    barcode: '1234567890127',
    description: 'Durable smartphone case with shock absorption and sleek design.',
    category: 'Accessories',
    price: 19.99,
    cost: 8.00,
    stockQuantity: 3,
    minStockLevel: 10,
    maxStockLevel: 75,
    supplier: 'Mobile Accessories Co.',
    location: 'Warehouse B',
    status: 'active' as const,
    tags: ['protective', 'durable', 'sleek'],
    images: ['https://images.unsplash.com/photo-1603313011108-8d2b4c8c8c8c?w=400'],
    createdAt: '2024-01-11T11:30:00Z',
    updatedAt: '2024-01-11T11:30:00Z'
  }
]

export default function ProductLookupContainer() {
  const [products, setProducts] = useState(mockProducts)
  const [isLoading, setIsLoading] = useState(false)

  const handleViewProduct = (product: any) => {
    // View functionality is now handled in the ProductLookupPage component
    console.log('View product:', product)
  }

  const handleEditProduct = (product: any) => {
    // Edit functionality is now handled in the ProductLookupPage component
    console.log('Edit product:', product)
  }

  const handleCopyProduct = (product: any) => {
    // TODO: Create a copy of the product
    const newProduct = {
      ...product,
      id: `copy-${Date.now()}`,
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-COPY`,
      barcode: `${product.barcode}-COPY`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setProducts(prev => [...prev, newProduct])
    console.log('Copy product:', newProduct)
  }

  return (
    <ProductLookupPage
      products={products}
      isLoading={isLoading}
      onViewProduct={handleViewProduct}
      onEditProduct={handleEditProduct}
      onCopyProduct={handleCopyProduct}
    />
  )
} 