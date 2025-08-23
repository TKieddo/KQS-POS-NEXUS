import * as React from 'react'
import { Trash2, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import type { VariantOption } from '@/lib/variant-services'

export interface VariantCombination {
  id: string
  size?: string
  color?: string
  gender?: string
  brand?: string
  quantity: number
  price?: number
  cost?: number
}

export interface VariantQuantityManagerProps {
  selectedSizes: string[]
  selectedColors: string[]
  selectedGenders: string[]
  selectedBrands: string[]
  sizeOptions: VariantOption[]
  colorOptions: VariantOption[]
  genderOptions: VariantOption[]
  brandOptions: VariantOption[]
  combinations: VariantCombination[]
  onCombinationsChange: (combinations: VariantCombination[]) => void
  basePrice: number
  baseCost: number
  className?: string
}

const VariantQuantityManager = ({
  selectedSizes,
  selectedColors,
  selectedGenders,
  selectedBrands,
  sizeOptions,
  colorOptions,
  genderOptions,
  brandOptions,
  combinations,
  onCombinationsChange,
  basePrice,
  baseCost,
  className
}: VariantQuantityManagerProps) => {
  
  // State for manual combination selection
  const [showAddCombination, setShowAddCombination] = React.useState(false)
  const [newCombination, setNewCombination] = React.useState<Partial<VariantCombination>>({
    quantity: 1,
    price: basePrice,
    cost: baseCost
  })

  // Generate available options for combination selection
  const getAvailableOptions = () => {
    const options: { [key: string]: string[] } = {}
    
    if (selectedSizes.length > 0) {
      options.size = selectedSizes
    }
    if (selectedColors.length > 0) {
      options.color = selectedColors
    }
    if (selectedGenders.length > 0) {
      options.gender = selectedGenders
    }
    if (selectedBrands.length > 0) {
      options.brand = selectedBrands
    }
    
    return options
  }

  // Check if a combination already exists
  const combinationExists = (combo: Partial<VariantCombination>) => {
    return combinations.some(existing => {
      return existing.size === combo.size &&
             existing.color === combo.color &&
             existing.gender === combo.gender &&
             existing.brand === combo.brand
    })
  }

  // Add a new combination
  const addCombination = () => {
    if (!combinationExists(newCombination)) {
      const combo: VariantCombination = {
        id: Date.now().toString(),
        size: newCombination.size,
        color: newCombination.color,
        gender: newCombination.gender,
        brand: newCombination.brand,
        quantity: newCombination.quantity || 1,
        price: newCombination.price || basePrice,
        cost: newCombination.cost || baseCost
      }
      onCombinationsChange([...combinations, combo])
      
      // Reset form
      setNewCombination({
        quantity: 1,
        price: basePrice,
        cost: baseCost
      })
      setShowAddCombination(false)
    }
  }

  // Quick add combinations for single selections
  const addSingleSelections = () => {
    const newCombinations: VariantCombination[] = []
    
    // Add individual size selections
    selectedSizes.forEach(size => {
      if (!combinationExists({ size })) {
        newCombinations.push({
          id: `size-${size}-${Date.now()}`,
          size,
          quantity: 1,
          price: basePrice,
          cost: baseCost
        })
      }
    })
    
    // Add individual color selections
    selectedColors.forEach(color => {
      if (!combinationExists({ color })) {
        newCombinations.push({
          id: `color-${color}-${Date.now()}`,
          color,
          quantity: 1,
          price: basePrice,
          cost: baseCost
        })
      }
    })
    
    // Add individual gender selections
    selectedGenders.forEach(gender => {
      if (!combinationExists({ gender })) {
        newCombinations.push({
          id: `gender-${gender}-${Date.now()}`,
          gender,
          quantity: 1,
          price: basePrice,
          cost: baseCost
        })
      }
    })
    
    // Add individual brand selections
    selectedBrands.forEach(brand => {
      if (!combinationExists({ brand })) {
        newCombinations.push({
          id: `brand-${brand}-${Date.now()}`,
          brand,
          quantity: 1,
          price: basePrice,
          cost: baseCost
        })
      }
    })
    
    if (newCombinations.length > 0) {
      onCombinationsChange([...combinations, ...newCombinations])
    }
  }

  // Update combinations when base price/cost changes (for existing combinations)
  React.useEffect(() => {
    if (combinations.length > 0) {
      const updatedCombinations = combinations.map(combo => ({
        ...combo,
        price: combo.price === undefined ? basePrice : combo.price,
        cost: combo.cost === undefined ? baseCost : combo.cost
      }))
      onCombinationsChange(updatedCombinations)
    }
  }, [basePrice, baseCost])

  const updateCombination = (id: string, field: keyof VariantCombination, value: any) => {
    onCombinationsChange(
      combinations.map(combo => 
        combo.id === id ? { ...combo, [field]: value } : combo
      )
    )
  }

  const removeCombination = (id: string) => {
    onCombinationsChange(combinations.filter(combo => combo.id !== id))
  }

  const getVariantLabel = (combo: VariantCombination) => {
    const parts = []
    if (combo.size) parts.push(combo.size)
    if (combo.color) parts.push(combo.color)
    if (combo.gender) parts.push(combo.gender)
    if (combo.brand) parts.push(combo.brand)
    return parts.length > 0 ? parts.join(' - ') : 'Default'
  }

  const getVariantPillColor = (combo: VariantCombination) => {
    if (combo.size && combo.color) return 'bg-purple-100 border-purple-300 text-purple-700'
    if (combo.size) return 'bg-green-100 border-green-300 text-green-700'
    if (combo.color) return 'bg-blue-100 border-blue-300 text-blue-700'
    if (combo.brand) return 'bg-orange-100 border-orange-300 text-orange-700'
    return 'bg-gray-100 border-gray-300 text-gray-700'
  }

  const availableOptions = getAvailableOptions()
  const hasMultipleTypes = Object.keys(availableOptions).length > 1

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">Variant Combinations</h4>
        <div className="flex gap-2">
          {hasMultipleTypes && (
            <PremiumButton
              onClick={() => setShowAddCombination(true)}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Combination
            </PremiumButton>
          )}
          <PremiumButton
            onClick={addSingleSelections}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Singles
          </PremiumButton>
        </div>
      </div>

      {/* Add Combination Modal */}
      {showAddCombination && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-gray-900">Add New Combination</h5>
            <button
              onClick={() => setShowAddCombination(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            {availableOptions.size && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                <select
                  value={newCombination.size || ''}
                  onChange={(e) => setNewCombination(prev => ({ ...prev, size: e.target.value || undefined }))}
                  className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="">Select Size</option>
                  {availableOptions.size.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}
            
            {availableOptions.color && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                <select
                  value={newCombination.color || ''}
                  onChange={(e) => setNewCombination(prev => ({ ...prev, color: e.target.value || undefined }))}
                  className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="">Select Color</option>
                  {availableOptions.color.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            )}
            
            {availableOptions.gender && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={newCombination.gender || ''}
                  onChange={(e) => setNewCombination(prev => ({ ...prev, gender: e.target.value || undefined }))}
                  className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="">Select Gender</option>
                  {availableOptions.gender.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>
            )}
            
            {availableOptions.brand && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Brand</label>
                <select
                  value={newCombination.brand || ''}
                  onChange={(e) => setNewCombination(prev => ({ ...prev, brand: e.target.value || undefined }))}
                  className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="">Select Brand</option>
                  {availableOptions.brand.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <PremiumButton
              onClick={addCombination}
              size="sm"
              disabled={!newCombination.size && !newCombination.color && !newCombination.gender && !newCombination.brand}
            >
              Add Combination
            </PremiumButton>
            <PremiumButton
              onClick={() => setShowAddCombination(false)}
              size="sm"
              variant="outline"
            >
              Cancel
            </PremiumButton>
          </div>
        </div>
      )}

      {/* Existing Combinations */}
      {combinations.length > 0 && (
        <div className="space-y-2">
          {combinations.map((combo) => (
            <div
              key={combo.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                getVariantPillColor(combo)
              )}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    {getVariantLabel(combo)}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Qty:</label>
                    <PremiumInput
                      type="number"
                      value={combo.quantity}
                      onChange={(e) => updateCombination(combo.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-16 h-6 text-xs"
                      min="0"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Price:</label>
                    <PremiumInput
                      type="number"
                      value={combo.price || basePrice}
                      onChange={(e) => updateCombination(combo.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-20 h-6 text-xs"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Cost:</label>
                    <PremiumInput
                      type="number"
                      value={combo.cost || baseCost}
                      onChange={(e) => updateCombination(combo.id, 'cost', parseFloat(e.target.value) || 0)}
                      className="w-20 h-6 text-xs"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => removeCombination(combo.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* No combinations message */}
      {combinations.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No variant combinations added yet.</p>
          <p className="text-xs mt-1">Use the buttons above to add individual variants or specific combinations.</p>
        </div>
      )}
    </div>
  )
}

VariantQuantityManager.displayName = "VariantQuantityManager"

export { VariantQuantityManager } 