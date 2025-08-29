'use client'
// 1. React and Next.js imports
import React, { useCallback, useEffect, useState } from 'react'

// 2. Third-party libraries
import { supabase } from '@/lib/supabase'
import { Loader2, Printer, WifiOff, Settings, CheckCircle, XCircle, AlertCircle, RefreshCw, Info } from 'lucide-react'

// 3. Internal components and utilities
import { PrinterList } from '@/features/printers/components/PrinterList'
import { QzStatusCard } from '@/features/printers/components/QzStatusCard'
import { useQzTray } from '@/features/printers/hooks/useQzTray'
import { printReceipt, openCashDrawer } from '@/lib/qz-printing'
import { 
  savePrinterSettings, 
  loadAllPrinterSettings, 
  DEFAULT_PRINTER_SETTINGS,
  type PrinterSettings 
} from '@/lib/printer-settings'
import { initializeQZTray, getAvailablePrinters, printTransactionReceipt } from '@/lib/receipt-printing-service'
import { testPrintingIntegration, checkTemplatesExist } from '@/lib/test-printing-integration'
import { useBranch } from '@/context/BranchContext'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QzTrayDebug } from '@/components/QzTrayDebug'
import CompactReceiptTest from '@/components/CompactReceiptTest'

// 4. Types and interfaces
// (none needed for this page)

// ESC/POS test print data for receipt printers
const ESC = '\x1B'
const NEWLINE = '\x0A'

const DEFAULT_PRINTER_KEY = 'kqspos_default_printer'

const PrintersPage = () => {
  const { selectedBranch } = useBranch()
  const { status, printers, error, connect, isConnecting } = useQzTray()
  const [printStatus, setPrintStatus] = useState<Record<string, 'idle' | 'success' | 'error'>>({})
  const [printLoading, setPrintLoading] = useState<Record<string, boolean>>({})
  const [defaultPrinter, setDefaultPrinter] = useState<string | null>(null)
  const [openDrawerLoading, setOpenDrawerLoading] = useState<Record<string, boolean>>({})
  const [printerSettings, setPrinterSettings] = useState<Record<string, PrinterSettings>>({})
  const [settingsLoading, setSettingsLoading] = useState(false)
  
  // Enhanced printer setup states
  const [qzStatus, setQzStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking')
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([])
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle')

  // Load default printer and settings on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Load default printer from localStorage
      const saved = localStorage.getItem(DEFAULT_PRINTER_KEY)
      if (saved) setDefaultPrinter(saved)
      
      // Load printer settings from database
      setSettingsLoading(true)
      try {
        const { settings, error } = await loadAllPrinterSettings()
        if (error) {
          console.warn('Failed to load printer settings from database:', error)
          // Continue with empty settings - will use defaults
        }
        setPrinterSettings(settings)
      } catch (err) {
        console.error('Error loading printer settings:', err)
        // Continue with empty settings - will use defaults
      } finally {
        setSettingsLoading(false)
      }

      // Initialize QZ Tray connection
      await initializeQZConnection()
    }

    loadInitialData()
  }, [])

  const initializeQZConnection = async () => {
    setQzStatus('checking')
    try {
      const result = await initializeQZTray()
      if (result.connected) {
        setQzStatus('connected')
        setAvailablePrinters(result.printers)
        
        // Set default printer if none is set and printers are available
        if (!defaultPrinter && result.printers.length > 0) {
          const savedDefault = localStorage.getItem(DEFAULT_PRINTER_KEY)
          if (!savedDefault) {
            setDefaultPrinter(result.printers[0])
            localStorage.setItem(DEFAULT_PRINTER_KEY, result.printers[0])
          }
        }
      } else {
        setQzStatus('disconnected')
      }
    } catch (error) {
      console.error('QZ Tray initialization failed:', error)
      setQzStatus('error')
    }
  }

  const handleSetDefault = useCallback((printer: string) => {
    setDefaultPrinter(printer)
    localStorage.setItem(DEFAULT_PRINTER_KEY, printer)
  }, [])

  const handleSaveSettings = useCallback(async (printer: string, settings: PrinterSettings) => {
    try {
      const { success, error } = await savePrinterSettings(printer, settings)
      if (success) {
        setPrinterSettings(prev => ({ ...prev, [printer]: settings }))
        console.log('Printer settings saved successfully')
      } else {
        console.error('Failed to save printer settings:', error)
        // Fallback to localStorage if database fails
        const fallbackSettings = { ...printerSettings, [printer]: settings }
        localStorage.setItem('kqspos_printer_settings', JSON.stringify(fallbackSettings))
        setPrinterSettings(fallbackSettings)
      }
    } catch (err) {
      console.error('Error saving printer settings:', err)
      // Fallback to localStorage
      const fallbackSettings = { ...printerSettings, [printer]: settings }
      localStorage.setItem('kqspos_printer_settings', JSON.stringify(fallbackSettings))
      setPrinterSettings(fallbackSettings)
    }
  }, [printerSettings])

  // Enhanced test print function that uses the receipt printing service
  const testReceiptPrint = async () => {
    if (!selectedBranch) {
      console.error('No branch selected')
      return
    }

    setTesting(true)
    setTestResult('idle')

    try {
      // Get real transaction data from recent sales
      const { data: recentSales, error: salesError } = await supabase
        .from('sales')
        .select(`
          id,
          transaction_number,
          created_at,
          subtotal,
          tax_amount,
          discount_amount,
          total_amount,
          payment_method,
          customers (
            id,
            first_name,
            last_name
          ),
          sale_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              id,
              name,
              categories (
                id,
                name
              )
            )
          )
        `)
        .eq('branch_id', selectedBranch.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      let transactionData: any

      if (recentSales && !salesError) {
        // Use real transaction data
        const sale = recentSales
        const customer = sale.customers as any
        const customerName = customer && customer.first_name && customer.last_name
          ? `${customer.first_name} ${customer.last_name}`
          : 'Walk-in Customer'
        
        const items = sale.sale_items.map((item: any) => ({
          name: item.products.name,
          quantity: item.quantity,
          price: item.unit_price,
          total: item.total_price,
          category: item.products.categories?.name || 'Accessories'
        }))

        transactionData = {
          transactionNumber: sale.transaction_number,
          date: new Date(sale.created_at).toLocaleDateString('en-GB'),
          time: new Date(sale.created_at).toLocaleTimeString('en-GB'),
          cashier: 'Test Cashier',
          customer: customerName,
          items: items,
          subtotal: sale.subtotal,
          tax: sale.tax_amount,
          discount: sale.discount_amount,
          total: sale.total_amount,
          paymentMethod: sale.payment_method,
          amountPaid: sale.total_amount,
          change: 0
        }
      } else {
        // Fallback to realistic test data
        transactionData = {
          transactionNumber: `SALE-${Date.now()}`,
          date: new Date().toLocaleDateString('en-GB'),
          time: new Date().toLocaleTimeString('en-GB'),
          cashier: 'Test Cashier',
          customer: 'Test Customer',
          items: [
            { name: 'ADIDAS Sneakers', quantity: 1, price: 850.00, total: 850.00, category: 'Shoes' },
            { name: 'Designer Dress', quantity: 1, price: 1200.00, total: 1200.00, category: 'Clothing' },
            { name: 'Luxury Handbag', quantity: 1, price: 950.00, total: 950.00, category: 'Accessories' }
          ],
          subtotal: 3000.00,
          tax: 0,
          discount: 0,
          total: 3000.00,
          paymentMethod: 'Cash',
          amountPaid: 3000.00,
          change: 0
        }
      }

      const testData = {
        transactionType: 'sale' as const,
        branchId: selectedBranch.id,
        transactionData: transactionData,
        printerName: defaultPrinter || undefined
      }

      const result = await printTransactionReceipt(testData)
      
      if (result.success) {
        setTestResult('success')
      } else {
        setTestResult('error')
      }
    } catch (error) {
      console.error('Test print failed:', error)
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  const createTestPrintData = useCallback((settings: PrinterSettings) => {
    const lines: string[] = []
    
    // Initialize printer
    lines.push(ESC + '@')
    
    // Set margins using proper ESC/POS commands
    lines.push(ESC + 'l' + String.fromCharCode(settings.leftMargin))
    lines.push(ESC + 'Q' + String.fromCharCode(settings.paperWidth - settings.rightMargin))
    
    // Set line spacing
    if (settings.lineSpacing > 1) {
      lines.push(ESC + '3' + String.fromCharCode(settings.lineSpacing * 8))
    }
    
    // Only add top margin if it's greater than 0
    if (settings.topMargin > 0) {
      lines.push(ESC + 'J' + String.fromCharCode(settings.topMargin))
    }
    
    // Test content with better formatting
    lines.push(ESC + '!' + '\x08') // Emphasized mode on
    lines.push('*** KQS POS Test Print ***' + NEWLINE)
    lines.push(ESC + '!' + '\x00') // Emphasized mode off
    lines.push('Printer integration successful!' + NEWLINE)
    lines.push('Paper Width: ' + settings.paperWidth + 'mm' + NEWLINE)
    lines.push('Paper Length: ' + settings.paperLength + 'mm' + NEWLINE)
    lines.push('Top Margin: ' + settings.topMargin + 'mm' + NEWLINE)
    lines.push('Bottom Margin: ' + settings.bottomMargin + 'mm' + NEWLINE)
    lines.push(NEWLINE)
    lines.push('Thank you for using KQS POS.' + NEWLINE)
    lines.push('This is a longer test to ensure' + NEWLINE)
    lines.push('the content prints completely.' + NEWLINE)
    lines.push(NEWLINE)
    
    // Feed paper to bottom margin
    lines.push(ESC + 'J' + String.fromCharCode(settings.bottomMargin))
    
    // Cut paper if enabled
    if (settings.autoCut) {
      lines.push(ESC + 'm')
    }
    
    return lines
  }, [])

  const handleTestPrint = useCallback(async (printer: string) => {
    setPrintLoading((prev) => ({ ...prev, [printer]: true }))
    setPrintStatus((prev) => ({ ...prev, [printer]: 'idle' }))
    try {
      const settings = printerSettings[printer] || DEFAULT_PRINTER_SETTINGS
      const testData = createTestPrintData(settings)
      await printReceipt(printer, testData)
      setPrintStatus((prev) => ({ ...prev, [printer]: 'success' }))
    } catch (err) {
      setPrintStatus((prev) => ({ ...prev, [printer]: 'error' }))
    } finally {
      setPrintLoading((prev) => ({ ...prev, [printer]: false }))
      setTimeout(() => {
        setPrintStatus((prev) => ({ ...prev, [printer]: 'idle' }))
      }, 3000)
    }
  }, [printerSettings, createTestPrintData])

  const handleOpenDrawer = useCallback(async (printer: string) => {
    setOpenDrawerLoading((prev) => ({ ...prev, [printer]: true }))
    try {
      await openCashDrawer(printer)
    } catch (err) {
      console.error('Failed to open cash drawer:', err)
    } finally {
      setOpenDrawerLoading((prev) => ({ ...prev, [printer]: false }))
    }
  }, [])

  const getStatusIcon = () => {
    switch (qzStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <RefreshCw className="h-5 w-5 text-gray-500 animate-spin" />
    }
  }

  const getStatusText = () => {
    switch (qzStatus) {
      case 'connected':
        return 'QZ Tray Connected'
      case 'disconnected':
        return 'QZ Tray Not Connected'
      case 'error':
        return 'QZ Tray Error'
      default:
        return 'Checking QZ Tray...'
    }
  }

  const getStatusColor = () => {
    switch (qzStatus) {
      case 'connected':
        return 'bg-green-100 text-green-800'
      case 'disconnected':
        return 'bg-red-100 text-red-800'
      case 'error':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-semibold mb-6 text-center tracking-tight">Printer Management</h1>
        
        {/* Enhanced QZ Tray Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">QZ Tray Status</h3>
            <div className="flex items-center gap-4">
              <Badge className={getStatusColor()}>
                {getStatusIcon()}
                <span className="ml-2">{getStatusText()}</span>
              </Badge>
              <Button
                onClick={initializeQZConnection}
                variant="outline"
                size="sm"
                disabled={qzStatus === 'checking'}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${qzStatus === 'checking' ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {qzStatus === 'disconnected' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">QZ Tray Not Connected</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    To use thermal printers, you need to install and run QZ Tray. 
                    <a 
                      href="https://qz.io/download/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-yellow-800 underline ml-1"
                    >
                      Download QZ Tray
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {qzStatus === 'connected' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-green-800">Connected Successfully</h4>
                  <p className="text-sm text-green-700 mt-1">
                    QZ Tray is connected and ready to print receipts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Default Printer Selection */}
          {qzStatus === 'connected' && availablePrinters.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Default Printer</h4>
                  <p className="text-sm text-gray-600">
                    This printer will be used automatically for all receipt printing
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={defaultPrinter || ''}
                    onChange={(e) => handleSetDefault(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    {availablePrinters.map((printer) => (
                      <option key={printer} value={printer}>
                        {printer}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={testReceiptPrint}
                    disabled={testing || !defaultPrinter}
                    size="sm"
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Printer className="h-4 w-4 mr-2" />
                        Test Receipt
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Test Result */}
              {testResult !== 'idle' && (
                <div className={`mt-4 p-3 rounded-lg ${
                  testResult === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {testResult === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <span className={`text-sm font-medium ${
                      testResult === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult === 'success' 
                        ? 'Test receipt printed successfully! Check your printer.' 
                        : 'Test receipt failed. Check printer connection and settings.'
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Compact Receipt Test */}
        <Card className="p-6 mb-6">
          <CompactReceiptTest />
        </Card>

        {/* QZ Tray Debug Tool */}
        <Card className="p-6 mb-6">
          <QzTrayDebug />
        </Card>

        {/* Browser Printing Info */}
        <Card className="p-6 mb-6">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Browser Printing</h3>
              <p className="text-gray-600 mb-4">
                If QZ Tray is not available, receipts will automatically open in your browser's print dialog. 
                You can then print to any available printer or save as PDF.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Browser printing may not work with thermal printers. 
                  For best results with thermal printers, install QZ Tray.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Original Printer Management */}
        <QzStatusCard
          status={status}
          error={error}
          onConnect={connect}
          isConnecting={isConnecting}
        />
        <div className="mt-8">
          <PrinterList
            printers={printers}
            status={status}
            onTestPrint={handleTestPrint}
            printStatus={printStatus}
            printLoading={printLoading}
            defaultPrinter={defaultPrinter}
            onSetDefault={handleSetDefault}
            onOpenDrawer={handleOpenDrawer}
            openDrawerLoading={openDrawerLoading}
            printerSettings={printerSettings}
            onSaveSettings={handleSaveSettings}
            settingsLoading={settingsLoading}
          />
        </div>
      </div>
    </main>
  )
}

export default PrintersPage 