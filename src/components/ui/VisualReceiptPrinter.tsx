import React, { useRef, useState, useEffect } from 'react'
import { Printer, Download, Eye } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import DynamicTemplatePreview from './DynamicTemplatePreview'
import { useQzTray } from '@/features/printers/hooks/useQzTray'
import { PrintingSettings } from '@/lib/printing-service'

interface VisualReceiptPrinterProps {
  templateId: string
  settings: PrintingSettings
  className?: string
}

const VisualReceiptPrinter: React.FC<VisualReceiptPrinterProps> = ({
  templateId,
  settings,
  className = ''
}) => {
  const { status, printers, error, connect, isConnecting } = useQzTray()
  const [isPrinting, setIsPrinting] = useState(false)
  const [printStatus, setPrintStatus] = useState<'idle' | 'printing' | 'success' | 'error'>('idle')
  const [selectedPrinter, setSelectedPrinter] = useState<string>('')
  const receiptRef = useRef<HTMLDivElement>(null)

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

  // Function to capture the receipt as an image
  const captureReceiptAsImage = async (): Promise<string> => {
    if (!receiptRef.current) {
      throw new Error('Receipt element not found')
    }

    // Use html2canvas to capture the receipt design
    const html2canvas = (await import('html2canvas')).default
    
    const canvas = await html2canvas(receiptRef.current, {
      scale: 2, // Higher resolution for better print quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: receiptRef.current.offsetWidth,
      height: receiptRef.current.offsetHeight,
      logging: false
    })

    return canvas.toDataURL('image/png')
  }

  // Function to convert image to printer-compatible format
  const convertImageForPrinter = async (imageDataUrl: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          resolve([])
          return
        }

        // Set canvas size to match printer paper width
        const paperWidth = settings.paper_width || 384 // Default thermal printer width
        const aspectRatio = img.height / img.width
        const paperHeight = Math.floor(paperWidth * aspectRatio)
        
        canvas.width = paperWidth
        canvas.height = paperHeight
        
        // Draw image scaled to paper width
        ctx.drawImage(img, 0, 0, paperWidth, paperHeight)
        
        // Convert to black and white for thermal printers
        const imageData = ctx.getImageData(0, 0, paperWidth, paperHeight)
        const data = imageData.data
        
        for (let i = 0; i < data.length; i += 4) {
          const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
          const bw = gray > 128 ? 255 : 0
          data[i] = bw     // Red
          data[i + 1] = bw // Green
          data[i + 2] = bw // Blue
          // Alpha stays the same
        }
        
        ctx.putImageData(imageData, 0, 0)
        
        // Convert to base64
        const processedImageDataUrl = canvas.toDataURL('image/png')
        resolve([processedImageDataUrl])
      }
      img.src = imageDataUrl
    })
  }

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
      // Capture the receipt design as an image
      const imageDataUrl = await captureReceiptAsImage()
      
      // Convert image for printer
      const processedImages = await convertImageForPrinter(imageDataUrl)
      
      if (processedImages.length === 0) {
        throw new Error('Failed to process image for printing')
      }

      // Print using QZ Tray with image data
      const printData = processedImages.map(imageDataUrl => ({
        type: 'image',
        data: imageDataUrl,
        width: settings.paper_width || 384,
        height: 'auto'
      }))

      // Use QZ Tray to print the image
      if (typeof qz !== 'undefined' && qz.print) {
        const config = qz.configs.create(selectedPrinter, {
          rasterize: false,
          orientation: 'portrait',
          colorType: 'color',
          copies: settings.print_copies || 1
        })
        
        await qz.print(config, printData)
        setPrintStatus('success')
        setTimeout(() => setPrintStatus('idle'), 3000)
      } else {
        throw new Error('QZ Tray not available')
      }
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
        return 'Capturing and printing receipt design...'
      case 'success':
        return 'Receipt design printed successfully!'
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Receipt Printer</h3>
        <p className="text-sm text-gray-600">Print the exact visual design</p>
      </div>

      {/* Receipt Preview (Hidden for capture) */}
      <div className="mb-6">
        <div 
          ref={receiptRef}
          className="bg-white border border-gray-300 rounded-lg p-4 mx-auto"
          style={{ width: `${settings.paper_width || 384}px` }}
        >
          <DynamicTemplatePreview 
            templateId={templateId} 
            className="w-full"
          />
        </div>
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
                Printing Design...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Print Visual Design
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
            <div>Paper Width: {settings.paper_width}px</div>
            <div>Copies: {settings.print_copies}</div>
            <div>Mode: Visual Design (Pixel Perfect)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisualReceiptPrinter 