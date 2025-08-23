'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Search,
  Calendar,
  Receipt,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react'
import { NexusHeader } from '@/components/layout/NexusHeader'
import { useCashflow } from './hooks/useCashflow'
import { useCurrency } from '@/hooks/useCurrency'
import { CashflowEntry, NewCashflowEntry } from './types/cashflow'
import { CashflowEntryForm } from './components/CashflowEntryForm'
import { CashflowTable } from './components/CashflowTable'

export default function CashflowPage() {
  const {
    entries,
    categories,
    expenseCategories,
    incomeCategories,
    loading,
    error,
    totalExpenses,
    totalIncome,
    totalSales,
    netAmount,
    createEntry,
    updateEntry,
    deleteEntry,
    refreshData
  } = useCashflow()

  const { formatCurrency, currencySymbol } = useCurrency()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<CashflowEntry | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'expense' | 'income' | 'sale' | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Filter entries based on search and filters
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.branch_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || entry.entry_type === selectedType
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory
    
    return matchesSearch && matchesType && matchesCategory
  })

  const handleAddEntry = async (entry: NewCashflowEntry) => {
    try {
      await createEntry(entry)
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding entry:', error)
      alert('Failed to add entry. Please try again.')
    }
  }

  const handleEditEntry = async (id: string, updates: Partial<NewCashflowEntry>) => {
    try {
      await updateEntry(id, updates)
      setEditingEntry(null)
    } catch (error) {
      console.error('Error updating entry:', error)
      alert('Failed to update entry. Please try again.')
    }
  }

  const handleDeleteEntry = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(id)
      } catch (error) {
        console.error('Error deleting entry:', error)
        alert('Failed to delete entry. Please try again.')
      }
    }
  }

  const handleExportCSV = () => {
    // Calculate totals
    const totalEntries = filteredEntries.length
    const totalExpensesAmount = filteredEntries.filter(e => e.entry_type === 'expense').reduce((sum, e) => sum + e.amount, 0)
    const totalIncomeAmount = filteredEntries.filter(e => e.entry_type === 'income').reduce((sum, e) => sum + e.amount, 0)
    const totalSalesAmount = filteredEntries.filter(e => e.entry_type === 'sale').reduce((sum, e) => sum + e.amount, 0)
    const netAmountTotal = totalIncomeAmount + totalSalesAmount - totalExpensesAmount

    // Prepare CSV content
    const csvRows = []

    // Add header
    csvRows.push([
      'Date',
      'Branch',
      'Type',
      'Category',
      'Description',
      `Amount (${currencySymbol})`,
      'Receipt',
      'Created Date'
    ])

    // Add entry rows
    filteredEntries.forEach(entry => {
      csvRows.push([
        entry.entry_date,
        entry.branch_name || '',
        entry.entry_type,
        entry.category,
        entry.description || '',
        entry.amount.toFixed(2),
        entry.receipt_url ? 'Yes' : 'No',
        new Date(entry.created_at).toLocaleDateString('en-US')
      ])
    })

    // Add totals row
    csvRows.push([
      'TOTALS',
      '',
      '',
      '',
      '',
      netAmountTotal.toFixed(2),
      '',
      ''
    ])

    // Convert to CSV string
    const csvContent = csvRows.map(row => 
      row.map(cell => {
        const escaped = String(cell).replace(/"/g, '""')
        if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
          return `"${escaped}"`
        }
        return escaped
      }).join(',')
    ).join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `cashflow-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="p-6">
        <NexusHeader 
          title="Cashflow Management"
          subtitle="Record daily expenses, income, and sales transactions"
          backUrl="/nexus"
        />
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
          <span className="text-lg">Loading cashflow data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <NexusHeader 
          title="Cashflow Management"
          subtitle="Record daily expenses, income, and sales transactions"
          backUrl="/nexus"
        />
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <NexusHeader 
        title="Cashflow Management"
        subtitle="Record daily expenses, income, and sales transactions"
        backUrl="/nexus"
      />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500 rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              All expense categories
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Service fees & other income
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              Product sales revenue
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Net Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold ${netAmount >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
              {formatCurrency(netAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Income + Sales - Expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
            <option value="sale">Sales</option>
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          
          <Button onClick={() => setShowAddForm(true)} className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
          
          <Button variant="outline" onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <CashflowEntryForm
          categories={categories}
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
          onSubmit={handleAddEntry}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Form */}
      {editingEntry && (
        <CashflowEntryForm
          categories={categories}
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
          entry={editingEntry}
          onSubmit={(updates) => handleEditEntry(editingEntry.id, updates)}
          onCancel={() => setEditingEntry(null)}
        />
      )}

      {/* Entries Table */}
      <CashflowTable
        entries={filteredEntries}
        onEdit={setEditingEntry}
        onDelete={handleDeleteEntry}
      />
    </div>
  )
}
