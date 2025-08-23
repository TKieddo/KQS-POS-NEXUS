import React, { useState } from 'react'
import { Download, Upload, FileText, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import type { ImportExportHistory } from '@/lib/product-pricing-complete-service'

interface ImportExportProps {
  importExportHistory: ImportExportHistory[]
  onExportData: (dataType: string) => Promise<any>
  onImportData: (dataType: string, data: any) => Promise<boolean>
  isLoading: boolean
}

export const ImportExport: React.FC<ImportExportProps> = ({
  importExportHistory,
  onExportData,
  onImportData,
  isLoading
}) => {
  const [selectedDataType, setSelectedDataType] = useState<'pricing_rules' | 'product_settings' | 'all_data' | 'pricing_report'>('pricing_rules')
  const [importFile, setImportFile] = useState<File | null>(null)

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'export': return <Download className="h-4 w-4" />
      case 'import': return <Upload className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleExport = async () => {
    try {
      const data = await onExportData(selectedDataType)
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedDataType}_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert('Data exported successfully!')
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data')
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file to import')
      return
    }

    try {
      const text = await importFile.text()
      const data = JSON.parse(text)
      
      const success = await onImportData(selectedDataType, data)
      
      if (success) {
        alert('Data imported successfully!')
        setImportFile(null)
      } else {
        alert('Failed to import data')
      }
    } catch (error) {
      console.error('Error importing data:', error)
      alert('Failed to import data. Please check the file format.')
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
    }
  }

  // Calculate summary statistics
  const totalOperations = importExportHistory.length
  const completedOperations = importExportHistory.filter(op => op.status === 'completed').length
  const failedOperations = importExportHistory.filter(op => op.status === 'failed').length
  const processingOperations = importExportHistory.filter(op => op.status === 'processing').length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white">
          <Download className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Import & Export</h3>
          <p className="text-sm text-gray-600">Manage pricing data and settings</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Operations</p>
              <p className="text-2xl font-bold text-gray-900">{totalOperations}</p>
            </div>
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedOperations}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-yellow-600">{processingOperations}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{failedOperations}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Import/Export Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Download className="h-4 w-4 text-green-600" />
            Export Data
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
              <select
                value={selectedDataType}
                onChange={(e) => setSelectedDataType(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pricing_rules">Pricing Rules</option>
                <option value="product_settings">Product Settings</option>
                <option value="all_data">All Data</option>
                <option value="pricing_report">Pricing Report</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Export Information</h5>
              <p className="text-sm text-blue-700">
                Export your pricing data in JSON format. This includes all settings, rules, and configurations.
              </p>
            </div>

            <PremiumButton
              gradient="green"
              icon={Download}
              onClick={handleExport}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Exporting...' : 'Export Data'}
            </PremiumButton>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="h-4 w-4 text-blue-600" />
            Import Data
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
              <select
                value={selectedDataType}
                onChange={(e) => setSelectedDataType(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pricing_rules">Pricing Rules</option>
                <option value="product_settings">Product Settings</option>
                <option value="all_data">All Data</option>
                <option value="pricing_report">Pricing Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {importFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {importFile.name} ({formatFileSize(importFile.size)})
                </p>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-medium text-yellow-900 mb-2">Import Warning</h5>
              <p className="text-sm text-yellow-700">
                Importing data will overwrite existing settings. Make sure to backup your current data first.
              </p>
            </div>

            <PremiumButton
              gradient="blue"
              icon={Upload}
              onClick={handleImport}
              disabled={isLoading || !importFile}
              className="w-full"
            >
              {isLoading ? 'Importing...' : 'Import Data'}
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Operation History */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Operation History</h4>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : importExportHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No import/export operations found.</p>
            <p className="text-xs mt-1">Start by exporting or importing your pricing data.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {importExportHistory.slice(0, 10).map((operation) => (
              <div key={operation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getOperationIcon(operation.operation_type)}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{operation.filename}</h5>
                    <p className="text-sm text-gray-600">
                      {operation.data_type.replace('_', ' ')} • {formatDate(operation.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(operation.status)}`}>
                    {operation.status}
                  </span>
                  
                  {operation.file_size && (
                    <span className="text-sm text-gray-500">
                      {formatFileSize(operation.file_size)}
                    </span>
                  )}
                  
                  {getStatusIcon(operation.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 