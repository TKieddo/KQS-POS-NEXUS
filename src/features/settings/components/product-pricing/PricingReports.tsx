import React, { useState } from 'react'
import { FileText, Download, Calendar, BarChart3, TrendingUp, DollarSign } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import type { PricingReport } from '@/lib/product-pricing-complete-service'

interface PricingReportsProps {
  reports: PricingReport[]
  overview: {
    rulesCount: number
    activeRulesCount: number
    analysisCount: number
    reportsCount: number
  }
  onGenerateReport: (reportType: string, startDate: string, endDate: string, reportName: string) => Promise<string | null>
  isLoading: boolean
}

export const PricingReports: React.FC<PricingReportsProps> = ({
  reports,
  overview,
  onGenerateReport,
  isLoading
}) => {
  const [selectedReportType, setSelectedReportType] = useState<'profitability' | 'competitiveness' | 'trends' | 'optimization'>('profitability')
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [reportName, setReportName] = useState('')

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'profitability': return <DollarSign className="h-4 w-4" />
      case 'competitiveness': return <TrendingUp className="h-4 w-4" />
      case 'trends': return <BarChart3 className="h-4 w-4" />
      case 'optimization': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'generating': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleGenerateReport = async () => {
    if (!reportName.trim()) {
      alert('Please enter a report name')
      return
    }

    try {
      const reportId = await onGenerateReport(
        selectedReportType,
        startDate,
        endDate,
        reportName
      )

      if (reportId) {
        alert('Report generation started successfully!')
        setReportName('')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pricing Reports</h3>
          <p className="text-sm text-gray-600">Generate comprehensive pricing reports</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{overview.reportsCount}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <Download className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Generating</p>
              <p className="text-2xl font-bold text-yellow-600">
                {reports.filter(r => r.status === 'generating').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {reports.filter(r => r.status === 'failed').length}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Generate New Report */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Generate New Report</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value as any)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="profitability">Profitability Analysis</option>
              <option value="competitiveness">Competitive Analysis</option>
              <option value="trends">Price Trends</option>
              <option value="optimization">Optimization Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g., Q1 Profitability Report"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <PremiumButton
            gradient="purple"
            onClick={handleGenerateReport}
            disabled={isLoading || !reportName.trim()}
          >
            {isLoading ? 'Generating...' : 'Generate Report'}
          </PremiumButton>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Recent Reports</h4>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No reports found.</p>
            <p className="text-xs mt-1">Generate your first pricing report to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.slice(0, 10).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getReportIcon(report.report_type)}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{report.report_name}</h5>
                    <p className="text-sm text-gray-600">
                      {formatDate(report.date_range_start)} - {formatDate(report.date_range_end)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                  
                  {report.file_size && (
                    <span className="text-sm text-gray-500">
                      {formatFileSize(report.file_size)}
                    </span>
                  )}
                  
                  {report.status === 'completed' && (
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      icon={Download}
                    >
                      Download
                    </PremiumButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 