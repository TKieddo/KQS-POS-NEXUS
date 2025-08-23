import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  FileText, 
  FileSpreadsheet, 
  Database, 
  Download,
  Calendar,
  Filter,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import type { DataManagementSettings, ExportHistory } from "@/types/data-management"

export interface DataExportCardProps {
  settings: DataManagementSettings | null
  exportHistory: ExportHistory[]
  isLoadingExportHistory: boolean
  onExport: (options: any) => void
}

export const DataExportCard = ({ 
  settings, 
  exportHistory, 
  isLoadingExportHistory, 
  onExport 
}: DataExportCardProps) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf' | 'json'>(settings?.default_export_format ?? 'csv')
  const [dateRange, setDateRange] = useState('all')
  const [includeProducts, setIncludeProducts] = useState(true)
  const [includeCustomers, setIncludeCustomers] = useState(true)
  const [includeSales, setIncludeSales] = useState(true)
  const [includeInventory, setIncludeInventory] = useState(true)
  const [includeSettings, setIncludeSettings] = useState(false)

  const handleExport = () => {
    onExport({
      format: exportFormat,
      dateRange,
      includeProducts,
      includeCustomers,
      includeSales,
      includeInventory,
      includeSettings
    })
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv': return <FileSpreadsheet className="h-4 w-4 text-green-600" />
      case 'json': return <FileText className="h-4 w-4 text-blue-600" />
      case 'pdf': return <FileText className="h-4 w-4 text-red-600" />
      case 'excel': return <FileSpreadsheet className="h-4 w-4 text-green-600" />
      default: return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-green-600" />
          <CardTitle className="text-xl font-semibold text-gray-900">Data Export</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Format */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Export Format</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                exportFormat === 'csv' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setExportFormat('csv')}
            >
              <div className="flex items-center gap-2 mb-2">
                {getFormatIcon('csv')}
                <span className="font-medium">CSV</span>
              </div>
              <p className="text-sm text-gray-600">Spreadsheet format, compatible with Excel</p>
            </div>
            
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                exportFormat === 'json' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setExportFormat('json')}
            >
              <div className="flex items-center gap-2 mb-2">
                {getFormatIcon('json')}
                <span className="font-medium">JSON</span>
              </div>
              <p className="text-sm text-gray-600">Structured data format for APIs</p>
            </div>
            
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                exportFormat === 'pdf' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setExportFormat('pdf')}
            >
              <div className="flex items-center gap-2 mb-2">
                {getFormatIcon('pdf')}
                <span className="font-medium">PDF</span>
              </div>
              <p className="text-sm text-gray-600">Document format for reports</p>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Date Range</h3>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </Select>
        </div>

        {/* Data Selection */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Data to Export</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeProducts"
                  checked={includeProducts}
                  onChange={(checked) => setIncludeProducts(checked)}
                />
                <label htmlFor="includeProducts" className="text-sm font-medium text-gray-700">
                  Products & Inventory
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCustomers"
                  checked={includeCustomers}
                  onChange={(checked) => setIncludeCustomers(checked)}
                />
                <label htmlFor="includeCustomers" className="text-sm font-medium text-gray-700">
                  Customer Data
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeSales"
                  checked={includeSales}
                  onChange={(checked) => setIncludeSales(checked)}
                />
                <label htmlFor="includeSales" className="text-sm font-medium text-gray-700">
                  Sales & Transactions
                </label>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeInventory"
                  checked={includeInventory}
                  onChange={(checked) => setIncludeInventory(checked)}
                />
                <label htmlFor="includeInventory" className="text-sm font-medium text-gray-700">
                  Inventory Movements
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeSettings"
                  checked={includeSettings}
                  onChange={(checked) => setIncludeSettings(checked)}
                />
                <label htmlFor="includeSettings" className="text-sm font-medium text-gray-700">
                  System Settings
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Exports */}
        {exportHistory.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Recent Exports</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {exportHistory.slice(0, 5).map((exportRecord) => (
                <div key={exportRecord.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(exportRecord.export_status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {exportRecord.export_type} Export
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(exportRecord.started_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {exportRecord.export_format?.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Action */}
        <Button 
          onClick={handleExport}
          disabled={isLoadingExportHistory}
          className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white"
        >
          {isLoadingExportHistory ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export Data
        </Button>
      </CardContent>
    </Card>
  )
} 