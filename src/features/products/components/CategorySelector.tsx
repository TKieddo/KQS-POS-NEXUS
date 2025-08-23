import * as React from 'react'
import { Plus, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'

export interface Category {
  id: string
  name: string
  description?: string
}

export interface CategorySelectorProps {
  categories: Category[]
  selectedCategoryId: string
  onCategoryChange: (categoryId: string) => void
  onAddCategory: (category: { name: string; description: string }) => Promise<boolean>
  className?: string
}

const CategorySelector = ({ 
  categories, 
  selectedCategoryId, 
  onCategoryChange, 
  onAddCategory,
  className 
}: CategorySelectorProps) => {
  // Debug: Log categories to see what's being received
  console.log('Categories in CategorySelector:', categories)
  console.log('Filtered categories:', categories.filter(category =>
    category.name.toLowerCase().includes(''.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(''.toLowerCase()))
  ))
  const [showCategoryForm, setShowCategoryForm] = React.useState(false)
  const [newCategory, setNewCategory] = React.useState({ name: '', description: '' })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('Please enter a category name')
      return
    }

    setIsSubmitting(true)
    try {
      console.log('CategorySelector: Adding category:', newCategory)
      const success = await onAddCategory({
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || ''
      })

      if (success) {
        console.log('CategorySelector: Category added successfully')
        setNewCategory({ name: '', description: '' })
        setShowCategoryForm(false)
        // Show success message
        alert('Category added successfully!')
      } else {
        console.error('CategorySelector: Failed to add category')
        alert('Failed to add category. Please try again.')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Failed to add category. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  
  // Debug: Log filtered categories
  console.log('Search term:', searchTerm)
  console.log('Filtered categories count:', filteredCategories.length)

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        Category
      </label>
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
        <PremiumInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search categories..."
          className="w-full h-8 pl-8 text-xs"
        />
      </div>

      {/* Category Selector */}
      <div className="flex gap-1">
        <select
          value={selectedCategoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-xs h-8"
        >
          <option value="">Select Category</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {/* Debug: Show categories count */}
        <div className="text-xs text-gray-500 mt-1">
          Available categories: {filteredCategories.length}
        </div>
        <PremiumButton
          onClick={() => setShowCategoryForm(true)}
          gradient="blue"
          size="sm"
          className="rounded-lg px-2 h-8"
        >
          <Plus className="h-3 w-3" />
        </PremiumButton>
      </div>

      {/* Selected Category Info */}
      {selectedCategoryId && (
        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800 font-medium">
            {categories.find(c => c.id === selectedCategoryId)?.name}
          </p>
          {categories.find(c => c.id === selectedCategoryId)?.description && (
            <p className="text-xs text-blue-600 mt-1">
              {categories.find(c => c.id === selectedCategoryId)?.description}
            </p>
          )}
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-80 max-w-[90vw]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Add New Category</h3>
              <button
                onClick={() => setShowCategoryForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <PremiumInput
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                  className="w-full h-9 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter category description"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm h-16"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <PremiumButton
                  variant="outline"
                  onClick={() => setShowCategoryForm(false)}
                  size="sm"
                  className="h-8 text-xs"
                >
                  Cancel
                </PremiumButton>
                <PremiumButton
                  onClick={handleAddCategory}
                  gradient="blue"
                  size="sm"
                  disabled={isSubmitting}
                  className="h-8 text-xs"
                >
                  {isSubmitting ? 'Adding...' : 'Add Category'}
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

CategorySelector.displayName = 'CategorySelector'

export { CategorySelector } 