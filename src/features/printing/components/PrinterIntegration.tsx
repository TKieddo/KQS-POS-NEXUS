import React, { useState, useEffect } from 'react'
import { Printer, TestTube, Settings, ExternalLink } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { loadAllPrinterSettings, type PrinterSettings } from '@/lib/printer-settings'
import { printReceipt } from '@/lib/qz-printing'
import { useRouter } from 'next/navigation'

interface PrinterIntegrationProps {
  onPrinterSelect?: (printerName: string) => void
  selectedPrinter?: string
}

export const PrinterIntegration: React.FC<PrinterIntegrationProps> = ({
  onPrinterSelect,
  selectedPrinter
}) => {
  const [printerSettings, setPrinterSettings] = useState<Record<string, PrinterSettings>>({})
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const router = useRouter()

  useEffect(() => {
    loadPrinters()
  }, [])

  const loadPrinters = async () => {
    try {
      setIsLoading(true)
      const { settings } = await loadAllPrinterSettings()
      setPrinterSettings(settings)
      setAvailablePrinters(Object.keys(settings))
    } catch (error) {
      console.error('Error loading printers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestPrinter = async (printerName: string) => {
    try {
      setTestResults(prev => ({ ...prev, [printerName]: false }))
      
      const printerConfig = printerSettings[printerName]
      
      // Create test receipt content
      const testReceipt = [
        '\x1B@', // Initialize printer
        '\x1B!8', // Emphasized mode
        '*** KQS POS Test Receipt ***\n',
        '\x1B!0', // Normal mode
        'Printer: ' + printerName + '\n',
        'Paper Width: ' + (printerConfig?.paperWidth || 80) + 'mm\n',
        'Paper Length: ' + (printerConfig?.paperLength || 500) + 'mm\n',
        'Top Margin: ' + (printerConfig?.topMargin || 0) + 'mm\n',
        '\n',
        'This is a test receipt from the\n',
        'printing settings page.\n',
        '\n',
        'Date: ' + new Date().toLocaleDateString() + '\n',
        'Time: ' + new Date().toLocaleTimeString() + '\n',
        '\n',
        '\x1Bm' // Cut paper
      ]

      await printReceipt(printerName, testReceipt)
      setTestResults(prev => ({ ...prev, [printerName]: true }))
      
      setTimeout(() => {
        setTestResults(prev => ({ ...prev, [printerName]: false }))
      }, 3000)
    } catch (error) {
      console.error('Error testing printer:', error)
      alert('Failed to print test receipt. Please check your printer connection.')
    }
  }

  const handleManagePrinters = () => {
    router.push('/admin/printers')
  }

  if (isLoading) {
    return (
      <PremiumCard>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[hsl(var(--primary))] mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading printers...</p>
          </div>
        </div>
      </PremiumCard>
    )
  }

  return (
    <PremiumCard>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Available Printers</h3>
          <p className="text-sm text-muted-foreground">
            Printers configured in the dedicated Printers page
          </p>
        </div>
        <PremiumButton variant="outline" onClick={handleManagePrinters}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Manage Printers
        </PremiumButton>
      </div>

      {availablePrinters.length === 0 ? (
        <div className="text-center py-8">
          <Printer className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium mb-2">No Printers Found</h4>
          <p className="text-muted-foreground mb-4">
            Configure your printers in the dedicated Printers page to use them here.
          </p>
          <PremiumButton onClick={handleManagePrinters}>
            <Settings className="w-4 h-4 mr-2" />
            Go to Printers Page
          </PremiumButton>
        </div>
      ) : (
        <div className="space-y-3">
          {availablePrinters.map(printerName => {
            const config = printerSettings[printerName]
            const isSelected = selectedPrinter === printerName
            const testSuccess = testResults[printerName]

            return (
              <div
                key={printerName}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isSelected 
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Printer className="w-5 h-5 text-[hsl(var(--primary))]" />
                  <div>
                    <h4 className="font-medium">{printerName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {config?.paperWidth || 80}mm × {config?.paperLength || 500}mm
                      {config?.topMargin !== undefined && ` • Top: ${config.topMargin}mm`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {onPrinterSelect && (
                    <PremiumButton
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => onPrinterSelect(printerName)}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </PremiumButton>
                  )}
                  
                  <PremiumButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestPrinter(printerName)}
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    Test
                  </PremiumButton>
                  
                  {testSuccess && (
                    <span className="text-green-600 text-sm flex items-center">
                      ✓ Printed
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PremiumCard>
  )
} 