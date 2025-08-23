'use client'

import React, { useState } from 'react'
import { SettingsPageLayout } from '@/features/settings/components/SettingsPageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText,
  Download,
  Upload,
  Clock,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  Cloud,
  Zap,
  TrendingUp,
  Package,
  DollarSign,
  Save
} from 'lucide-react'
import { ReportSchedulesTable } from '@/features/reports/components/ReportSchedulesTable'
import { ReportsOverview } from '@/features/reports/components/ReportsOverview'
import { ExportSettingsForm } from '@/features/reports/components/ExportSettingsForm'
import { DataExportManager } from '@/features/reports/components/DataExportManager'
import { ReportTemplates } from '@/features/reports/components/ReportTemplates'
import { ReportsQuickActions } from '@/features/reports/components/ReportsQuickActions'

const ReportsExportSettings = () => {

  return (
    <SettingsPageLayout
      title="Reports & Export"
      description="Configure automated reports, export settings, and data management."
    >
      <div className="max-w-6xl mx-auto bg-white p-0">
        <div className="p-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white border-gray-200 hover:bg-gray-50">
                <BarChart3 className="h-4 w-4 mr-2" />
                Report Analytics
              </Button>
              <Button className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <ReportsOverview className="mb-8" />

          {/* Quick Actions */}
          <div className="mb-8">
            <ReportsQuickActions />
          </div>

          {/* Report Schedules */}
          <div className="mb-8">
            <ReportSchedulesTable />
          </div>

          {/* Export Settings */}
          <div className="mb-8">
            <ExportSettingsForm />
          </div>

          {/* Data Export Manager */}
          <div className="mb-8">
            <DataExportManager />
          </div>

          {/* Report Templates */}
          <div className="mb-8">
            <ReportTemplates />
          </div>
        </div>
      </div>
    </SettingsPageLayout>
  )
}

export default ReportsExportSettings 