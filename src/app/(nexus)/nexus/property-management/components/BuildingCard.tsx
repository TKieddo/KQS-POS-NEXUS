import React from 'react'
import { Building2, Users, CreditCard, AlertTriangle, Eye, Edit, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import type { Building } from '../types/property'

interface BuildingCardProps {
  building: Building
  onViewDetails: (buildingId: string) => void
  onEdit: (buildingId: string) => void
  onViewTenants: (buildingId: string) => void
  onViewPayments: (buildingId: string) => void
  onViewRooms: (buildingId: string) => void
}

const BuildingCard: React.FC<BuildingCardProps> = ({
  building,
  onViewDetails,
  onEdit,
  onViewTenants,
  onViewPayments,
  onViewRooms
}) => {
  const occupancyRate = (building.occupied_units / building.total_units) * 100
  const collectionRate = (building.collected_rent / building.total_rent) * 100

  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case 'apartment': return 'bg-blue-100 text-blue-800'
      case 'house': return 'bg-green-100 text-green-800'
      case 'commercial': return 'bg-purple-100 text-purple-800'
      case 'mixed': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {building.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              {building.address}
            </CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={getPropertyTypeColor(building.property_type)}>
                {building.property_type.charAt(0).toUpperCase() + building.property_type.slice(1)}
              </Badge>
              {building.year_built && (
                <Badge variant="secondary" className="text-xs">
                  Built {building.year_built}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(building.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(building.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Building
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewTenants(building.id)}>
                <Users className="h-4 w-4 mr-2" />
                View Tenants
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewPayments(building.id)}>
                <CreditCard className="h-4 w-4 mr-2" />
                View Payments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewRooms(building.id)}>
                <Building2 className="h-4 w-4 mr-2" />
                View Rooms
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Occupancy Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Occupancy Rate</span>
            <span className="font-medium">{occupancyRate.toFixed(1)}%</span>
          </div>
          <Progress value={occupancyRate} className="h-2" />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{building.occupied_units} occupied</span>
            <span>{building.total_units - building.occupied_units} vacant</span>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Monthly Rent</p>
            <p className="text-lg font-semibold text-gray-900">
              ${building.total_rent.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Collected</p>
            <p className="text-lg font-semibold text-green-600">
              ${building.collected_rent.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Collection Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Collection Rate</span>
            <span className="font-medium">{collectionRate.toFixed(1)}%</span>
          </div>
          <Progress value={collectionRate} className="h-2" />
        </div>

        {/* Alerts and Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {building.overdue_payments > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {building.overdue_payments} overdue
              </Badge>
            )}
            {building.overdue_payments === 0 && (
              <Badge variant="secondary" className="text-green-700 bg-green-100">
                All payments current
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(building.id)}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Details
            </Button>
            <Button
              size="sm"
              onClick={() => onViewPayments(building.id)}
              className="text-xs"
            >
              <CreditCard className="h-3 w-3 mr-1" />
              Payments
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <p className="text-xs text-gray-500">Units</p>
            <p className="text-sm font-medium">{building.total_units}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Occupied</p>
            <p className="text-sm font-medium text-green-600">{building.occupied_units}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Vacant</p>
            <p className="text-sm font-medium text-orange-600">
              {building.total_units - building.occupied_units}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BuildingCard
