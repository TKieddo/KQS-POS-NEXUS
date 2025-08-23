import * as React from 'react'
import { Printer, CheckCircle2, XCircle, Printer as PrinterIcon, Loader2, Unlock, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PrinterSettingsModal, PrinterSettings } from './PrinterSettingsModal'

export interface PrinterListProps {
  printers: string[]
  status: string
  onTestPrint: (printer: string) => void
  printStatus: Record<string, 'idle' | 'success' | 'error'>
  printLoading: Record<string, boolean>
  defaultPrinter: string | null
  onSetDefault: (printer: string) => void
  onOpenDrawer: (printer: string) => void
  openDrawerLoading: Record<string, boolean>
  printerSettings: Record<string, PrinterSettings>
  onSaveSettings: (printer: string, settings: PrinterSettings) => void
  settingsLoading?: boolean
}

function getPrinterType(printer: string): 'Receipt' | 'Label' | 'Other' {
  const name = printer.toLowerCase()
  if (
    name.includes('epson') ||
    name.includes('star') ||
    name.includes('pos') ||
    name.includes('tm-') ||
    name.includes('receipt') ||
    name.includes('bixolon') ||
    name.includes('citizen') ||
    name.includes('sam4s') ||
    name.includes('fujitsu') ||
    name.includes('sewoo') ||
    name.includes('srp-') ||
    name.includes('tsp') ||
    name.includes('prp-')
  ) return 'Receipt'
  if (
    name.includes('zebra') ||
    name.includes('label') ||
    name.includes('lp2844') ||
    name.includes('gk420')
  ) return 'Label'
  return 'Other'
}

export const PrinterList: React.FC<PrinterListProps> = ({ 
  printers, 
  status, 
  onTestPrint, 
  printStatus, 
  printLoading, 
  defaultPrinter, 
  onSetDefault, 
  onOpenDrawer, 
  openDrawerLoading,
  printerSettings,
  onSaveSettings,
  settingsLoading = false
}) => {
  const [settingsModalOpen, setSettingsModalOpen] = React.useState(false)
  const [selectedPrinter, setSelectedPrinter] = React.useState<string>('')

  const handleOpenSettings = (printer: string) => {
    setSelectedPrinter(printer)
    setSettingsModalOpen(true)
  }

  const handleSaveSettings = (settings: PrinterSettings) => {
    onSaveSettings(selectedPrinter, settings)
  }

  return (
    <>
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-[hsl(var(--border))]">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Printer className="w-5 h-5 text-[hsl(var(--primary))]" />
          Detected Printers
        </h2>
        {status !== 'connected' ? (
          <div className="text-muted-foreground text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4 text-destructive" />
            Connect to QZ Tray to view printers.
          </div>
        ) : printers.length === 0 ? (
          <div className="text-muted-foreground text-sm">No printers found.</div>
        ) : (
          <ul className="space-y-3">
            {printers.map((printer) => {
              const type = getPrinterType(printer)
              return (
                <li
                  key={printer}
                  className="flex items-center gap-2 bg-white/80 rounded-lg px-4 py-3 shadow-sm border border-[hsl(var(--border))] min-w-0"
                >
                  <input
                    type="radio"
                    name="defaultPrinter"
                    checked={defaultPrinter === printer}
                    onChange={() => onSetDefault(printer)}
                    className="accent-[hsl(var(--primary))] w-4 h-4 flex-shrink-0"
                    aria-label="Set as default printer"
                  />
                  <PrinterIcon className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
                  <span className="flex-1 min-w-0 truncate font-medium text-[hsl(var(--foreground))]">{printer}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${type === 'Receipt' ? 'bg-blue-100 text-blue-700' : type === 'Label' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{type}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full px-3 whitespace-nowrap"
                      onClick={() => onTestPrint(printer)}
                      disabled={printLoading[printer]}
                    >
                      {printLoading[printer] ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PrinterIcon className="w-4 h-4 mr-2" />}
                      Test Print
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full px-3 whitespace-nowrap"
                      onClick={() => onOpenDrawer(printer)}
                      disabled={openDrawerLoading[printer]}
                    >
                      {openDrawerLoading[printer] ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                      Open Cash Drawer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full px-3"
                      onClick={() => handleOpenSettings(printer)}
                      title="Printer Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    {printStatus[printer] === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600" aria-label="Print successful" />}
                    {printStatus[printer] === 'error' && <XCircle className="w-4 h-4 text-destructive" aria-label="Print failed" />}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <PrinterSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        printerName={selectedPrinter}
        settings={printerSettings[selectedPrinter]}
        onSave={handleSaveSettings}
      />
    </>
  )
} 