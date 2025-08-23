'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Save, X, ArrowUp, ArrowDown, Palette } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface VariantOptionType {
  id: string
  name: string
  display_name: string
  is_active: boolean
}

interface VariantOption {
  id: string
  type_id: string
  value: string
  label: string
  color_hex: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  type: VariantOptionType
}

interface VariantOptionFormData {
  type_id: string
  value: string
  label: string
  color_hex: string
  is_active: boolean
}

export const VariantOptionsManager: React.FC = () => {
  const [variantTypes, setVariantTypes] = useState<VariantOptionType[]>([])
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingOption, setEditingOption] = useState<VariantOption | null>(null)
  const [formData, setFormData] = useState<VariantOptionFormData>({
    type_id: '',
    value: '',
    label: '',
    color_hex: '#000000',
    is_active: true
  })

  useEffect(() => {
    Promise.all([fetchVariantTypes(), fetchVariantOptions()])
  }, [])

  const fetchVariantTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('variant_option_types')
        .select('id, name, display_name, is_active')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      setVariantTypes(data || [])
    } catch (error) {
      console.error('Error fetching variant types:', error)
      toast.error('Failed to load variant types')
    }
  }

  const fetchVariantOptions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('variant_options')
        .select(`
          *,
          type:variant_option_types(id, name, display_name, is_active)
        `)
        .order('sort_order')

      if (error) throw error
      setVariantOptions(data || [])
    } catch (error) {
      console.error('Error fetching variant options:', error)
      toast.error('Failed to load variant options')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type_id || !formData.value.trim() || !formData.label.trim()) {
      toast.error('Type, value, and label are required')
      return
    }

    try {
      if (editingOption) {
        // Update existing option
        const { error } = await supabase
          .from('variant_options')
          .update({
            type_id: formData.type_id,
            value: formData.value.trim(),
            label: formData.label.trim(),
            color_hex: formData.color_hex || null,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingOption.id)

        if (error) throw error
        toast.success('Variant option updated successfully')
      } else {
        // Create new option - get max sort order for this type
        const { data: maxSortData } = await supabase
          .from('variant_options')
          .select('sort_order')
          .eq('type_id', formData.type_id)
          .order('sort_order', { ascending: false })
          .limit(1)

        const nextSortOrder = (maxSortData?.[0]?.sort_order || 0) + 1

        const { error } = await supabase
          .from('variant_options')
          .insert({
            type_id: formData.type_id,
            value: formData.value.trim(),
            label: formData.label.trim(),
            color_hex: formData.color_hex || null,
            is_active: formData.is_active,
            sort_order: nextSortOrder
          })

        if (error) throw error
        toast.success('Variant option created successfully')
      }

      // Reset form and refresh data
      resetForm()
      fetchVariantOptions()
    } catch (error: any) {
      console.error('Error saving variant option:', error)
      if (error.code === '23505') {
        toast.error('A variant option with this value already exists for this type')
      } else {
        toast.error(editingOption ? 'Failed to update variant option' : 'Failed to create variant option')
      }
    }
  }

  const handleEdit = (option: VariantOption) => {
    setEditingOption(option)
    setFormData({
      type_id: option.type_id,
      value: option.value,
      label: option.label,
      color_hex: option.color_hex || '#000000',
      is_active: option.is_active
    })
    setShowAddForm(true)
  }

  const handleDelete = async (optionId: string) => {
    if (!confirm('Are you sure you want to delete this variant option? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('variant_options')
        .delete()
        .eq('id', optionId)

      if (error) throw error
      toast.success('Variant option deleted successfully')
      fetchVariantOptions()
    } catch (error: any) {
      console.error('Error deleting variant option:', error)
      if (error.code === '23503') {
        toast.error('Cannot delete variant option - it is being used by products')
      } else {
        toast.error('Failed to delete variant option')
      }
    }
  }

  const updateSortOrder = async (optionId: string, newSortOrder: number) => {
    try {
      const { error } = await supabase
        .from('variant_options')
        .update({ sort_order: newSortOrder })
        .eq('id', optionId)

      if (error) throw error
      fetchVariantOptions()
    } catch (error) {
      console.error('Error updating sort order:', error)
      toast.error('Failed to update sort order')
    }
  }

  const moveOption = (optionId: string, direction: 'up' | 'down') => {
    const option = variantOptions.find(o => o.id === optionId)
    if (!option) return

    const sameTypeOptions = filteredOptions.filter(o => o.type_id === option.type_id)
    const currentIndex = sameTypeOptions.findIndex(o => o.id === optionId)
    
    if (currentIndex === -1) return

    if (direction === 'up' && currentIndex > 0) {
      const currentOption = sameTypeOptions[currentIndex]
      const previousOption = sameTypeOptions[currentIndex - 1]
      updateSortOrder(currentOption.id, previousOption.sort_order)
      updateSortOrder(previousOption.id, currentOption.sort_order)
    } else if (direction === 'down' && currentIndex < sameTypeOptions.length - 1) {
      const currentOption = sameTypeOptions[currentIndex]
      const nextOption = sameTypeOptions[currentIndex + 1]
      updateSortOrder(currentOption.id, nextOption.sort_order)
      updateSortOrder(nextOption.id, currentOption.sort_order)
    }
  }

  const resetForm = () => {
    setFormData({
      type_id: '',
      value: '',
      label: '',
      color_hex: '#000000',
      is_active: true
    })
    setShowAddForm(false)
    setEditingOption(null)
  }

  const filteredOptions = variantOptions.filter(option => {
    const matchesSearch = option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         option.type.display_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedTypeFilter === 'all' || !selectedTypeFilter || option.type_id === selectedTypeFilter
    
    return matchesSearch && matchesType
  })

  // Group options by type
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const typeKey = option.type.display_name
    if (!acc[typeKey]) {
      acc[typeKey] = []
    }
    acc[typeKey].push(option)
    return acc
  }, {} as Record<string, VariantOption[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-gray-500">Loading variant options...</div>
      </div>
    )
  }

  const isColorType = (typeName: string) => typeName.toLowerCase().includes('color')

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search variant options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {variantTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
          disabled={variantTypes.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variant Option
        </Button>
      </div>

      {variantTypes.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              You need to create variant types first before adding variant options. 
              Go to the "Variant Types" tab to get started.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="border-[#E5FF29]">
          <CardHeader>
            <CardTitle>
              {editingOption ? 'Edit Variant Option' : 'Add New Variant Option'}
            </CardTitle>
            <CardDescription>
              {editingOption 
                ? 'Update variant option information' 
                : 'Create a new variant option value (e.g., Small, Red, Nike)'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type_id">Variant Type *</Label>
                  <Select 
                    value={formData.type_id} 
                    onValueChange={(value) => setFormData({ ...formData, type_id: value })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select variant type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {variantTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="e.g., small, red, nike"
                    required
                  />
                  <p className="text-xs text-gray-500">Lowercase, no spaces. Used for system identification.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Display Label *</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g., Small, Red, Nike"
                    required
                  />
                  <p className="text-xs text-gray-500">Human-readable name shown to users.</p>
                </div>
                
                {formData.type_id && isColorType(variantTypes.find(t => t.id === formData.type_id)?.display_name || '') && (
                  <div className="space-y-2">
                    <Label htmlFor="color_hex">Color (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="color_hex"
                        type="color"
                        value={formData.color_hex}
                        onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={formData.color_hex}
                        onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Color representation for this option.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90">
                  <Save className="h-4 w-4 mr-2" />
                  {editingOption ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Grouped Variant Options */}
      <div className="space-y-6">
        {Object.entries(groupedOptions).map(([typeName, options]) => (
          <Card key={typeName}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {isColorType(typeName) && <Palette className="h-5 w-5" />}
                {typeName}
                <Badge variant="outline">{options.length} options</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {options.map((option, index) => {
                const sameTypeOptions = options
                return (
                  <div key={option.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveOption(option.id, 'up')}
                          disabled={index === 0}
                          className="h-5 w-5 p-0"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveOption(option.id, 'down')}
                          disabled={index === sameTypeOptions.length - 1}
                          className="h-5 w-5 p-0"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {option.color_hex && (
                          <div 
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: option.color_hex }}
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{option.label}</span>
                            <Badge variant="outline" className="text-xs">
                              {option.value}
                            </Badge>
                            <Badge 
                              variant={option.is_active ? "default" : "secondary"}
                              className={option.is_active ? "bg-green-100 text-green-800" : ""}
                            >
                              {option.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Order: {option.sort_order} • Created {new Date(option.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(option)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(option.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(groupedOptions).length === 0 && !loading && variantTypes.length > 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">
            {searchTerm || (selectedTypeFilter && selectedTypeFilter !== 'all') ? 'No variant options found matching your filters' : 'No variant options created yet'}
          </div>
          {!searchTerm && (selectedTypeFilter === 'all' || !selectedTypeFilter) && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-4">
                Create specific options for your variant types (e.g., Small/Medium/Large for Size)
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Variant Option
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
