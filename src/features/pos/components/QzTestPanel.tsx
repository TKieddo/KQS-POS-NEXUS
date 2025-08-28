'use client'

import React, { useState } from 'react'
import { X, Printer, Wifi, WifiOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQzTray } from '@/features/printers/hooks/useQzTray'
import { printReceipt, createEscPosReceipt } from '@/lib/qz-printing'
import { toast } from 'sonner'
import { useBranch } from '@/context/BranchContext'
import { useAuth } from '@/context/AuthContext'

interface QzTestPanelProps {
  isOpen: boolean
  onClose: () => void
  onConnect?: () => Promise<void>
  isConnecting?: boolean
  status?: string
  printers?: string[]
  error?: string | null
}

export const QzTestPanel: React.FC<QzTestPanelProps> = ({ 
  isOpen, 
  onClose, 
  onConnect: externalConnect,
  isConnecting: externalConnecting,
  status: externalStatus,
  printers: externalPrinters,
  error: externalError
}) => {
  const { selectedBranch } = useBranch()
  const { user } = useAuth()
  const { status: qzStatus, printers: qzPrinters, error: qzError, connect: connectQz, isConnecting: qzConnecting } = useQzTray()
  const [testPrinting, setTestPrinting] = useState(false)
  const [selectedPrinter, setSelectedPrinter] = useState<string>('')

  // Use external props if provided, otherwise use internal QZ state
  const currentStatus = externalStatus || qzStatus
  const currentPrinters = externalPrinters || qzPrinters
  const currentError = externalError || qzError
  const currentConnecting = externalConnecting || qzConnecting
  const currentConnect = externalConnect || connectQz

  const handleConnect = async () => {
    try {
      await currentConnect()
      toast.success('Connected to QZ Tray successfully!')
    } catch (error) {
      console.error('Failed to connect to QZ Tray:', error)
      toast.error('Failed to connect to QZ Tray')
    }
  }

  const handleTestPrint = async () => {
    if (!selectedPrinter) {
      toast.error('Please select a printer first')
      return
    }

    setTestPrinting(true)
    try {
      console.log('🖨️ Starting QZ test print to printer:', selectedPrinter)

      // Create test receipt data
      const testSaleData = {
        businessName: selectedBranch?.name || 'KQS POS',
        businessAddress: 'Test Address, Test City',
        businessPhone: '+1 (555) 123-4567',
        receiptNumber: `TEST-${Date.now()}`,
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB'),
        cashier: user?.user_metadata?.full_name || user?.email || 'Test Cashier',
        customer: 'Test Customer',
        items: [
          { name: 'Test Product 1', quantity: 2, price: 10.00, total: 20.00 },
          { name: 'Test Product 2', quantity: 1, price: 15.00, total: 15.00 },
          { name: 'Test Product 3', quantity: 3, price: 5.00, total: 15.00 }
        ],
        subtotal: 50.00,
        tax: 5.00,
        total: 55.00,
        paymentMethod: 'Cash',
        amountPaid: 60.00,
        change: 5.00
      }

      // Create ESC/POS formatted receipt data
      const receiptData = createEscPosReceipt(testSaleData)

      // Print via QZ Tray
      await printReceipt(selectedPrinter, receiptData)
      
      toast.success('✅ Test receipt printed successfully via QZ Tray!')
      console.log('✅ QZ Tray test print successful')
    } catch (error) {
      console.error('❌ QZ Tray test print failed:', error)
      toast.error('❌ Test print failed. Check console for details.')
    } finally {
      setTestPrinting(false)
    }
  }

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'connected':
        return 'text-green-600'
      case 'connecting':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = () => {
    switch (currentStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'connecting':
        return <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <WifiOff className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusText = () => {
    switch (currentStatus) {
      case 'connected':
        return 'Connected to QZ Tray'
      case 'connecting':
        return 'Connecting to QZ Tray...'
      case 'error':
        return 'QZ Tray Error'
      default:
        return 'Not Connected'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Printer className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">QZ Tray Test Panel</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* QZ Tray Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getStatusIcon()}
                <span>QZ Tray Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Connection Status:</span>
                <Badge className={getStatusColor()}>
                  {getStatusText()}
                </Badge>
              </div>

              {currentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">
                    <strong>Error:</strong> {currentError}
                  </p>
                </div>
              )}

              {currentStatus === 'disconnected' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-700 mb-3">
                    <strong>QZ Tray Not Connected</strong>
                  </p>
                  <p className="text-xs text-yellow-600 mb-3">
                    To use thermal printers, you need to install and run QZ Tray.
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleConnect}
                      disabled={currentConnecting}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      {currentConnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Wifi className="h-4 w-4 mr-2" />
                      )}
                      {currentConnecting ? 'Connecting...' : 'Connect to QZ Tray'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://qz.io/download/', '_blank')}
                    >
                      Download QZ Tray
                    </Button>
                  </div>
                </div>
              )}

              {currentStatus === 'connected' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">
                    <strong>✅ QZ Tray Connected Successfully!</strong>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    QZ Tray is connected and ready to print receipts.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Printers */}
          {currentStatus === 'connected' && (
            <Card>
              <CardHeader>
                <CardTitle>Available Printers ({currentPrinters.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {currentPrinters.length === 0 ? (
                  <p className="text-sm text-gray-600">No printers found. Make sure QZ Tray is running and printers are connected.</p>
                ) : (
                  <div className="space-y-2">
                    {currentPrinters.map((printer, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedPrinter === printer
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPrinter(printer)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Printer className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium">{printer}</span>
                          </div>
                          {selectedPrinter === printer && (
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Test Print Section */}
          {currentStatus === 'connected' && currentPrinters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Print</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>Test Receipt Details:</strong>
                  </p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• Business: {selectedBranch?.name || 'KQS POS'}</li>
                    <li>• Items: 3 test products</li>
                    <li>• Total: $55.00</li>
                    <li>• Payment: Cash</li>
                    <li>• Cashier: {user?.user_metadata?.full_name || user?.email || 'Test Cashier'}</li>
                  </ul>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleTestPrint}
                    disabled={testPrinting || !selectedPrinter}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {testPrinting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Printer className="h-4 w-4 mr-2" />
                    )}
                    {testPrinting ? 'Printing...' : 'Print Test Receipt'}
                  </Button>
                  
                  {selectedPrinter && (
                    <span className="text-sm text-gray-600">
                      Selected: <strong>{selectedPrinter}</strong>
                    </span>
                  )}
                </div>

                {!selectedPrinter && (
                  <p className="text-sm text-yellow-600">
                    ⚠️ Please select a printer above to test printing.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <strong>1. Install QZ Tray:</strong>
                  <p className="mt-1">Download and install QZ Tray from <a href="https://qz.io/download/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">qz.io</a></p>
                </div>
                <div>
                  <strong>2. Connect Printer:</strong>
                  <p className="mt-1">Connect your thermal printer to your computer and ensure it&apos;s recognized by your operating system.</p>
                </div>
                <div>
                  <strong>3. Start QZ Tray:</strong>
                  <p className="mt-1">Launch QZ Tray and ensure it&apos;s running in the background.</p>
                </div>
                <div>
                  <strong>4. Test Connection:</strong>
                  <p className="mt-1">Click &quot;Connect to QZ Tray&quot; above to establish a connection.</p>
                </div>
                <div>
                  <strong>5. Print Test:</strong>
                  <p className="mt-1">Select a printer and click &quot;Print Test Receipt&quot; to verify everything is working.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
