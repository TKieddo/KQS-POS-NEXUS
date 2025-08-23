import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Building2,
  MapPin,
  User,
  Save,
  X
} from 'lucide-react'
import type { Division, DivisionFormData } from '../types/employee'

interface DivisionFormProps {
  division?: Division | null
  onSubmit: (data: Partial<Division>) => Promise<void>
  onCancel: () => void
}

export function DivisionForm({ division, onSubmit, onCancel }: DivisionFormProps) {
  const [formData, setFormData] = useState<DivisionFormData>({
    name: '',
    code: '',
    description: '',
    managerId: '',
    location: '',
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (division) {
      setFormData({
        name: division.name,
        code: division.code,
        description: division.description || '',
        managerId: division.managerId || '',
        location: division.location,
        isActive: division.isActive
      })
    }
  }, [division])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Division name is required'
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Division code is required'
    } else if (formData.code.length < 2) {
      newErrors.code = 'Division code must be at least 2 characters'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error saving division:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof DivisionFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            {division ? 'Edit Division' : 'Create New Division'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Division Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Construction, Footwear, Property"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Division Code *
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="e.g., CON, FTW, PROP"
                  className={errors.code ? 'border-red-500' : ''}
                />
                {errors.code && (
                  <p className="text-sm text-red-600">{errors.code}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the division's purpose and responsibilities..."
                rows={3}
              />
            </div>
          </div>

          {/* Location and Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Location & Management</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Location *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Maseru, Botha Bothe"
                    className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.location && (
                  <p className="text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerId" className="text-sm font-medium">
                  Division Manager
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="managerId"
                    value={formData.managerId}
                    onChange={(e) => handleInputChange('managerId', e.target.value)}
                    placeholder="Manager ID or name"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Status</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive" className="text-sm font-medium">
                Division is active
              </Label>
            </div>
            <p className="text-sm text-gray-500">
              Inactive divisions will not appear in employee assignment options
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (division ? 'Update Division' : 'Create Division')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
