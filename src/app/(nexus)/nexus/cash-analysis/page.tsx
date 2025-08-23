'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react'
import { NexusHeader } from '@/components/layout/NexusHeader'
import { useCashflow } from '../cashflow/hooks/useCashflow'
import { useCurrency } from '@/hooks/useCurrency'
import { TimePeriodFilter } from './components/TimePeriodFilter'
import { ViewTypeFilter } from './components/ViewTypeFilter'
import { OverviewView } from './components/OverviewView'
import { DetailedView } from './components/DetailedView'
import { ComparisonView } from './components/ComparisonView'
import { TrendsView } from './components/TrendsView'
import { 
  getDateRangeForPeriod, 
  filterEntriesByDateRange, 
  filterDailySummariesByDateRange,
  calculateFilteredStats,
  DateRange,
  TimePeriod
} from './utils/dataFilters'

export type ViewType = 'overview' | 'detailed' | 'comparison' | 'trends'

export default function CashAnalysisPage() {
  const {
    entries,
    dailySummaries,
    monthlySummary,
    stats,
    loading,
    error,
    refreshData
  } = useCashflow()

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6months')
  const [selectedView, setSelectedView] = useState<ViewType>('overview')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const { formatCurrency } = useCurrency()

  // Get date ranges for comparison
  const currentRange = getDateRangeForPeriod(selectedPeriod, customStartDate, customEndDate)
  const previousRange = getPreviousRange(currentRange, selectedPeriod)

  // Calculate filtered data using useMemo to prevent infinite loops
  const filteredData = useMemo(() => {
    const filteredEntries = filterEntriesByDateRange(entries, currentRange)
    const filteredDailySummaries = filterDailySummariesByDateRange(dailySummaries, currentRange)
    const calculatedStats = calculateFilteredStats(filteredEntries)
    
    return {
      entries: filteredEntries,
      dailySummaries: filteredDailySummaries,
      stats: calculatedStats
    }
  }, [entries, dailySummaries, currentRange])

  const formatPercentage = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return '0.0%'
    return `${value.toFixed(1)}%`
  }

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period)
    if (period !== 'custom') {
      setCustomStartDate('')
      setCustomEndDate('')
    }
  }

  const handleCustomDateChange = (startDate: string, endDate: string) => {
    setCustomStartDate(startDate)
    setCustomEndDate(endDate)
  }

  const handleExportReport = () => {
    // Create comprehensive CSV report
    const csvRows = []

    // Summary section
    csvRows.push(['CASH ANALYSIS REPORT'])
    csvRows.push(['Generated:', new Date().toLocaleDateString('en-US')])
    csvRows.push(['Period:', selectedPeriod])
    csvRows.push(['View:', selectedView])
    csvRows.push([])
    csvRows.push(['SUMMARY'])
    csvRows.push(['Total Income', formatCurrency(filteredData.stats?.totalIncome || 0)])
    csvRows.push(['Total Expenses', formatCurrency(filteredData.stats?.totalExpenses || 0)])
    csvRows.push(['Total Sales', formatCurrency(filteredData.stats?.totalSales || 0)])
    csvRows.push(['Net Amount', formatCurrency(filteredData.stats?.netAmount || 0)])
    csvRows.push(['Profit Margin', formatPercentage(filteredData.stats?.profitMargin || 0)])
    csvRows.push([])

    // Top categories section
    csvRows.push(['TOP EXPENSE CATEGORIES'])
    if (filteredData.stats?.topExpenseCategories) {
      filteredData.stats.topExpenseCategories.forEach((cat: any) => {
        csvRows.push([cat.category, formatCurrency(cat.amount), formatPercentage((cat.amount / filteredData.stats.totalExpenses) * 100)])
      })
    }
    csvRows.push([])

    csvRows.push(['TOP INCOME CATEGORIES'])
    if (filteredData.stats?.topIncomeCategories) {
      filteredData.stats.topIncomeCategories.forEach((cat: any) => {
        csvRows.push([cat.category, formatCurrency(cat.amount), formatPercentage((cat.amount / (filteredData.stats.totalIncome + filteredData.stats.totalSales)) * 100)])
      })
    }
    csvRows.push([])

    // Recent transactions
    csvRows.push(['RECENT TRANSACTIONS'])
    csvRows.push(['Date', 'Type', 'Category', 'Description', 'Amount'])
    filteredData.entries.slice(0, 20).forEach(transaction => {
      csvRows.push([
        transaction.entry_date,
        transaction.entry_type,
        transaction.category,
        transaction.description || '',
        formatCurrency(transaction.amount)
      ])
    })

    // Convert to CSV and download
    const csvContent = csvRows.map(row => 
      row.map(cell => {
        const escaped = String(cell).replace(/"/g, '""')
        if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
          return `"${escaped}"`
        }
        return escaped
      }).join(',')
    ).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `cash-analysis-${selectedPeriod}-${selectedView}-${new Date().toISOString().split('T')[0]}.csv`)
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
          title="Cash Analysis"
          subtitle="Comprehensive financial overview and reporting"
          backUrl="/nexus"
        />
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
          <span className="text-lg">Loading cash analysis data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <NexusHeader 
          title="Cash Analysis"
          subtitle="Comprehensive financial overview and reporting"
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
        title="Cash Analysis"
        subtitle="Comprehensive financial overview and reporting"
        backUrl="/nexus"
      />
      
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <TimePeriodFilter
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onCustomDateChange={handleCustomDateChange}
          />
          
          <ViewTypeFilter
            selectedView={selectedView}
            onViewChange={setSelectedView}
          />
        </div>
        
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={handleExportReport}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Period Info */}
      {currentRange.startDate && currentRange.endDate && (
        <Card className="rounded-3xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                Analysis Period: {currentRange.startDate.toLocaleDateString('en-US')} - {currentRange.endDate.toLocaleDateString('en-US')}
              </span>
              <Badge variant="outline" className="text-xs">
                {filteredData.entries.length} transactions
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Render appropriate view based on selection */}
      {selectedView === 'overview' && (
        <OverviewView
          entries={filteredData.entries}
          dailySummaries={filteredData.dailySummaries}
          stats={filteredData.stats}
        />
      )}

      {selectedView === 'detailed' && (
        <DetailedView
          entries={filteredData.entries}
          dailySummaries={filteredData.dailySummaries}
          stats={filteredData.stats}
        />
      )}

      {selectedView === 'comparison' && (
        <ComparisonView
          entries={entries} // Use all entries for comparison
          currentRange={currentRange}
          previousRange={previousRange}
        />
      )}

      {selectedView === 'trends' && (
        <TrendsView
          entries={filteredData.entries}
        />
      )}
    </div>
  )
}

// Helper function to get previous period range for comparison
function getPreviousRange(currentRange: DateRange, period: TimePeriod): DateRange {
  const duration = currentRange.endDate.getTime() - currentRange.startDate.getTime()
  const previousEnd = new Date(currentRange.startDate.getTime())
  const previousStart = new Date(previousEnd.getTime() - duration)
  
  return {
    startDate: previousStart,
    endDate: previousEnd
  }
}
