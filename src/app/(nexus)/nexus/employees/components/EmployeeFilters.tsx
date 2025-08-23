import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Filter,
  X,
  Building2,
  UserCheck,
  Briefcase,
  MapPin
} from 'lucide-react'
import type { Division, EmployeeFilters as EmployeeFiltersType } from '../types/employee'
import { EMPLOYMENT_TYPES, EMPLOYEE_STATUSES } from '../types/employee'

interface EmployeeFiltersProps {
  filters: EmployeeFiltersType
  divisions: Division[]
  onFiltersChange: (filters: EmployeeFiltersType) => void
}

export function EmployeeFilters({ filters, divisions, onFiltersChange }: EmployeeFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all')

  const clearFilters = () => {
    onFiltersChange({
      division: 'all',
      status: 'all',
      employmentType: 'all',
      location: ''
    })
  }

  const updateFilter = (key: keyof EmployeeFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '' && value !== 'all').length
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Division Filter */}
      <Select value={filters.division} onValueChange={(value) => updateFilter('division', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Divisions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Divisions</SelectItem>
          {divisions.map((division) => (
            <SelectItem key={division.id} value={division.id}>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {division.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {EMPLOYEE_STATUSES.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                {status.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Employment Type Filter */}
      <Select value={filters.employmentType} onValueChange={(value) => updateFilter('employmentType', value)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {EMPLOYMENT_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {type.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Location Filter */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Location..."
          value={filters.location}
          onChange={(e) => updateFilter('location', e.target.value)}
          className="pl-10 w-[150px]"
        />
      </div>

      {/* Filter Actions */}
      <div className="flex gap-2">
        {hasActiveFilters && (
          <>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              {getActiveFiltersCount()} active
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
