import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, FileText } from "lucide-react"
import { ReportScheduleRow } from "./ReportScheduleRow"
import { useReportSchedules } from "../hooks/useReports"

export interface ReportSchedule {
  id: string
  name: string
  frequency: "daily" | "weekly" | "monthly" | "quarterly"
  format: "pdf" | "excel" | "csv"
  recipients: string
  isActive: boolean
}

export const ReportSchedulesTable = () => {
  const { schedules, loading, error, addSchedule, updateSchedule, deleteSchedule, toggleSchedule } = useReportSchedules()
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleEditSchedule = (id: string) => {
    setEditingId(editingId === id ? null : id)
  }

  const handleSaveSchedule = (id: string) => {
    setEditingId(null)
  }

  const handleScheduleChange = (id: string, field: string, value: any) => {
    updateSchedule(id, { [field]: value })
  }

  const handleAddSchedule = async () => {
    try {
      await addSchedule({
        name: "New Report Schedule",
        frequency: "daily",
        format: "pdf",
        recipients: [],
        is_active: true
      })
    } catch (error) {
      console.error('Failed to add schedule:', error)
    }
  }

  if (loading) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-600">Loading report schedules...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">Report Schedules</CardTitle>
          <Button 
            onClick={handleAddSchedule}
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {schedules.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No report schedules found</p>
              <p className="text-sm">Create your first schedule to get started</p>
            </div>
          ) : (
            schedules.map((schedule) => (
              <ReportScheduleRow
                key={schedule.id}
                name={schedule.name}
                frequency={schedule.frequency}
                format={schedule.format}
                recipients={Array.isArray(schedule.recipients) ? schedule.recipients.join(', ') : schedule.recipients}
                isActive={schedule.is_active}
                onChange={(field, value) => handleScheduleChange(schedule.id, field, value)}
                onSave={() => handleSaveSchedule(schedule.id)}
                onEdit={() => handleEditSchedule(schedule.id)}
                onDelete={() => deleteSchedule(schedule.id)}
                onToggleActive={() => toggleSchedule(schedule.id, !schedule.is_active)}
                isEditing={editingId === schedule.id}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 