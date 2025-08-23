'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Save, X, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface VariantOptionType {
  id: string
  name: string
  display_name: string
  description: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

interface VariantTypeFormData {
  name: string
  display_name: string
  description: string
  is_active: boolean
}

export const VariantTypesManager: React.FC = () => {
  const [variantTypes, setVariantTypes] = useState<VariantOptionType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingType, setEditingType] = useState<VariantOptionType | null>(null)
  const [formData, setFormData] = useState<VariantTypeFormData>({
    name: '',
    display_name: '',
    description: '',
    is_active: true
  })

  useEffect(() => {
    fetchVariantTypes()
  }, [])

  const fetchVariantTypes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('variant_option_types')
        .select('*')
        .order('sort_order')

      if (error) throw error
      setVariantTypes(data || [])
    } catch (error) {
      console.error('Error fetching variant types:', error)
      toast.error('Failed to load variant types')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.display_name.trim()) {
      toast.error('Name and display name are required')
      return
    }

    try {
      if (editingType) {
        // Update existing type
        const { error } = await supabase
          .from('variant_option_types')
          .update({
            name: formData.name.toLowerCase().trim(),
            display_name: formData.display_name.trim(),
            description: formData.description.trim() || null,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingType.id)

        if (error) throw error
        toast.success('Variant type updated successfully')
      } else {
        // Create new type - get max sort order
        const { data: maxSortData } = await supabase
          .from('variant_option_types')
          .select('sort_order')
          .order('sort_order', { ascending: false })
          .limit(1)

        const nextSortOrder = (maxSortData?.[0]?.sort_order || 0) + 1

        const { error } = await supabase
          .from('variant_option_types')
          .insert({
            name: formData.name.toLowerCase().trim(),
            display_name: formData.display_name.trim(),
            description: formData.description.trim() || null,
            is_active: formData.is_active,
            sort_order: nextSortOrder
          })

        if (error) throw error
        toast.success('Variant type created successfully')
      }

      // Reset form and refresh data
      resetForm()
      fetchVariantTypes()
    } catch (error: any) {
      console.error('Error saving variant type:', error)
      if (error.code === '23505') {
        toast.error('A variant type with this name already exists')
      } else {
        toast.error(editingType ? 'Failed to update variant type' : 'Failed to create variant type')
      }
    }
  }

  const handleEdit = (variantType: VariantOptionType) => {
    setEditingType(variantType)
    setFormData({
      name: variantType.name,
      display_name: variantType.display_name,
      description: variantType.description || '',
      is_active: variantType.is_active
    })
    setShowAddForm(true)
  }

  const handleDelete = async (typeId: string) => {
    if (!confirm('Are you sure you want to delete this variant type? This will also delete all related variant options.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('variant_option_types')
        .delete()
        .eq('id', typeId)

      if (error) throw error
      toast.success('Variant type deleted successfully')
      fetchVariantTypes()
    } catch (error: any) {
      console.error('Error deleting variant type:', error)
      if (error.code === '23503') {
        toast.error('Cannot delete variant type - it is being used by products or categories')
      } else {
        toast.error('Failed to delete variant type')
      }
    }
  }

  const updateSortOrder = async (typeId: string, newSortOrder: number) => {
    try {
      const { error } = await supabase
        .from('variant_option_types')
        .update({ sort_order: newSortOrder })
        .eq('id', typeId)

      if (error) throw error
      fetchVariantTypes()
    } catch (error) {
      console.error('Error updating sort order:', error)
      toast.error('Failed to update sort order')
    }
  }

  const moveType = (typeId: string, direction: 'up' | 'down') => {
    const currentIndex = variantTypes.findIndex(t => t.id === typeId)
    if (currentIndex === -1) return

    if (direction === 'up' && currentIndex > 0) {
      const currentType = variantTypes[currentIndex]
      const previousType = variantTypes[currentIndex - 1]
      updateSortOrder(currentType.id, previousType.sort_order)
      updateSortOrder(previousType.id, currentType.sort_order)
    } else if (direction === 'down' && currentIndex < variantTypes.length - 1) {
      const currentType = variantTypes[currentIndex]
      const nextType = variantTypes[currentIndex + 1]
      updateSortOrder(currentType.id, nextType.sort_order)
      updateSortOrder(nextType.id, currentType.sort_order)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      is_active: true
    })
    setShowAddForm(false)
    setEditingType(null)
  }

  const filteredTypes = variantTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-gray-500">Loading variant types...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search variant types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variant Type
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="border-[#E5FF29]">
          <CardHeader>
            <CardTitle>
              {editingType ? 'Edit Variant Type' : 'Add New Variant Type'}
            </CardTitle>
            <CardDescription>
              {editingType 
                ? 'Update variant type information' 
                : 'Create a new variant type (e.g., Size, Color, Brand, Style)'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Internal Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., size, color, brand"
                    required
                  />
                  <p className="text-xs text-gray-500">Lowercase, no spaces. Used for system identification.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="e.g., Size, Color, Brand"
                    required
                  />
                  <p className="text-xs text-gray-500">Human-readable name shown to users.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this variant type represents (optional)"
                  rows={3}
                />
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
                  {editingType ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Variant Types List */}
      <div className="space-y-3">
        {filteredTypes.map((type, index) => (
          <Card key={type.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveType(type.id, 'up')}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveType(type.id, 'down')}
                      disabled={index === filteredTypes.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{type.display_name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {type.name}
                      </Badge>
                      <Badge 
                        variant={type.is_active ? "default" : "secondary"}
                        className={type.is_active ? "bg-green-100 text-green-800" : ""}
                      >
                        {type.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    {type.description && (
                      <p className="text-sm text-gray-600">{type.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-400">
                        Order: {type.sort_order}
                      </span>
                      <span className="text-xs text-gray-400">
                        Created {new Date(type.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(type)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(type.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTypes.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">
            {searchTerm ? 'No variant types found matching your search' : 'No variant types created yet'}
          </div>
          {!searchTerm && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-4">
                Variant types define the different ways your products can vary (e.g., Size, Color, Brand)
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Variant Type
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
