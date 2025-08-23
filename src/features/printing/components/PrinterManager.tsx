import React, { useState } from 'react'
import { Printer, Plus, Settings, Wifi, Usb, Bluetooth, TestTube, Trash2, X } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { Printer as PrinterType } from '@/lib/printing-service'

interface PrinterManagerProps {
  printers: PrinterType[]
  onRefresh: () => void
}

const PrinterManager: React.FC<PrinterManagerProps> = ({ printers, onRefresh }) => {
  const [showAddPrinter, setShowAddPrinter] = useState(false)
  const [newPrinter, setNewPrinter] = useState({
    name: '',
    type: 'thermal' as const,
    connection: 'usb' as const,
    paper_size: '80mm',
    ip_address: '',
    port: 9100
  })

  const getConnectionIcon = (connection: string) => {
    switch (connection) {
      case 'usb': return <Usb className="h-4 w-4" />
      case 'network': return <Wifi className="h-4 w-4" />
      case 'bluetooth': return <Bluetooth className="h-4 w-4" />
      case 'serial': return <Settings className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'offline': return 'bg-gray-400'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'thermal': return 'bg-blue-100 text-blue-800'
      case 'inkjet': return 'bg-purple-100 text-purple-800'
      case 'laser': return 'bg-green-100 text-green-800'
      case 'dot_matrix': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddPrinter = () => {
    // In a real implementation, this would add the printer to the database
    console.log('Adding printer:', newPrinter)
    setShowAddPrinter(false)
    setNewPrinter({
      name: '',
      type: 'thermal',
      connection: 'usb',
      paper_size: '80mm',
      ip_address: '',
      port: 9100
    })
    onRefresh()
  }

  const handleTestPrinter = (printerId: string) => {
    // In a real implementation, this would test the printer connection
    console.log('Testing printer:', printerId)
    alert('Printer test functionality would be implemented here')
  }

  const handleDeletePrinter = (printerId: string) => {
    if (confirm('Are you sure you want to delete this printer?')) {
      // In a real implementation, this would delete the printer from the database
      console.log('Deleting printer:', printerId)
      onRefresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Printer Management</h2>
          <p className="text-sm text-gray-600">Manage your printer connections and settings</p>
        </div>
        <PremiumButton
          onClick={() => setShowAddPrinter(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Printer
        </PremiumButton>
      </div>

      {/* Add Printer Modal */}
      {showAddPrinter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add New Printer</h3>
              <button
                onClick={() => setShowAddPrinter(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Printer Name</label>
                <PremiumInput
                  value={newPrinter.name}
                  onChange={(e) => setNewPrinter(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter printer name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Printer Type</label>
                <select
                  value={newPrinter.type}
                  onChange={(e) => setNewPrinter(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:outline-none"
                >
                  <option value="thermal">Thermal</option>
                  <option value="inkjet">Inkjet</option>
                  <option value="laser">Laser</option>
                  <option value="dot_matrix">Dot Matrix</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Connection Type</label>
                <select
                  value={newPrinter.connection}
                  onChange={(e) => setNewPrinter(prev => ({ ...prev, connection: e.target.value as any }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:outline-none"
                >
                  <option value="usb">USB</option>
                  <option value="network">Network</option>
                  <option value="bluetooth">Bluetooth</option>
                  <option value="serial">Serial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paper Size</label>
                <select
                  value={newPrinter.paper_size}
                  onChange={(e) => setNewPrinter(prev => ({ ...prev, paper_size: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:outline-none"
                >
                  <option value="80mm">80mm</option>
                  <option value="58mm">58mm</option>
                  <option value="A4">A4</option>
                </select>
              </div>
              
              {newPrinter.connection === 'network' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                    <PremiumInput
                      value={newPrinter.ip_address}
                      onChange={(e) => setNewPrinter(prev => ({ ...prev, ip_address: e.target.value }))}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                    <PremiumInput
                      type="number"
                      value={newPrinter.port}
                      onChange={(e) => setNewPrinter(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                      placeholder="9100"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <PremiumButton
                variant="outline"
                onClick={() => setShowAddPrinter(false)}
              >
                Cancel
              </PremiumButton>
              <PremiumButton
                onClick={handleAddPrinter}
                disabled={!newPrinter.name.trim()}
              >
                Add Printer
              </PremiumButton>
            </div>
          </div>
        </div>
      )}

      {/* Printers List */}
      {printers.length === 0 ? (
        <PremiumCard className="p-12 text-center">
          <Printer className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No printers configured</h3>
          <p className="text-gray-600 mb-6">
            Add your first printer to start printing receipts
          </p>
          <PremiumButton onClick={() => setShowAddPrinter(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Printer
          </PremiumButton>
        </PremiumCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {printers.map(printer => (
            <PremiumCard key={printer.id} className="p-6 hover:shadow-lg transition-shadow">
              {/* Printer Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{printer.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(printer.type)}`}>
                      {printer.type}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {getConnectionIcon(printer.connection)}
                      <span>{printer.connection}</span>
                    </div>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(printer.status)}`} />
              </div>

              {/* Printer Details */}
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Paper Size:</span>
                  <span className="font-medium">{printer.paper_size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium capitalize ${printer.status === 'online' ? 'text-green-600' : printer.status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                    {printer.status}
                  </span>
                </div>
                {printer.ip_address && (
                  <div className="flex justify-between">
                    <span>IP Address:</span>
                    <span className="font-medium">{printer.ip_address}</span>
                  </div>
                )}
                {printer.port && (
                  <div className="flex justify-between">
                    <span>Port:</span>
                    <span className="font-medium">{printer.port}</span>
                  </div>
                )}
              </div>

              {/* Printer Actions */}
              <div className="flex items-center gap-2">
                <PremiumButton
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestPrinter(printer.id)}
                  className="flex-1"
                >
                  <TestTube className="h-3 w-3 mr-1" />
                  Test
                </PremiumButton>
                
                <PremiumButton
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Edit printer functionality
                    console.log('Edit printer:', printer.id)
                  }}
                  className="flex-1"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Settings
                </PremiumButton>
              </div>

              {/* Delete Action */}
              <div className="mt-3 pt-3 border-t">
                <PremiumButton
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeletePrinter(printer.id)}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </PremiumButton>
              </div>
            </PremiumCard>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {printers.length} printer{printers.length !== 1 ? 's' : ''} configured
          </span>
          <span>
            {printers.filter(p => p.status === 'online').length} online
          </span>
        </div>
      </div>
    </div>
  )
}

export default PrinterManager 