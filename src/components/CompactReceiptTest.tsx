'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { printTransactionReceipt } from '@/lib/receipt-printing-service'
import { useBranch } from '@/hooks/useBranch'

const CompactReceiptTest = () => {
  const { selectedBranch } = useBranch()
  const [isPrinting, setIsPrinting] = useState(false)
  const [isLaybyePrinting, setIsLaybyePrinting] = useState(false)

  const testReceiptData = {
    transactionNumber: 'R-2024-001',
    date: new Date().toLocaleDateString('en-ZA'),
    time: new Date().toLocaleTimeString('en-ZA'),
    cashier: 'John Doe',
    customer: 'Jane Smith',
    items: [
      {
        name: 'Nike Air Max 270',
        quantity: 1,
        price: 1299.99,
        total: 1299.99,
        category: 'Shoes'
      },
      {
        name: 'Adidas T-Shirt',
        quantity: 2,
        price: 299.99,
        total: 599.98,
        category: 'Clothing'
      }
    ],
    subtotal: 1899.97,
    tax: 189.99,
    discount: 0,
    total: 2089.96,
    paymentMethod: 'Card',
    amountPaid: 2100.00,
    change: 10.04,
    splitPayments: [
      { method: 'Card', amount: 1500.00 },
      { method: 'Cash', amount: 589.96 }
    ]
  }

  const testLaybyePaymentData = {
    transactionNumber: 'LP-2024-001',
    date: new Date().toLocaleDateString('en-ZA'),
    time: new Date().toLocaleTimeString('en-ZA'),
    cashier: 'John Doe',
    customer: 'Jane Smith',
    laybyeId: 'LB-2024-001',
    paymentId: 'PMT-2024-001',
    items: [
      {
        name: 'Nike Air Max 270',
        quantity: 1,
        price: 1299.99,
        total: 1299.99,
        category: 'Shoes'
      },
      {
        name: 'Adidas T-Shirt',
        quantity: 2,
        price: 299.99,
        total: 599.98,
        category: 'Clothing'
      }
    ],
    total: 2089.96,
    paymentAmount: 500.00,
    totalPaid: 1500.00,
    balanceRemaining: 589.96,
    paymentMethod: 'Cash'
  }

  const handleTestPrint = async () => {
    if (!selectedBranch) {
      alert('Please select a branch first')
      return
    }

    setIsPrinting(true)
    try {
      const result = await printTransactionReceipt({
        transactionType: 'sale',
        branchId: selectedBranch.id,
        transactionData: testReceiptData
      })

      if (result.success) {
        alert(`Receipt printed successfully via ${result.method}`)
      } else {
        alert(`Printing failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Printing error:', error)
      alert('Printing failed')
    } finally {
      setIsPrinting(false)
    }
  }

  const handleLaybyeTestPrint = async () => {
    if (!selectedBranch) {
      alert('Please select a branch first')
      return
    }

    setIsLaybyePrinting(true)
    try {
      const result = await printTransactionReceipt({
        transactionType: 'laybye_payment',
        branchId: selectedBranch.id,
        transactionData: testLaybyePaymentData
      })

      if (result.success) {
        alert(`Laybye payment receipt printed successfully via ${result.method}`)
      } else {
        alert(`Printing failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Printing error:', error)
      alert('Printing failed')
    } finally {
      setIsLaybyePrinting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Compact Receipt Test</CardTitle>
          <CardDescription>
            Test the new compact receipt printing functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Branch Info</h4>
              <p className="text-sm text-muted-foreground">
                {selectedBranch ? selectedBranch.name : 'No branch selected'}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Receipt Type</h4>
              <p className="text-sm text-muted-foreground">Retail Sale Receipt</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Items</h4>
              <p className="text-sm text-muted-foreground">
                {testReceiptData.items.length} items • R{testReceiptData.total.toFixed(2)} total
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Features</h4>
              <p className="text-sm text-muted-foreground">
                Compact design • Real template data • Split payments • Category icons
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleTestPrint} 
            disabled={isPrinting || !selectedBranch}
            className="w-full"
          >
            {isPrinting ? 'Printing...' : 'Test Compact Receipt'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Laybye Payment Receipt Test</CardTitle>
          <CardDescription>
            Test the new laybye payment receipt with balance tracking and progress display
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Laybye ID</h4>
              <p className="text-sm text-muted-foreground">
                {testLaybyePaymentData.laybyeId}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Payment Progress</h4>
              <p className="text-sm text-muted-foreground">
                R{testLaybyePaymentData.totalPaid.toFixed(2)} / R{testLaybyePaymentData.total.toFixed(2)} 
                ({Math.round((testLaybyePaymentData.totalPaid / testLaybyePaymentData.total) * 100)}%)
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">This Payment</h4>
              <p className="text-sm text-muted-foreground">
                R{testLaybyePaymentData.paymentAmount.toFixed(2)} via {testLaybyePaymentData.paymentMethod}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Balance Remaining</h4>
              <p className="text-sm text-muted-foreground">
                R{testLaybyePaymentData.balanceRemaining.toFixed(2)}
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleLaybyeTestPrint} 
            disabled={isLaybyePrinting || !selectedBranch}
            className="w-full"
            variant="outline"
          >
            {isLaybyePrinting ? 'Printing...' : 'Test Laybye Payment Receipt'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default CompactReceiptTest
