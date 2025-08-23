import React from 'react'
import { Clock, Copy } from 'lucide-react'

interface DayHours {
  open: string
  close: string
  closed: boolean
}

interface BusinessHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

interface BusinessHoursEditorProps {
  value: BusinessHours
  onChange: (hours: BusinessHours) => void
  disabled?: boolean
  className?: string
}

export const BusinessHoursEditor: React.FC<BusinessHoursEditorProps> = ({
  value,
  onChange,
  disabled = false,
  className
}) => {
  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ] as const

  const handleDayChange = (day: keyof BusinessHours, field: keyof DayHours, newValue: string | boolean) => {
    const updatedHours = {
      ...value,
      [day]: {
        ...value[day],
        [field]: newValue
      }
    }
    onChange(updatedHours)
  }

  const handleCopyHours = (fromDay: keyof BusinessHours, toDay: keyof BusinessHours) => {
    const updatedHours = {
      ...value,
      [toDay]: { ...value[fromDay] }
    }
    onChange(updatedHours)
  }

  const handleCopyToAll = (fromDay: keyof BusinessHours) => {
    const updatedHours = { ...value }
    days.forEach(({ key }) => {
      if (key !== fromDay) {
        updatedHours[key] = { ...value[fromDay] }
      }
    })
    onChange(updatedHours)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-blue-600" />
        <h4 className="text-sm font-medium text-gray-700">Operating Hours</h4>
      </div>
      
      {days.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-20 text-xs font-medium text-gray-700">{label}</div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value[key].closed}
              onChange={(e) => handleDayChange(key, 'closed', e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
            />
            <span className="text-xs text-gray-600">Closed</span>
          </div>
          
          {!value[key].closed && (
            <>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">Open:</span>
                <input
                  type="time"
                  value={value[key].open}
                  onChange={(e) => handleDayChange(key, 'open', e.target.value)}
                  disabled={disabled}
                  className="px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">Close:</span>
                <input
                  type="time"
                  value={value[key].close}
                  onChange={(e) => handleDayChange(key, 'close', e.target.value)}
                  disabled={disabled}
                  className="px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}
          
          <div className="flex gap-1 ml-auto">
            <button
              type="button"
              onClick={() => handleCopyToAll(key)}
              disabled={disabled}
              className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              title={`Copy ${label} hours to all days`}
            >
              <Copy className="h-3 w-3" />
            </button>
            
            {days.map(({ key: otherKey, label: otherLabel }) => (
              otherKey !== key && (
                <button
                  key={otherKey}
                  type="button"
                  onClick={() => handleCopyHours(otherKey, key)}
                  disabled={disabled}
                  className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  title={`Copy ${otherLabel} hours`}
                >
                  {otherLabel.slice(0, 3)}
                </button>
              )
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 