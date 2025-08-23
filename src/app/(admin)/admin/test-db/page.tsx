'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function TestDatabasePage() {
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // Test 1: Check if we can connect to Supabase
      console.log('Testing Supabase connection...')
      const { data: connectionTest, error: connectionError } = await supabase
        .from('products')
        .select('count')
        .limit(1)
      
      results.connection = connectionError ? { error: connectionError.message } : { success: true }

      // Test 2: Check if sales table exists
      console.log('Testing sales table...')
      const { data: salesTest, error: salesError } = await supabase
        .from('sales')
        .select('id')
        .limit(1)
      
      results.salesTable = salesError ? { error: salesError.message } : { success: true, count: salesTest?.length }

      // Test 3: Check if sale_items table exists
      console.log('Testing sale_items table...')
      const { data: saleItemsTest, error: saleItemsError } = await supabase
        .from('sale_items')
        .select('id')
        .limit(1)
      
      results.saleItemsTable = saleItemsError ? { error: saleItemsError.message } : { success: true, count: saleItemsTest?.length }

      // Test 4: Check if stock_movements table exists
      console.log('Testing stock_movements table...')
      const { data: stockMovementsTest, error: stockMovementsError } = await supabase
        .from('stock_movements')
        .select('id')
        .limit(1)
      
      results.stockMovementsTable = stockMovementsError ? { error: stockMovementsError.message } : { success: true, count: stockMovementsTest?.length }

      // Test 5: Check if branches table exists
      console.log('Testing branches table...')
      const { data: branchesTest, error: branchesError } = await supabase
        .from('branches')
        .select('id')
        .limit(1)
      
      results.branchesTable = branchesError ? { error: branchesError.message } : { success: true, count: branchesTest?.length }

      // Test 6: Check sales table schema
      console.log('Testing sales table schema...')
      const { data: salesSchemaTest, error: salesSchemaError } = await supabase
        .from('sales')
        .select('*')
        .limit(0)
      
      if (salesSchemaTest !== null) {
        results.salesSchema = { success: true, columns: Object.keys(salesSchemaTest) }
      } else {
        results.salesSchema = { error: salesSchemaError?.message || 'Unknown error' }
      }

    } catch (error) {
      console.error('Test error:', error)
      results.generalError = { error: error instanceof Error ? error.message : 'Unknown error' }
    }

    setTestResults(results)
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Database Connection Test</h1>
        <p className="text-gray-600 mb-4">This page tests the database connection and table availability.</p>
        <Button onClick={runTests} disabled={loading}>
          {loading ? 'Running Tests...' : 'Run Database Tests'}
        </Button>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="grid gap-4">
          {Object.entries(testResults).map(([testName, result]: [string, any]) => (
            <Card key={testName}>
              <CardHeader>
                <CardTitle className="text-lg capitalize">
                  {testName.replace(/([A-Z])/g, ' $1').trim()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div className="text-green-600">
                    ✅ Success
                    {result.count !== undefined && <span className="ml-2">({result.count} records)</span>}
                    {result.columns && (
                      <div className="mt-2 text-sm text-gray-600">
                        Columns: {result.columns.join(', ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600">
                    ❌ Error: {result.error}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 