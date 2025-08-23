import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { 
  createPromotion, 
  getPromotions, 
  updatePromotion, 
  deletePromotion, 
  applyPromotionToProducts,
  refreshProductDiscounts,
  type Promotion 
} from "@/lib/promotion-services"
import { getCategories, type Category } from "@/lib/supabase"
import { Calendar, Edit, Trash2, Play, Pause, CheckCircle, AlertCircle } from "lucide-react"

interface PromotionsModalProps {
  isOpen: boolean
  onClose: () => void
  onPromotionApplied?: () => void
}

export const PromotionsModal = ({ isOpen, onClose, onPromotionApplied }: PromotionsModalProps) => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form state for new promotion
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_amount: '',
    start_date: '',
    end_date: '',
    is_active: true,
    applies_to: 'all' as 'all' | 'categories' | 'products',
    category_ids: [] as string[],
    product_ids: [] as string[]
  })

  // Load promotions and categories on mount
  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [promotionsData, { data: categoriesData }] = await Promise.all([
        getPromotions(),
        getCategories()
      ])
      setPromotions(promotionsData)
      setCategories(categoriesData || [])
    } catch (err) {
      setError('Failed to load promotions and categories')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePromotion = async () => {
    if (!formData.name || !formData.discount_amount || !formData.start_date || !formData.end_date) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await createPromotion({
        name: formData.name,
        description: formData.description || undefined,
        discount_type: formData.discount_type,
        discount_amount: parseFloat(formData.discount_amount),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
        applies_to: formData.applies_to,
        category_ids: formData.category_ids.length > 0 ? formData.category_ids : undefined,
        product_ids: formData.product_ids.length > 0 ? formData.product_ids : undefined
      })

      if (result.success) {
        setSuccess('Promotion created successfully')
        resetForm()
        await loadData()
        
        // Refresh product discounts to reflect new promotion
        if (formData.is_active) {
          const refreshResult = await refreshProductDiscounts()
          if (refreshResult.success) {
            console.log('Product discounts refreshed:', refreshResult.message)
          } else {
            console.error('Failed to refresh product discounts:', refreshResult.message)
          }
        }
        
        // Refresh products to reflect promotion changes
        onPromotionApplied?.()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to create promotion')
      console.error('Error creating promotion:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyPromotion = async (promotionId: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await applyPromotionToProducts(promotionId)
      if (result.success) {
        setSuccess(`Promotion applied to ${result.updated} products`)
        onPromotionApplied?.()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to apply promotion')
      console.error('Error applying promotion:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePromotion = async (promotionId: string, isActive: boolean) => {
    setLoading(true)
    setError(null)
    try {
      const result = await updatePromotion(promotionId, { is_active: !isActive })
      if (result.success) {
        setSuccess(`Promotion ${isActive ? 'deactivated' : 'activated'} successfully`)
        await loadData()
        
        // Refresh product discounts to reflect promotion changes
        const refreshResult = await refreshProductDiscounts()
        if (refreshResult.success) {
          console.log('Product discounts refreshed:', refreshResult.message)
        } else {
          console.error('Failed to refresh product discounts:', refreshResult.message)
        }
        
        // Refresh products to reflect promotion changes
        onPromotionApplied?.()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to update promotion')
      console.error('Error updating promotion:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePromotion = async (promotionId: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return

    setLoading(true)
    setError(null)
    try {
      const result = await deletePromotion(promotionId)
      if (result.success) {
        setSuccess('Promotion deleted successfully')
        await loadData()
        
        // Refresh product discounts to reflect promotion changes
        const refreshResult = await refreshProductDiscounts()
        if (refreshResult.success) {
          console.log('Product discounts refreshed:', refreshResult.message)
        } else {
          console.error('Failed to refresh product discounts:', refreshResult.message)
        }
        
        // Refresh products to reflect promotion changes
        onPromotionApplied?.()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to delete promotion')
      console.error('Error deleting promotion:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_amount: '',
      start_date: '',
      end_date: '',
      is_active: true,
      applies_to: 'all',
      category_ids: [],
      product_ids: []
    })
  }

  const isPromotionActive = (promotion: Promotion) => {
    if (!promotion.is_active) return false
    const now = new Date()
    const startDate = new Date(promotion.start_date)
    const endDate = new Date(promotion.end_date)
    return now >= startDate && now <= endDate
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Promotions" maxWidth="4xl">
      <div className="flex flex-col h-full max-h-[80vh]">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Error/Success Messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* Active Promotions */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-3">Active Promotions</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29] mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading promotions...</p>
              </div>
            ) : promotions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No promotions created yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {promotions.map((promotion) => {
                  const active = isPromotionActive(promotion)
                  return (
                    <div key={promotion.id} className="flex items-center justify-between p-4 bg-[#F3F3F3] rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-black">{promotion.name}</p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-black/60 mb-1">{promotion.description}</p>
                        <div className="flex items-center gap-4 text-xs text-black/40">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}
                          </span>
                          <span>Applies to: {promotion.applies_to}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          promotion.discount_type === 'percentage' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {promotion.discount_type === 'percentage' ? `-${promotion.discount_amount}%` : `-$${promotion.discount_amount}`}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApplyPromotion(promotion.id)}
                          disabled={loading}
                          title="Apply to products"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleTogglePromotion(promotion.id, promotion.is_active)}
                          disabled={loading}
                          title={promotion.is_active ? "Deactivate promotion" : "Activate promotion"}
                        >
                          {promotion.is_active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeletePromotion(promotion.id)}
                          disabled={loading}
                          className="text-red-600 hover:bg-red-50"
                          title="Delete promotion"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Create New Promotion */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-3">Create New Promotion</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Promotion Name *</label>
                <Input 
                  placeholder="e.g., Black Friday Sale" 
                  className="bg-white border-black/20"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Discount Type *</label>
                <select 
                  className="w-full p-2 border border-black/20 rounded-md bg-white"
                  value={formData.discount_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value as 'percentage' | 'fixed' }))}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Discount Value *</label>
                <Input 
                  placeholder={formData.discount_type === 'percentage' ? '15' : '20'}
                  className="bg-white border-black/20"
                  type="number"
                  min="0"
                  max={formData.discount_type === 'percentage' ? '100' : undefined}
                  step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                  value={formData.discount_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Start Date *</label>
                <Input 
                  type="datetime-local" 
                  className="bg-white border-black/20"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">End Date *</label>
                <Input 
                  type="datetime-local" 
                  className="bg-white border-black/20"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Apply to</label>
                <select 
                  className="w-full p-2 border border-black/20 rounded-md bg-white"
                  value={formData.applies_to}
                  onChange={(e) => setFormData(prev => ({ ...prev, applies_to: e.target.value as 'all' | 'categories' | 'products' }))}
                >
                  <option value="all">All Products</option>
                  <option value="categories">Selected Categories</option>
                  <option value="products">Selected Products</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-black mb-2">Description</label>
                <Input 
                  placeholder="Optional description of the promotion"
                  className="bg-white border-black/20"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              {formData.applies_to === 'categories' && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">Select Categories</label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.category_ids.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ 
                                ...prev, 
                                category_ids: [...prev.category_ids, category.id] 
                              }))
                            } else {
                              setFormData(prev => ({ 
                                ...prev, 
                                category_ids: prev.category_ids.filter(id => id !== category.id) 
                              }))
                            }
                          }}
                          className="rounded"
                        />
                        <span>{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Button Section */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 mt-6">
          <Button 
            className="bg-[#E5FF29] text-black hover:bg-[#e5ff29]/90"
            onClick={handleCreatePromotion}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Promotion'}
          </Button>
          <Button variant="outline" onClick={resetForm}>
            Reset Form
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
} 