'use client'

import React, { useState } from 'react'
import { 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Settings,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CashDrawerStatus {
  isConnected: boolean
  isOpen: boolean
  lastOpened: string | null
  openedBy: string | null
  totalOpens: number
  drawerNumber: string
}

interface CashDrawerControlProps {
  onDrawerOpen: () => void
  onDrawerClose: () => void
}

export const CashDrawerControl: React.FC<CashDrawerControlProps> = ({
  onDrawerOpen,
  onDrawerClose
}) => {
  const [drawerStatus, setDrawerStatus] = useState<CashDrawerStatus>({
    isConnected: true,
    isOpen: false,
    lastOpened: '2024-01-15 14:30:25',
    openedBy: 'John Doe',
    totalOpens: 47,
    drawerNumber: 'DRAWER-001'
  })
  
  const [loading, setLoading] = useState(false)
  const [openReason, setOpenReason] = useState('General')
  const [showSettings, setShowSettings] = useState(false)

  const openReasons = [
    'General',
    'Cash Sale',
    'Cash Drop',
    'Cash Withdrawal',
    'End of Day',
    'Manual Count',
    'Other'
  ]

  // Add frequent default option
  const frequentReasons = [
    'General',
    'Cash Sale',
    'Cash Drop',
    'End of Day'
  ]

  const handleOpenDrawer = async () => {
    if (!openReason) {
      alert('Please select a reason for opening the drawer')
      return
    }

    setLoading(true)
    
    try {
      // Mock API call to open drawer
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setDrawerStatus(prev => ({
        ...prev,
        isOpen: true,
        lastOpened: new Date().toLocaleString(),
        openedBy: 'Current User',
        totalOpens: prev.totalOpens + 1
      }))
      
      onDrawerOpen()
      
      // Auto-close after 5 seconds (simulating drawer close)
      setTimeout(() => {
        setDrawerStatus(prev => ({
          ...prev,
          isOpen: false
        }))
        onDrawerClose()
      }, 5000)
      
    } catch (error) {
      console.error('Failed to open drawer:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = () => {
    if (!drawerStatus.isConnected) return 'bg-red-100 text-red-800'
    if (drawerStatus.isOpen) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = () => {
    if (!drawerStatus.isConnected) return 'Disconnected'
    if (drawerStatus.isOpen) return 'Open'
    return 'Closed'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cash Drawer Control</h1>
          <p className="text-gray-600">Manage electronic cash drawer operations</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Main Control Card */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                drawerStatus.isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>Drawer #{drawerStatus.drawerNumber}</span>
            </div>
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {drawerStatus.totalOpens}
              </div>
              <div className="text-sm text-gray-600">Total Opens</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Last Opened</div>
              <div className="text-sm font-medium text-gray-900">
                {drawerStatus.lastOpened || 'Never'}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Opened By</div>
              <div className="text-sm font-medium text-gray-900">
                {drawerStatus.openedBy || 'N/A'}
              </div>
            </div>
          </div>

          {/* Open Drawer Controls */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Open Cash Drawer
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Opening *
                </label>
                <Select value={openReason} onValueChange={setOpenReason}>
                  <SelectTrigger className="bg-gray-100 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-100 border border-gray-300 shadow-lg">
                    {/* Frequent Options */}
                    <div className="px-2 py-1.5">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Frequent Options
                      </div>
                      {frequentReasons.map((reason) => (
                        <SelectItem 
                          key={reason} 
                          value={reason}
                          className="bg-white hover:bg-blue-50 focus:bg-blue-50 rounded-md mb-1"
                        >
                          {reason}
                        </SelectItem>
                      ))}
                    </div>
                    
                    {/* Divider */}
                    <div className="border-t border-gray-300 my-2"></div>
                    
                    {/* All Options */}
                    <div className="px-2 py-1.5">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        All Options
                      </div>
                      {openReasons.map((reason) => (
                        <SelectItem 
                          key={reason} 
                          value={reason}
                          className="bg-white hover:bg-blue-50 focus:bg-blue-50 rounded-md mb-1"
                        >
                          {reason}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleOpenDrawer}
                  disabled={loading || drawerStatus.isOpen || !drawerStatus.isConnected || !openReason}
                  className="bg-black text-[#E5FF29] hover:bg-gray-900 border border-[#E5FF29] hover:border-[#E5FF29]/80"
                  size="lg"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Unlock className="h-5 w-5 mr-2" />
                  )}
                  Open Cash Drawer
                </Button>

                {drawerStatus.isOpen && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <Activity className="h-4 w-4 animate-pulse" />
                    <span className="text-sm font-medium">Drawer is currently open</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Security Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Only authorized personnel should open the cash drawer. All drawer operations are logged for security purposes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Drawer Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drawer Number
                </label>
                <Input 
                  value={drawerStatus.drawerNumber}
                  onChange={(e) => setDrawerStatus(prev => ({
                    ...prev,
                    drawerNumber: e.target.value
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-close Delay (seconds)
                </label>
                <Input 
                  type="number"
                  defaultValue="5"
                  min="1"
                  max="30"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Test Connection
              </Button>
              <Button variant="outline" size="sm">
                Reset Counter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Unlock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Drawer Opened</p>
                  <p className="text-sm text-gray-600">Cash Sale - John Doe</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">2 min ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Lock className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Drawer Closed</p>
                  <p className="text-sm text-gray-600">Auto-closed after 5 seconds</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">2 min ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Unlock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Drawer Opened</p>
                  <p className="text-sm text-gray-600">Cash Drop - Jane Smith</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">15 min ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 