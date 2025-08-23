'use client'

import React, { useState, useRef } from 'react'
import { Plus, Edit2, Trash2, Tag, Palette, Ruler, Upload, Eye } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumTabs } from '@/components/ui/premium-tabs'
import { PremiumModal } from '@/components/ui/premium-modal'
import { PremiumInput } from '@/components/ui/premium-input'

interface Category {
  id: string
  name: string
  description?: string
  created_at: string
}

interface Color {
  id: string
  name: string
  hex_code: string
  image_url?: string
  created_at: string
}

interface Size {
  id: string
  name: string
  category: 'clothing' | 'shoes' | 'accessories'
  sort_order: number
  created_at: string
}

const CategoriesManager = () => {
  const [activeTab, setActiveTab] = useState('categories')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [colorImage, setColorImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock data - replace with actual Supabase queries
  const [categories] = useState<Category[]>([
    { id: '1', name: 'Clothing', description: 'Apparel and garments', created_at: '2024-01-01' },
    { id: '2', name: 'Shoes', description: 'Footwear collection', created_at: '2024-01-02' },
    { id: '3', name: 'Accessories', description: 'Fashion accessories', created_at: '2024-01-03' },
  ])

  const [colors] = useState<Color[]>([
    { id: '1', name: 'Black', hex_code: '#000000', created_at: '2024-01-01' },
    { id: '2', name: 'White', hex_code: '#FFFFFF', created_at: '2024-01-01' },
    { id: '3', name: 'Navy Blue', hex_code: '#1F2937', created_at: '2024-01-01' },
    { id: '4', name: 'Emerald', hex_code: '#10B981', created_at: '2024-01-01' },
    { id: '5', name: 'Rose', hex_code: '#F43F5E', created_at: '2024-01-01' },
    { id: '6', name: 'Amber', hex_code: '#F59E0B', created_at: '2024-01-01' },
  ])

  const [sizes] = useState<Size[]>([
    { id: '1', name: 'XS', category: 'clothing', sort_order: 1, created_at: '2024-01-01' },
    { id: '2', name: 'S', category: 'clothing', sort_order: 2, created_at: '2024-01-01' },
    { id: '3', name: 'M', category: 'clothing', sort_order: 3, created_at: '2024-01-01' },
    { id: '4', name: 'L', category: 'clothing', sort_order: 4, created_at: '2024-01-01' },
    { id: '5', name: 'XL', category: 'clothing', sort_order: 5, created_at: '2024-01-01' },
    { id: '6', name: '6', category: 'shoes', sort_order: 1, created_at: '2024-01-01' },
    { id: '7', name: '7', category: 'shoes', sort_order: 2, created_at: '2024-01-01' },
    { id: '8', name: '8', category: 'shoes', sort_order: 3, created_at: '2024-01-01' },
    { id: '9', name: '9', category: 'shoes', sort_order: 4, created_at: '2024-01-01' },
    { id: '10', name: '10', category: 'shoes', sort_order: 5, created_at: '2024-01-01' },
  ])

  const handleAdd = () => {
    setSelectedItem(null)
    setIsAddModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setSelectedItem(item)
    setIsEditModalOpen(true)
  }

  const handleDelete = (item: any) => {
    console.log('Delete:', item)
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setColorImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageRemove = () => {
    setColorImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const renderCategories = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category, index) => (
        <PremiumCard 
          key={category.id} 
          variant="gradient" 
          gradient={['blue', 'purple', 'green'][index % 3] as 'blue' | 'purple' | 'green'}
          className="p-6 hover:scale-[1.02] transition-transform duration-300"
        >
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{category.name}</h3>
              {category.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{category.description}</p>
              )}
              <p className="text-gray-500 text-xs font-medium">
                Created: {new Date(category.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200/50">
              <PremiumButton
                variant="outline"
                size="sm"
                onClick={() => handleEdit(category)}
                className="h-9 w-9 p-0 hover:bg-gray-100"
              >
                <Edit2 className="h-4 w-4 text-gray-600" />
              </PremiumButton>
              <PremiumButton
                variant="outline"
                size="sm"
                onClick={() => handleDelete(category)}
                className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      ))}
    </div>
  )

  const renderColors = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {colors.map((color, index) => (
        <PremiumCard 
          key={color.id} 
          variant="gradient" 
          gradient={['pink', 'orange', 'green', 'blue', 'purple'][index % 5] as 'pink' | 'orange' | 'green' | 'blue' | 'purple'}
          className="p-6 hover:scale-[1.02] transition-transform duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {color.image_url ? (
                <div className="relative">
                  <img
                    src={color.image_url}
                    alt={color.name}
                    className="w-12 h-12 rounded-xl border-2 border-white/40 shadow-lg ring-2 ring-white/20 object-cover"
                  />
                  <div className="absolute inset-0 rounded-xl border-2 border-white/40 shadow-lg ring-2 ring-white/20"
                       style={{ backgroundColor: color.hex_code }} />
                </div>
              ) : (
                <div
                  className="w-12 h-12 rounded-xl border-2 border-white/40 shadow-lg ring-2 ring-white/20"
                  style={{ backgroundColor: color.hex_code }}
                />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{color.name}</h3>
                <p className="text-gray-600 text-sm font-mono font-medium">{color.hex_code}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PremiumButton
                variant="outline"
                size="sm"
                onClick={() => handleEdit(color)}
                className="h-9 w-9 p-0 hover:bg-gray-100"
              >
                <Edit2 className="h-4 w-4 text-gray-600" />
              </PremiumButton>
              <PremiumButton
                variant="outline"
                size="sm"
                onClick={() => handleDelete(color)}
                className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      ))}
    </div>
  )

  const renderSizes = () => {
    const sizesByCategory = sizes.reduce((acc, size) => {
      if (!acc[size.category]) acc[size.category] = []
      acc[size.category].push(size)
      return acc
    }, {} as Record<string, Size[]>)

    return (
      <div className="space-y-8">
        {Object.entries(sizesByCategory).map(([category, categorySize], categoryIndex) => (
          <div key={category}>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 capitalize flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              {category} Sizes
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categorySize
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((size, index) => (
                  <PremiumCard 
                    key={size.id} 
                    variant="gradient" 
                    gradient={['blue', 'purple', 'green', 'orange', 'pink'][(categoryIndex + index) % 5] as 'blue' | 'purple' | 'green' | 'orange' | 'pink'}
                    className="p-4 hover:scale-105 transition-transform duration-300"
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-3">
                        {size.name}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <PremiumButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(size)}
                          className="h-7 w-7 p-0 hover:bg-gray-100"
                        >
                          <Edit2 className="h-3 w-3 text-gray-600" />
                        </PremiumButton>
                        <PremiumButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(size)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </PremiumButton>
                      </div>
                    </div>
                  </PremiumCard>
                ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const tabs = [
    { id: 'categories', label: 'Categories', icon: <Tag className="h-4 w-4" /> },
    { id: 'colors', label: 'Colors', icon: <Palette className="h-4 w-4" /> },
    { id: 'sizes', label: 'Sizes', icon: <Ruler className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6 px-6">
      {/* Action Bar */}
      <div className="flex items-center justify-end">
        <PremiumButton
          variant="gradient"
          onClick={handleAdd}
          icon={Plus}
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          Add New {activeTab.slice(0, -1)}
        </PremiumButton>
      </div>

      {/* Tabs */}
      <PremiumTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'categories' && renderCategories()}
        {activeTab === 'colors' && renderColors()}
        {activeTab === 'sizes' && renderSizes()}
      </div>

      {/* Add Modal */}
      <PremiumModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add New ${activeTab.slice(0, -1)}`}
      >
        <div className="space-y-6">
          {activeTab === 'categories' && (
            <>
              <PremiumInput
                label="Category Name"
                placeholder="Enter category name"
                required
              />
              <PremiumInput
                label="Description"
                placeholder="Enter category description (optional)"
                as="textarea"
                rows={3}
              />
            </>
          )}
          {activeTab === 'colors' && (
            <>
              <PremiumInput
                label="Color Name"
                placeholder="Enter color name"
                required
              />
              
              {/* Color Picker Section */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Color Selection</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-16 h-12 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm"
                  />
                  <div className="flex-1">
                    <PremiumInput
                      label="Hex Code"
                      placeholder="#000000"
                      value={selectedColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">Preview</label>
                    <div 
                      className="w-12 h-10 rounded-lg border-2 border-gray-200 shadow-sm"
                      style={{ backgroundColor: selectedColor }}
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Color Image (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Color preview"
                          className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                        />
                        <button
                          onClick={handleImageRemove}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">Image uploaded successfully</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          Click to upload
                        </button>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </>
          )}
          {activeTab === 'sizes' && (
            <>
              <PremiumInput
                label="Size Name"
                placeholder="Enter size name"
                required
              />
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <select className="w-full h-10 px-3 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300">
                  <option value="clothing">Clothing</option>
                  <option value="shoes">Shoes</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
              <PremiumInput
                label="Sort Order"
                placeholder="1"
                type="number"
                required
              />
            </>
          )}
          <div className="flex gap-3 pt-4">
            <PremiumButton
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              variant="gradient"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1"
            >
              Add {activeTab.slice(0, -1)}
            </PremiumButton>
          </div>
        </div>
      </PremiumModal>

      {/* Edit Modal */}
      <PremiumModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit ${activeTab.slice(0, -1)}`}
      >
        <div className="space-y-6">
          {activeTab === 'categories' && selectedItem && (
            <>
              <PremiumInput
                label="Category Name"
                placeholder="Enter category name"
                defaultValue={selectedItem.name}
                required
              />
              <PremiumInput
                label="Description"
                placeholder="Enter category description (optional)"
                defaultValue={selectedItem.description}
                as="textarea"
                rows={3}
              />
            </>
          )}
          {activeTab === 'colors' && selectedItem && (
            <>
              <PremiumInput
                label="Color Name"
                placeholder="Enter color name"
                defaultValue={selectedItem.name}
                required
              />
              
              {/* Color Picker Section */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Color Selection</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    defaultValue={selectedItem.hex_code}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-16 h-12 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm"
                  />
                  <div className="flex-1">
                    <PremiumInput
                      label="Hex Code"
                      placeholder="#000000"
                      defaultValue={selectedItem.hex_code}
                      onChange={(e) => handleColorChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">Preview</label>
                    <div 
                      className="w-12 h-10 rounded-lg border-2 border-gray-200 shadow-sm"
                      style={{ backgroundColor: selectedItem.hex_code }}
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Color Image (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {selectedItem.image_url || imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={imagePreview || selectedItem.image_url}
                          alt="Color preview"
                          className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                        />
                        <button
                          onClick={handleImageRemove}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">
                        {imagePreview ? 'New image uploaded' : 'Current image'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          Click to upload
                        </button>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </>
          )}
          {activeTab === 'sizes' && selectedItem && (
            <>
              <PremiumInput
                label="Size Name"
                placeholder="Enter size name"
                defaultValue={selectedItem.name}
                required
              />
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <select 
                  className="w-full h-10 px-3 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                  defaultValue={selectedItem.category}
                >
                  <option value="clothing">Clothing</option>
                  <option value="shoes">Shoes</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
              <PremiumInput
                label="Sort Order"
                placeholder="1"
                type="number"
                defaultValue={selectedItem.sort_order?.toString()}
                required
              />
            </>
          )}
          <div className="flex gap-3 pt-4">
            <PremiumButton
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              variant="gradient"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1"
            >
              Save Changes
            </PremiumButton>
          </div>
        </div>
      </PremiumModal>
    </div>
  )
}

export { CategoriesManager }