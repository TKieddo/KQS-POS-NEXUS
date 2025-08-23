import React, { useState, useRef } from 'react'
import { Upload, FileText, Download, Trash2, Eye, Plus, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { Document } from '../types/property'

interface DocumentUploaderProps {
  entityId: string
  entityType: 'building' | 'tenant' | 'payment' | 'room'
  documents: Document[]
  onUpload: (file: File, documentData: Partial<Document>) => Promise<void>
  onDelete: (documentId: string) => Promise<void>
  onDownload: (document: Document) => void
  onView: (document: Document) => void
  isLoading?: boolean
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  entityId,
  entityType,
  documents,
  onUpload,
  onDelete,
  onDownload,
  onView,
  isLoading = false
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>('')
  const [description, setDescription] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const documentTypes = [
    { value: 'contract', label: 'Contract/Lease Agreement' },
    { value: 'receipt', label: 'Payment Receipt' },
    { value: 'id_document', label: 'ID Document' },
    { value: 'utility_bill', label: 'Utility Bill' },
    { value: 'maintenance_report', label: 'Maintenance Report' },
    { value: 'other', label: 'Other' }
  ]

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'contract': return 'bg-blue-100 text-blue-800'
      case 'receipt': return 'bg-green-100 text-green-800'
      case 'id_document': return 'bg-purple-100 text-purple-800'
      case 'utility_bill': return 'bg-orange-100 text-orange-800'
      case 'maintenance_report': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setIsDialogOpen(true)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !documentType) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const documentData: Partial<Document> = {
        name: selectedFile.name,
        type: documentType as any,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
        related_entity_type: entityType,
        related_entity_id: entityId,
        description: description || undefined
      }

      await onUpload(selectedFile, documentData)
      
      setUploadProgress(100)
      setTimeout(() => {
        resetForm()
        setIsDialogOpen(false)
      }, 500)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setDocumentType('')
    setDescription('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await onDelete(documentId)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
            <CardDescription>
              Manage documents and files for this {entityType}
            </CardDescription>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
          className="hidden"
        />

        {/* Documents List */}
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No documents uploaded yet</p>
            <p className="text-sm">Click "Upload Document" to add files</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{document.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getDocumentTypeColor(document.type)}>
                        {document.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatFileSize(document.file_size)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(document.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {document.description && (
                      <p className="text-sm text-gray-600 mt-1">{document.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(document)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(document)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(document.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a new document to this {entityType}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Info */}
            {selectedFile && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="document_type">Document Type *</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description for this document..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !documentType || isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Upload className="h-4 w-4 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default DocumentUploader
