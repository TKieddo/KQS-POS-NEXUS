'use client'
// 1. React and Next.js imports
import React, { useCallback, useEffect, useState } from 'react'

// 2. Third-party libraries
import { Loader2, Printer, WifiOff } from 'lucide-react'

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

// 4. Types and interfaces
// (none needed for this page)

// ESC/POS test print data for receipt printers
const ESC = '\x1B'
const NEWLINE = '\x0A'

const DEFAULT_PRINTER_KEY = 'kqspos_default_printer'

const PrintersPage = () => {
  const { status, printers, error, connect, isConnecting } = useQzTray()
  const [printStatus, setPrintStatus] = useState<Record<string, 'idle' | 'success' | 'error'>>({})
  const [printLoading, setPrintLoading] = useState<Record<string, boolean>>({})
  const [defaultPrinter, setDefaultPrinter] = useState<string | null>(null)
  const [openDrawerLoading, setOpenDrawerLoading] = useState<Record<string, boolean>>({})
  const [printerSettings, setPrinterSettings] = useState<Record<string, PrinterSettings>>({})
  const [settingsLoading, setSettingsLoading] = useState(false)

  // Load default printer and settings on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Load default printer from localStorage (keep this for now)
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
    }

    loadInitialData()
  }, [])

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

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-semibold mb-6 text-center tracking-tight">Printer Management</h1>
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