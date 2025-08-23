import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Download, 
  Upload, 
  FileText, 
  Cloud, 
  Settings, 
  Plus,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Archive,
  Database
} from 'lucide-react'
import { useDataExports } from '../hooks/useReports'
import { EXPORT_TABLES, REPORT_FORMATS } from '../types'

export interface DataExportManagerProps {
  className?: string
}

export const DataExportManager: React.FC<DataExportManagerProps> = ({ className }) => {
  const { exports, loading, error, creating, createExport, deleteExport } = useDataExports()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tables: [] as string[],
    format: 'csv' as const,
    filters: {}
  })

  const handleCreateExport = async () => {
    try {
      await createExport(formData)
      setShowCreateModal(false)
      setFormData({
        name: '',
        description: '',
        tables: [],
        format: 'csv',
        filters: {}
      })
    } catch (error) {
      console.error('Failed to create export:', error)
    }
  }

  const handleTableToggle = (table: string) => {
    setFormData(prev => ({
      ...prev,
      tables: prev.tables.includes(table)
        ? prev.tables.filter(t => t !== table)
        : [...prev.tables, table]
    }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-xl font-semibold text-gray-900">Data Export Manager</CardTitle>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Export History */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Export History</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-600">Loading exports...</span>
              </div>
            ) : exports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No exports found</p>
                <p className="text-sm">Create your first data export to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exports.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(exp.status)}
                      <div>
                        <p className="font-medium text-gray-900">{exp.name}</p>
                        <p className="text-sm text-gray-600">{exp.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>Format: {exp.format.toUpperCase()}</span>
                          <span>Tables: {exp.tables.length}</span>
                          {exp.file_size && (
                            <span>Size: {formatFileSize(exp.file_size)}</span>
                          )}
                          <span>Created: {new Date(exp.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exp.status)}`}>
                        {exp.status}
                      </span>
                      {exp.status === 'completed' && exp.file_url && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteExport(exp.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col bg-white border-gray-200 hover:bg-gray-50">
                <Cloud className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Backup All Data</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-white border-gray-200 hover:bg-gray-50">
                <Archive className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Export Archive</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-white border-gray-200 hover:bg-gray-50">
                <Settings className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Export Settings</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Create Export Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Data Export</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Export Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Complete Data Export"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this export"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                    <Select
                      value={formData.format}
                      onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value as any }))}
                    >
                      {Object.entries(REPORT_FORMATS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Tables</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {EXPORT_TABLES.map((table) => (
                        <div key={table} className="flex items-center space-x-2">
                          <Checkbox
                            id={table}
                            checked={formData.tables.includes(table)}
                            onChange={() => handleTableToggle(table)}
                          />
                          <label htmlFor={table} className="text-sm font-medium text-gray-700 capitalize">
                            {table.replace('_', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateExport}
                    disabled={creating || !formData.name || formData.tables.length === 0}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Export
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 