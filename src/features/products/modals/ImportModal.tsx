import { useState, useRef } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { 
  parseCSV, 
  validateImportData, 
  importProducts, 
  generateCSVTemplate,
  type ImportResult 
} from "@/lib/import-export"

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete?: () => void
}

export const ImportModal = ({ isOpen, onClose, onImportComplete }: ImportModalProps) => {
  const [importMode, setImportMode] = useState<'add' | 'update' | 'replace'>('add')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [validationResult, setValidationResult] = useState<ImportResult | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [csvPreview, setCsvPreview] = useState<string[][]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setSelectedFile(file)
      setValidationResult(null)
      setImportResult(null)
      previewCSV(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setSelectedFile(file)
      setValidationResult(null)
      setImportResult(null)
      previewCSV(file)
    }
  }

  const previewCSV = async (file: File) => {
    const text = await file.text()
    const lines = text.split('\n').slice(0, 6) // Show first 5 data rows + header
    const preview = lines.map(line => 
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    )
    setCsvPreview(preview)
  }

  const handleValidate = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    try {
      const text = await selectedFile.text()
      const products = parseCSV(text)
      const result = validateImportData(products)
      setValidationResult(result)
    } catch (error) {
      setValidationResult({
        success: false,
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        imported: 0,
        errors: [{ row: 0, field: 'file', message: 'Failed to parse CSV file' }],
        warnings: []
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    try {
      const text = await selectedFile.text()
      const products = parseCSV(text)
      const result = await importProducts(products, importMode)
      setImportResult(result)
      
      if (result.success) {
        onImportComplete?.()
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        imported: 0,
        errors: [{ row: 0, field: 'general', message: 'Failed to import products' }],
        warnings: []
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate()
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product_import_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetForm = () => {
    setSelectedFile(null)
    setValidationResult(null)
    setImportResult(null)
    setCsvPreview([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Products" maxWidth="4xl">
      <div className="space-y-6">
        {/* File Upload Section */}
        <div 
          className="border-2 border-dashed border-black/20 rounded-lg p-8 text-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-black/40 mx-auto mb-4" />
          <p className="text-lg font-medium text-black mb-2">Upload CSV file</p>
          <p className="text-sm text-black/60 mb-4">
            Drag and drop your file here, or click to browse. 
            <br />
            <span className="text-xs">Supports products with variants - each variant should be on a separate row</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button 
            variant="outline" 
            className="bg-white border-black/20"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </Button>
          {selectedFile && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            </div>
          )}
        </div>

        {/* CSV Preview */}
        {csvPreview.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-black mb-3">File Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <table className="text-xs">
                <tbody>
                  {csvPreview.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-2 py-1 border border-gray-200 bg-white">
                          {cell || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Import Options */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-3">Import Options</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="importMode" 
                checked={importMode === 'add'}
                onChange={() => setImportMode('add')}
                className="rounded" 
              />
              <span className="text-sm text-black">Add new products only (skip existing)</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="importMode" 
                checked={importMode === 'update'}
                onChange={() => setImportMode('update')}
                className="rounded" 
              />
              <span className="text-sm text-black">Update existing products (keep others)</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="importMode" 
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="rounded" 
              />
              <span className="text-sm text-black">Replace all products (⚠️ destructive)</span>
            </label>
          </div>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className={`p-4 rounded-lg ${
            validationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {validationResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                validationResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationResult.message}
              </span>
            </div>
            
            {validationResult.errors.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {validationResult.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-700">
                      Row {error.row}: {error.field} - {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {validationResult.warnings.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {validationResult.warnings.map((warning, index) => (
                    <div key={index} className="text-xs text-yellow-700">
                      Row {warning.row}: {warning.field} - {warning.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Import Results */}
        {importResult && (
          <div className={`p-4 rounded-lg ${
            importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {importResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                importResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {importResult.message}
              </span>
            </div>
            
            {importResult.success && (
              <div className="text-sm text-green-700">
                Successfully imported {importResult.imported} products
              </div>
            )}
            
            {importResult.errors.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-red-800 mb-2">Import Errors:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-700">
                      Row {error.row}: {error.field} - {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {selectedFile && !validationResult && (
            <Button 
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleValidate}
              disabled={isProcessing}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isProcessing ? 'Validating...' : 'Validate File'}
            </Button>
          )}
          
          {validationResult?.success && (
            <Button 
              className="bg-[#E5FF29] text-black hover:bg-[#e5ff29]/90"
              onClick={handleImport}
              disabled={isProcessing}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isProcessing ? 'Importing...' : 'Import Products'}
            </Button>
          )}
          
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          
          <Button variant="outline" onClick={handleClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>

        {/* Help Text */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">CSV Format Guide</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• <strong>Required fields:</strong> name, sku, price</p>
            <p>• <strong>For variants:</strong> Set has_variants=true and fill variant_* fields</p>
            <p>• <strong>Categories:</strong> Use category_name - will be created if doesn't exist</p>
            <p>• <strong>Discounts:</strong> Set is_discount_active=true and fill discount_* fields</p>
            <p>• <strong>Dates:</strong> Use format YYYY-MM-DDTHH:MM:SS (e.g., 2024-12-31T23:59:59)</p>
          </div>
        </div>
      </div>
    </Modal>
  )
} 