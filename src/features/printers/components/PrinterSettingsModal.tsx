import * as React from 'react'
import { X, Save, RotateCcw } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

import { PrinterSettings, DEFAULT_PRINTER_SETTINGS } from '@/lib/printer-settings'

interface PrinterSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  printerName: string
  settings: PrinterSettings
  onSave: (settings: PrinterSettings) => void
}



export const PrinterSettingsModal: React.FC<PrinterSettingsModalProps> = ({
  isOpen,
  onClose,
  printerName,
  settings,
  onSave
}) => {
  const [currentSettings, setCurrentSettings] = React.useState<PrinterSettings>(settings || DEFAULT_PRINTER_SETTINGS)
  const [activeTab, setActiveTab] = React.useState<'paper' | 'quality' | 'advanced'>('paper')

  React.useEffect(() => {
    setCurrentSettings(settings || DEFAULT_PRINTER_SETTINGS)
  }, [settings])

  const handleSave = () => {
    onSave(currentSettings)
    onClose()
  }

  const handleReset = () => {
    setCurrentSettings(DEFAULT_PRINTER_SETTINGS)
  }

  const updateSetting = (key: keyof PrinterSettings, value: any) => {
    setCurrentSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Printer Settings - ${printerName}`}>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-1 border-b">
          <button
            onClick={() => setActiveTab('paper')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === 'paper' 
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Paper Settings
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === 'quality' 
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Print Quality
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === 'advanced' 
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Paper Settings Tab */}
        {activeTab === 'paper' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="paperWidth" className="block text-sm font-medium mb-1">Paper Width (mm)</label>
                <Input
                  id="paperWidth"
                  type="number"
                  value={currentSettings.paperWidth}
                  onChange={(e) => updateSetting('paperWidth', Number(e.target.value))}
                  min="58"
                  max="120"
                />
              </div>
              <div>
                <label htmlFor="paperLength" className="block text-sm font-medium mb-1">Paper Length (mm)</label>
                <Input
                  id="paperLength"
                  type="number"
                  value={currentSettings.paperLength}
                  onChange={(e) => updateSetting('paperLength', Number(e.target.value))}
                  min="50"
                  max="1000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="topMargin" className="block text-sm font-medium mb-1">Top Margin (mm)</label>
                <Input
                  id="topMargin"
                  type="number"
                  value={currentSettings.topMargin}
                  onChange={(e) => updateSetting('topMargin', Number(e.target.value))}
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <label htmlFor="bottomMargin" className="block text-sm font-medium mb-1">Bottom Margin (mm)</label>
                <Input
                  id="bottomMargin"
                  type="number"
                  value={currentSettings.bottomMargin}
                  onChange={(e) => updateSetting('bottomMargin', Number(e.target.value))}
                  min="0"
                  max="50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="leftMargin" className="block text-sm font-medium mb-1">Left Margin (mm)</label>
                <Input
                  id="leftMargin"
                  type="number"
                  value={currentSettings.leftMargin}
                  onChange={(e) => updateSetting('leftMargin', Number(e.target.value))}
                  min="0"
                  max="20"
                />
              </div>
              <div>
                <label htmlFor="rightMargin" className="block text-sm font-medium mb-1">Right Margin (mm)</label>
                <Input
                  id="rightMargin"
                  type="number"
                  value={currentSettings.rightMargin}
                  onChange={(e) => updateSetting('rightMargin', Number(e.target.value))}
                  min="0"
                  max="20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="lineSpacing" className="block text-sm font-medium mb-1">Line Spacing</label>
              <Input
                id="lineSpacing"
                type="number"
                value={currentSettings.lineSpacing}
                onChange={(e) => updateSetting('lineSpacing', Number(e.target.value))}
                min="0"
                max="3"
                step="0.5"
              />
            </div>
          </div>
        )}

        {/* Print Quality Tab */}
        {activeTab === 'quality' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="printDensity" className="block text-sm font-medium mb-1">Print Density</label>
              <Select 
                value={currentSettings.printDensity} 
                onChange={(e) => updateSetting('printDensity', e.target.value as 'light' | 'normal' | 'dark')}
              >
                <option value="light">Light</option>
                <option value="normal">Normal</option>
                <option value="dark">Dark</option>
              </Select>
            </div>

            <div>
              <label htmlFor="printSpeed" className="block text-sm font-medium mb-1">Print Speed</label>
              <Select 
                value={currentSettings.printSpeed} 
                onChange={(e) => updateSetting('printSpeed', e.target.value as 'slow' | 'normal' | 'fast')}
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </Select>
            </div>

            <div>
              <label htmlFor="characterSize" className="block text-sm font-medium mb-1">Character Size</label>
              <Select 
                value={currentSettings.characterSize} 
                onChange={(e) => updateSetting('characterSize', e.target.value as 'small' | 'normal' | 'large')}
              >
                <option value="small">Small</option>
                <option value="normal">Normal</option>
                <option value="large">Large</option>
              </Select>
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoCut"
                checked={currentSettings.autoCut}
                onChange={(e) => updateSetting('autoCut', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoCut" className="text-sm font-medium">Auto Cut Paper</label>
            </div>

            <div>
              <label htmlFor="cutLength" className="block text-sm font-medium mb-1">Cut Length (mm from top)</label>
              <Input
                id="cutLength"
                type="number"
                value={currentSettings.cutLength}
                onChange={(e) => updateSetting('cutLength', Number(e.target.value))}
                min="0"
                max="100"
              />
            </div>

            <div>
              <label htmlFor="printDirection" className="block text-sm font-medium mb-1">Print Direction</label>
              <Select 
                value={currentSettings.printDirection} 
                onChange={(e) => updateSetting('printDirection', e.target.value as 'normal' | 'reverse')}
              >
                <option value="normal">Normal</option>
                <option value="reverse">Reverse</option>
              </Select>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
} 