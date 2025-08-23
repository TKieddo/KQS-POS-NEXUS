'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Save, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { handleDatabaseError } from '@/lib/error-handling'
import { executeWithAuth } from '@/lib/auth-utils'

interface Category {
  id: string
  name: string
  description: string | null
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CategoryFormData {
  name: string
  description: string
  color: string
  is_active: boolean
}

export const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: '#3B82F6',
    is_active: true
  })

  // Color options for categories
  const colorOptions = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F97316', // Orange
    '#6B7280', // Gray
    '#14B8A6', // Teal
    '#84CC16'  // Lime
  ]

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await executeWithAuth(async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (error) throw error
        return data || []
      })
      setCategories(data)
    } catch (error: any) {
      handleDatabaseError(error, 'loading categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      await executeWithAuth(async () => {
        if (editingCategory) {
          // Update existing category
          const { error } = await supabase
            .from('categories')
            .update({
              name: formData.name.trim(),
              description: formData.description.trim() || null,
              color: formData.color,
              is_active: formData.is_active,
              updated_at: new Date().toISOString()
            })
            .eq('id', editingCategory.id)

          if (error) throw error
          toast.success('Category updated successfully')
        } else {
          // Create new category
          const { error } = await supabase
            .from('categories')
            .insert({
              name: formData.name.trim(),
              description: formData.description.trim() || null,
              color: formData.color,
              is_active: formData.is_active
            })

          if (error) throw error
          toast.success('Category created successfully')
        }
      })

      // Reset form and refresh data
      resetForm()
      fetchCategories()
    } catch (error: any) {
      handleDatabaseError(error, editingCategory ? 'updating category' : 'creating category')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      is_active: category.is_active
    })
    setShowAddForm(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    try {
      await executeWithAuth(async () => {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', categoryId)

        if (error) throw error
        toast.success('Category deleted successfully')
      })
      fetchCategories()
    } catch (error: any) {
      handleDatabaseError(error, 'deleting category')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      is_active: true
    })
    setShowAddForm(false)
    setEditingCategory(null)
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-gray-500">Loading categories...</div>
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
              placeholder="Search categories..."
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
          Add Category
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="border-[#E5FF29]">
          <CardHeader>
            <CardTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </CardTitle>
            <CardDescription>
              {editingCategory ? 'Update category information' : 'Create a new product category'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <div className="flex flex-wrap gap-1">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-6 h-6 rounded border-2 ${
                            formData.color === color ? 'border-gray-900' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description (optional)"
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
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(category)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(category.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {category.description && (
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <Badge 
                  variant={category.is_active ? "default" : "secondary"}
                  className={category.is_active ? "bg-green-100 text-green-800" : ""}
                >
                  {category.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-xs text-gray-400">
                  Created {new Date(category.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">
            {searchTerm ? 'No categories found matching your search' : 'No categories created yet'}
          </div>
          {!searchTerm && (
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Category
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
