import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Save,
  X,
  Upload,
  Receipt
} from 'lucide-react'
import { CashflowEntry, CashflowCategory, NewCashflowEntry } from '../types/cashflow'
import { useBranch } from '@/context/BranchContext'

interface CashflowEntryFormProps {
  categories: CashflowCategory[]
  expenseCategories: CashflowCategory[]
  incomeCategories: CashflowCategory[]
  entry?: CashflowEntry | null
  onSubmit: (entry: NewCashflowEntry) => void
  onCancel: () => void
}

export function CashflowEntryForm({ 
  categories, 
  expenseCategories, 
  incomeCategories, 
  entry, 
  onSubmit, 
  onCancel 
}: CashflowEntryFormProps) {
  const { selectedBranch } = useBranch()
  const [formData, setFormData] = useState<NewCashflowEntry>({
    branch_id: selectedBranch?.id || '',
    entry_type: 'expense',
    category: '',
    description: '',
    amount: 0,
    receipt_url: '',
    entry_date: new Date().toISOString().split('T')[0]
  })
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with entry data if editing
  useEffect(() => {
    if (entry) {
      setFormData({
        branch_id: entry.branch_id,
        entry_type: entry.entry_type,
        category: entry.category,
        description: entry.description || '',
        amount: entry.amount,
        receipt_url: entry.receipt_url || '',
        entry_date: entry.entry_date
      })
    } else {
      setFormData({
        branch_id: selectedBranch?.id || '',
        entry_type: 'expense',
        category: '',
        description: '',
        amount: 0,
        receipt_url: '',
        entry_date: new Date().toISOString().split('T')[0]
      })
    }
  }, [entry, selectedBranch])

  // Get available categories based on entry type
  const getAvailableCategories = () => {
    switch (formData.entry_type) {
      case 'expense':
        return expenseCategories
      case 'income':
        return incomeCategories
      case 'sale':
        return incomeCategories.filter(cat => cat.name.toLowerCase().includes('sale'))
      default:
        return []
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.branch_id || !formData.category || !formData.description || formData.amount <= 0) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      // TODO: Handle receipt upload if needed
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
    }
  }

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          {entry ? 'Edit Entry' : 'Add New Entry'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Entry Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entry_type" className="text-sm font-medium">Entry Type *</Label>
              <select
                id="entry_type"
                value={formData.entry_type}
                onChange={(e) => {
                  setFormData({ ...formData, entry_type: e.target.value as any, category: '' })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
                required
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="sale">Sale</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
                required
              >
                <option value="">Select Category</option>
                {getAvailableCategories().map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter detailed description..."
              className="mt-1"
              rows={3}
              required
            />
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount" className="text-sm font-medium">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="entry_date" className="text-sm font-medium">Date *</Label>
              <Input
                id="entry_date"
                type="date"
                value={formData.entry_date}
                onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                className="mt-1"
                required
              />
            </div>
          </div>

          {/* Branch (if not editing) */}
          {!entry && (
            <div>
              <Label htmlFor="branch" className="text-sm font-medium">Branch</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <Badge variant="secondary" className="text-sm">
                  {selectedBranch?.name || 'No branch selected'}
                </Badge>
              </div>
            </div>
          )}

          {/* Receipt Upload */}
          <div>
            <Label htmlFor="receipt" className="text-sm font-medium">Receipt (Optional)</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="receipt"
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="flex-1"
              />
              {receiptFile && (
                <Badge variant="outline" className="text-xs">
                  {receiptFile.name}
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : (entry ? 'Update Entry' : 'Add Entry')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
