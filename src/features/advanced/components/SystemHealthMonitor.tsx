import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Activity, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Wifi, 
  Database,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react"

export interface SystemMetric {
  name: string
  value: number
  max: number
  unit: string
  status: "healthy" | "warning" | "critical"
  icon: React.ReactNode
}

export interface SystemHealthMonitorProps {
  metrics: SystemMetric[]
  lastUpdated: string
}

export const SystemHealthMonitor = ({
  metrics,
  lastUpdated
}: SystemHealthMonitorProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-600"
      case "warning": return "text-yellow-600"
      case "critical": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning": return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "critical": return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-500"
      case "warning": return "bg-yellow-500"
      case "critical": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">System Health</CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="h-4 w-4" />
            Last updated: {lastUpdated}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div key={metric.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <span className="font-medium text-gray-900">{metric.name}</span>
                </div>
                {getStatusIcon(metric.status)}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {metric.value} {metric.unit}
                  </span>
                  <span className="text-gray-500">
                    / {metric.max} {metric.unit}
                  </span>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={(metric.value / metric.max) * 100} 
                    className="h-2"
                  />
                  <div 
                    className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor(metric.status)}`}
                    style={{ width: `${(metric.value / metric.max) * 100}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className={`font-medium ${getStatusColor(metric.status)}`}>
                    {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                  </span>
                  <span className="text-gray-500">
                    {Math.round((metric.value / metric.max) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 