'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useBranch } from '@/context/BranchContext'
import { BranchSelector } from '@/components/layout/BranchSelector'
import { getProductsByBranch } from '@/lib/branch-access-service'
import { getCustomersByBranch } from '@/lib/branch-access-service'
import { getSalesByBranch } from '@/lib/branch-access-service'
import { getLaybyeOrdersByBranch } from '@/lib/branch-access-service'

export default function BranchManagementPage() {
  const { selectedBranch } = useBranch()
  const [branchData, setBranchData] = useState<{
    products: any[]
    customers: any[]
    sales: any[]
    laybyeOrders: any[]
  }>({
    products: [],
    customers: [],
    sales: [],
    laybyeOrders: []
  })
  const [loading, setLoading] = useState(false)

  const loadBranchData = async (branchId: string) => {
    setLoading(true)
    
    try {
      // Load products for this branch
      const productsResult = await getProductsByBranch(branchId)
      if (productsResult.success) {
        setBranchData(prev => ({ ...prev, products: productsResult.data || [] }))
      }

      // Load customers for this branch
      const customersResult = await getCustomersByBranch(branchId)
      if (customersResult.success) {
        setBranchData(prev => ({ ...prev, customers: customersResult.data || [] }))
      }

      // Load sales for this branch
      const salesResult = await getSalesByBranch(branchId)
      if (salesResult.success) {
        setBranchData(prev => ({ ...prev, sales: salesResult.data || [] }))
      }

      // Load laybye orders for this branch
      const laybyeResult = await getLaybyeOrdersByBranch(branchId)
      if (laybyeResult.success) {
        setBranchData(prev => ({ ...prev, laybyeOrders: laybyeResult.data || [] }))
      }

      toast.success(`Loaded data for ${selectedBranch?.name}`)
    } catch (error) {
      console.error('Error loading branch data:', error)
      toast.error('Failed to load branch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedBranch) {
      loadBranchData(selectedBranch.id)
    }
  }, [selectedBranch])

  const handleBranchChange = (branchId: string) => {
    loadBranchData(branchId)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-gray-600">
            Manage branch access and view branch-specific data
          </p>
        </div>
        <BranchSelector 
          variant="admin" 
          onBranchChange={handleBranchChange}
        />
      </div>

      {/* Branch Info */}
      {selectedBranch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Branch Information</span>
              <Badge variant="outline">{selectedBranch.name}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-sm">{selectedBranch.address || 'No address'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-sm">{selectedBranch.phone || 'No phone'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm">{selectedBranch.email || 'No email'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge className={selectedBranch.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {selectedBranch.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branch Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branchData.products.length}</div>
            <p className="text-xs text-muted-foreground">
              Available in this branch
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branchData.customers.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branchData.sales.length}</div>
            <p className="text-xs text-muted-foreground">
              Total transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laybye Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branchData.laybyeOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              Active laybye orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Branch Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({branchData.products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {branchData.products.slice(0, 5).map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${product.price}</p>
                    <p className="text-xs text-gray-500">Stock: {product.stock_quantity}</p>
                  </div>
                </div>
              ))}
              {branchData.products.length === 0 && (
                <p className="text-gray-500 text-center py-4">No products found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Customers ({branchData.customers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {branchData.customers.slice(0, 5).map((customer: any) => (
                <div key={customer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{customer.first_name} {customer.last_name}</p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="text-xs">{customer.customer_type}</Badge>
                  </div>
                </div>
              ))}
              {branchData.customers.length === 0 && (
                <p className="text-gray-500 text-center py-4">No customers found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access Control Info */}
      <Card>
        <CardHeader>
          <CardTitle>Branch Access Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Role Permissions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Admin</span>
                    <Badge className="bg-green-100 text-green-800">Full Access</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Manager</span>
                    <Badge className="bg-blue-100 text-blue-800">Limited Admin</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cashier</span>
                    <Badge className="bg-yellow-100 text-yellow-800">POS Only</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Viewer</span>
                    <Badge className="bg-gray-100 text-gray-800">Read Only</Badge>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Branch Isolation</h4>
                <div className="space-y-2 text-sm">
                  <p>• Each branch can only access its own data</p>
                  <p>• Products are filtered by branch allocations</p>
                  <p>• Customers are assigned to specific branches</p>
                  <p>• Sales and laybye orders are branch-specific</p>
                  <p>• Admins can access all branches</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How Branch Access Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">For POS Users:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Select your branch using the branch selector</li>
                <li>Only products allocated to your branch will be visible</li>
                <li>Customers created will be assigned to your branch</li>
                <li>Sales and laybye orders will be tagged with your branch</li>
                <li>You cannot access data from other branches</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">For Admins:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Can access all branches and view all data</li>
                <li>Can manage branch allocations and access</li>
                <li>Can view cross-branch reports and analytics</li>
                <li>Can assign users to specific branches</li>
                <li>Can manage branch-specific settings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 