import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Save, X, Plus, Trash2, Home, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { BuildingFormData, Building } from '../types/property'

const buildingFormSchema = z.object({
  name: z.string().min(1, 'Building name is required'),
  address: z.string().min(1, 'Address is required'),
  total_units: z.number().min(1, 'Total units must be at least 1'),
  property_type: z.enum(['apartment', 'house', 'commercial', 'mixed']),
  year_built: z.number().optional(),
  amenities: z.array(z.string()),
  manager_id: z.string().optional()
})

interface BuildingFormProps {
  building?: Building
  onSave: (data: BuildingFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const BuildingForm: React.FC<BuildingFormProps> = ({
  building,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [newAmenity, setNewAmenity] = useState('')

  const form = useForm<BuildingFormData>({
    resolver: zodResolver(buildingFormSchema),
    defaultValues: {
      name: building?.name || '',
      address: building?.address || '',
      total_units: building?.total_units || 1,
      property_type: building?.property_type || 'apartment',
      year_built: building?.year_built,
      amenities: building?.amenities || [],
      manager_id: building?.manager_id || ''
    }
  })

  const onSubmit = (data: BuildingFormData) => {
    onSave(data)
  }

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment Complex' },
    { value: 'house', label: 'House' },
    { value: 'commercial', label: 'Commercial Building' },
    { value: 'mixed', label: 'Mixed Use' }
  ]

  const addAmenity = () => {
    if (newAmenity.trim()) {
      const currentAmenities = form.getValues('amenities') || []
      form.setValue('amenities', [...currentAmenities, newAmenity.trim()])
      setNewAmenity('')
    }
  }

  const removeAmenity = (index: number) => {
    const currentAmenities = form.getValues('amenities') || []
    form.setValue('amenities', currentAmenities.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addAmenity()
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Building Name *</Label>
            <Input
              id="name"
              placeholder="Enter building name"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="property_type">Property Type *</Label>
            <Select
              value={form.watch('property_type')}
              onValueChange={(value) => form.setValue('property_type', value as any)}
            >
              <SelectTrigger className="bg-white border-gray-300 rounded-md">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.property_type && (
              <p className="text-sm text-red-600">{form.formState.errors.property_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="year_built">Year Built</Label>
            <Input
              id="year_built"
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              placeholder="Year built"
              {...form.register('year_built', { valueAsNumber: true })}
            />
            {form.formState.errors.year_built && (
              <p className="text-sm text-red-600">{form.formState.errors.year_built.message}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Textarea
            id="address"
            placeholder="Enter full address"
            {...form.register('address')}
            rows={3}
          />
          {form.formState.errors.address && (
            <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
          )}
        </div>

        {/* Units and Manager */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total_units">Total Units *</Label>
            <Input
              id="total_units"
              type="number"
              min="1"
              placeholder="Number of units"
              {...form.register('total_units', { valueAsNumber: true })}
            />
            {form.formState.errors.total_units && (
              <p className="text-sm text-red-600">{form.formState.errors.total_units.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager_id">Property Manager</Label>
            <Input
              id="manager_id"
              placeholder="Manager ID or name"
              {...form.register('manager_id')}
            />
            {form.formState.errors.manager_id && (
              <p className="text-sm text-red-600">{form.formState.errors.manager_id.message}</p>
            )}
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <Label>Amenities</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add amenity (e.g., Parking, Gym)"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addAmenity}
              disabled={!newAmenity.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Amenities List */}
          <div className="flex flex-wrap gap-2">
            {form.watch('amenities')?.map((amenity, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {amenity}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeAmenity(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          
          {form.watch('amenities')?.length === 0 && (
            <p className="text-sm text-gray-500">No amenities added yet</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : (building ? 'Update Building' : 'Create Building')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default BuildingForm
