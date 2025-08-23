import { useState } from 'react'
import { MapPin, ChevronDown, Building2, Package, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Location {
  id: string
  name: string
  address: string
  type: 'main' | 'branch' | 'warehouse'
  totalItems: number
  lowStockItems: number
  outOfStockItems: number
}

interface LocationSelectorProps {
  locations: Location[]
  selectedLocation: Location
  onLocationChange: (location: Location) => void
  onAddLocation: () => void
}

export const LocationSelector = ({
  locations,
  selectedLocation,
  onLocationChange,
  onAddLocation
}: LocationSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const getLocationIcon = (type: Location['type']) => {
    switch (type) {
      case 'main':
        return <Building2 className="h-5 w-5 text-blue-600" />
      case 'branch':
        return <MapPin className="h-5 w-5 text-green-600" />
      case 'warehouse':
        return <Building2 className="h-5 w-5 text-orange-600" />
      default:
        return <MapPin className="h-5 w-5 text-gray-600" />
    }
  }

  const getLocationTypeLabel = (type: Location['type']) => {
    switch (type) {
      case 'main':
        return 'Main Store'
      case 'branch':
        return 'Branch'
      case 'warehouse':
        return 'Warehouse'
      default:
        return 'Location'
    }
  }

  return (
    <div className="relative">
      <Card className="rounded-2xl p-6 shadow-lg bg-gradient-to-br from-white to-gray-50/50 border border-gray-100/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {/* Location Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/30">
              {getLocationIcon(selectedLocation.type)}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">{selectedLocation.name}</h3>
              <p className="text-sm text-gray-600 font-medium">{selectedLocation.address}</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200/50">
                {getLocationTypeLabel(selectedLocation.type)}
              </span>
            </div>
          </div>
          
          {/* Premium Stats Section */}
          <div className="flex items-center gap-8">
            {/* Total Items */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/30">
                <Package className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">{selectedLocation.totalItems.toLocaleString()}</p>
              </div>
            </div>

            {/* Low Stock */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/30">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock</p>
                <p className="text-2xl font-bold text-amber-600 tracking-tight">{selectedLocation.lowStockItems}</p>
              </div>
            </div>

            {/* Out of Stock */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/30">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600 tracking-tight">{selectedLocation.outOfStockItems}</p>
              </div>
            </div>
            
            {/* Dropdown Button */}
            <Button
              variant="outline"
              onClick={() => setIsOpen(!isOpen)}
              className="bg-white/80 backdrop-blur-sm text-gray-700 border-gray-200/50 hover:bg-white hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Location Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between p-3 border-b border-gray-100/50">
                <h4 className="font-bold text-gray-900 text-lg">Select Location</h4>
                <Button
                  size="sm"
                  onClick={onAddLocation}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md transition-all duration-200"
                >
                  Add Location
                </Button>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2 mt-3">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    onClick={() => {
                      onLocationChange(location)
                      setIsOpen(false)
                    }}
                    className={`p-4 cursor-pointer rounded-xl transition-all duration-200 border ${
                      selectedLocation.id === location.id
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200/50 shadow-sm'
                        : 'hover:bg-gray-50/80 border-transparent hover:border-gray-200/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/30">
                          {getLocationIcon(location.type)}
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900">{location.name}</p>
                          <p className="text-sm text-gray-600">{location.address}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {getLocationTypeLabel(location.type)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-gray-500 font-medium">{location.totalItems}</p>
                            <p className="text-xs text-gray-400">items</p>
                          </div>
                          <div className="text-center">
                            <p className="text-amber-600 font-semibold">{location.lowStockItems}</p>
                            <p className="text-xs text-gray-400">low</p>
                          </div>
                          <div className="text-center">
                            <p className="text-red-600 font-semibold">{location.outOfStockItems}</p>
                            <p className="text-xs text-gray-400">out</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
} 