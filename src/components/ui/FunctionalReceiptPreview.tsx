import React, { useState, useEffect } from 'react'
import { Printer, Download, Eye } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import DynamicTemplatePreview from './DynamicTemplatePreview'
import { printReceipt, createEscPosReceipt } from '@/lib/qz-printing'
import { PrintingSettings } from '@/lib/printing-service'
import { useQzTray } from '@/features/printers/hooks/useQzTray'

interface FunctionalReceiptPreviewProps {
  templateId: string
  settings: PrintingSettings
  className?: string
}

const FunctionalReceiptPreview: React.FC<FunctionalReceiptPreviewProps> = ({
  templateId,
  settings,
  className = ''
}) => {
  const { status, printers, error, connect, isConnecting } = useQzTray()
  const [isPrinting, setIsPrinting] = useState(false)
  const [printStatus, setPrintStatus] = useState<'idle' | 'printing' | 'success' | 'error'>('idle')
  const [selectedPrinter, setSelectedPrinter] = useState<string>('')

  // Auto-connect to QZ Tray on mount
  useEffect(() => {
    if (status === 'disconnected') {
      connect()
    }
  }, [status, connect])

  // Set default printer when printers are loaded
  useEffect(() => {
    if (printers.length > 0 && !selectedPrinter) {
      setSelectedPrinter(printers[0])
    }
  }, [printers, selectedPrinter])

  const handlePrint = async () => {
    if (!selectedPrinter) {
      setPrintStatus('error')
      return
    }

    if (status !== 'connected') {
      setPrintStatus('error')
      return
    }

    setIsPrinting(true)
    setPrintStatus('printing')

    try {
      // Create ESC/POS receipt data
      const receiptData = {
        businessName: 'KQS POS Store',
        businessAddress: '123 Main Street, Johannesburg, South Africa',
        businessPhone: '+27 11 123 4567',
        receiptNumber: 'R202412011234567890',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        cashier: 'John Doe',
        customer: 'Jane Smith',
        items: [
          { name: 'Product 1', quantity: 2, price: 25.00, total: 50.00 },
          { name: 'Product 2', quantity: 1, price: 15.50, total: 15.50 },
          { name: 'Product 3', quantity: 3, price: 10.00, total: 30.00 }
        ],
        subtotal: 95.50,
        tax: 14.33,
        total: 109.83,
        paymentMethod: 'Cash',
        amountPaid: 110.00,
        change: 0.17
      }

      // Create ESC/POS formatted receipt
      const escPosData = createEscPosReceipt(receiptData)
      
      // Print the receipt using QZ Tray
      await printReceipt(selectedPrinter, escPosData)
      setPrintStatus('success')
      setTimeout(() => setPrintStatus('idle'), 3000)
    } catch (error) {
      console.error('Print error:', error)
      setPrintStatus('error')
    } finally {
      setIsPrinting(false)
    }
  }

  const getStatusMessage = () => {
    switch (printStatus) {
      case 'printing':
        return 'Printing via QZ Tray...'
      case 'success':
        return 'Print successful! Receipt sent to printer.'
      case 'error':
        return 'Print failed. Check QZ Tray connection and printer.'
      default:
        return ''
    }
  }

  const getStatusColor = () => {
    switch (printStatus) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className={`bg-white border-2 border-gray-200 rounded-lg p-6 max-w-sm mx-auto font-mono text-xs shadow-lg ${className}`}>
      {/* Receipt Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Functional Receipt Preview</h3>
        <p className="text-sm text-gray-600">This is what will actually be printed</p>
      </div>

      {/* Template Preview */}
      <div className="mb-6">
        <DynamicTemplatePreview 
          templateId={templateId} 
          className="mx-auto"
        />
      </div>

      {/* Print Controls */}
      <div className="space-y-4">
        {/* QZ Tray Status */}
        <div className="text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            status === 'connected' ? 'bg-green-100 text-green-800' :
            status === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              status === 'connected' ? 'bg-green-500' :
              status === 'connecting' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}></div>
            QZ Tray: {status}
          </div>
        </div>

        {/* Printer Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Select Printer:</label>
          <select
            value={selectedPrinter}
            onChange={(e) => setSelectedPrinter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:border-transparent"
            disabled={printers.length === 0}
          >
            {printers.length === 0 ? (
              <option>No printers detected</option>
            ) : (
              printers.map(printer => (
                <option key={printer} value={printer}>
                  {printer}
                </option>
              ))
            )}
          </select>
          {printers.length === 0 && (
            <p className="text-xs text-red-600">
              Make sure QZ Tray is running and printers are connected
            </p>
          )}
        </div>

        {/* Print Button */}
        <div className="flex gap-2">
          <PremiumButton
            onClick={handlePrint}
            disabled={isPrinting || !selectedPrinter || status !== 'connected'}
            className="flex-1"
          >
            {isPrinting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Printing...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </>
            )}
          </PremiumButton>
        </div>

        {/* Status Message */}
        {printStatus !== 'idle' && (
          <div className={`text-center text-sm ${getStatusColor()}`}>
            {getStatusMessage()}
          </div>
        )}

        {/* Settings Info */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs">
          <h4 className="font-medium text-gray-900 mb-2">Print Settings:</h4>
          <div className="space-y-1 text-gray-600">
            <div>Header: {settings.receipt_header}</div>
            <div>Footer: {settings.receipt_footer}</div>
            <div>Copies: {settings.print_copies}</div>
            <div>Logo: {settings.print_logo ? 'Yes' : 'No'}</div>
            <div>Barcode: {settings.print_barcode ? 'Yes' : 'No'}</div>
            <div>Tax Breakdown: {settings.print_tax_breakdown ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FunctionalReceiptPreview 