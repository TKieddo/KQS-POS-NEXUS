'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  UserCheck,
  UserX,
  AlertTriangle,
  FileText,
  Download,
  Upload
} from 'lucide-react'
import { NexusHeader } from '@/components/layout/NexusHeader'
import { useEmployees, useDivisions } from './hooks/useEmployees'
import { EmployeeList } from './components/EmployeeList'
import { EmployeeForm } from './components/EmployeeForm'
import { DivisionForm } from './components/DivisionForm'
import { EmployeeStats } from './components/EmployeeStats'
import { EmployeeFilters } from './components/EmployeeFilters'
import { EmployeeImport } from './components/EmployeeImport'
import { EmployeeExport } from './components/EmployeeExport'
import type { Employee, Division, EmployeeFilters as EmployeeFiltersType } from './types/employee'

export default function EmployeesPage() {
  const {
    employees,
    divisions,
    loading,
    error,
    refreshData,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    createDivision,
    updateDivision,
    deleteDivision
  } = useEmployees()

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [showDivisionForm, setShowDivisionForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<EmployeeFiltersType>({
    division: '',
    status: '',
    employmentType: '',
    location: ''
  })

  // Filter and search employees
  const filteredEmployees = useMemo(() => {
    let filtered = employees

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(employee =>
        employee.firstName.toLowerCase().includes(term) ||
        employee.lastName.toLowerCase().includes(term) ||
        employee.employeeId.toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term) ||
        employee.phone.toLowerCase().includes(term)
      )
    }

    // Apply filters
    if (filters.division && filters.division !== 'all') {
      filtered = filtered.filter(employee => employee.divisionId === filters.division)
    }
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(employee => employee.status === filters.status)
    }
    if (filters.employmentType && filters.employmentType !== 'all') {
      filtered = filtered.filter(employee => employee.employmentType === filters.employmentType)
    }
    if (filters.location) {
      filtered = filtered.filter(employee => 
        (employee.address?.city && employee.address.city.toLowerCase().includes(filters.location.toLowerCase())) ||
        (employee.address?.country && employee.address.country.toLowerCase().includes(filters.location.toLowerCase()))
      )
    }

    return filtered
  }, [employees, searchTerm, filters])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = employees.length
    const active = employees.filter(e => e.status === 'active').length
    const inactive = employees.filter(e => e.status === 'inactive').length
    const onLeave = employees.filter(e => e.status === 'on_leave').length
    const terminated = employees.filter(e => e.status === 'terminated').length

    const byDivision = divisions.map(division => ({
      division,
      count: employees.filter(e => e.divisionId === division.id).length
    }))

    const byEmploymentType = [
      { type: 'full_time', label: 'Full Time', count: employees.filter(e => e.employmentType === 'full_time').length },
      { type: 'part_time', label: 'Part Time', count: employees.filter(e => e.employmentType === 'part_time').length },
      { type: 'contract', label: 'Contract', count: employees.filter(e => e.employmentType === 'contract').length },
      { type: 'temporary', label: 'Temporary', count: employees.filter(e => e.employmentType === 'temporary').length }
    ]

    return {
      total,
      active,
      inactive,
      onLeave,
      terminated,
      byDivision,
      byEmploymentType
    }
  }, [employees, divisions])

  const handleCreateEmployee = () => {
    setSelectedEmployee(null)
    setShowEmployeeForm(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowEmployeeForm(true)
  }

  const handleCreateDivision = () => {
    setSelectedDivision(null)
    setShowDivisionForm(true)
  }

  const handleEditDivision = (division: Division) => {
    setSelectedDivision(division)
    setShowDivisionForm(true)
  }

  const handleEmployeeSubmit = async (employeeData: Partial<Employee>) => {
    try {
      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.id, employeeData)
      } else {
        await createEmployee(employeeData as Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>)
      }
      setShowEmployeeForm(false)
      setSelectedEmployee(null)
    } catch (error) {
      console.error('Error saving employee:', error)
    }
  }

  const handleDivisionSubmit = async (divisionData: Partial<Division>) => {
    try {
      if (selectedDivision) {
        await updateDivision(selectedDivision.id, divisionData)
      } else {
        await createDivision(divisionData as Omit<Division, 'id' | 'createdAt' | 'updatedAt'>)
      }
      setShowDivisionForm(false)
      setSelectedDivision(null)
    } catch (error) {
      console.error('Error saving division:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <NexusHeader 
          title="Employee Management"
          subtitle="Manage KQS employees across all divisions"
          backUrl="/nexus"
        />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-lg">Loading employee data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <NexusHeader 
          title="Employee Management"
          subtitle="Manage KQS employees across all divisions"
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
        title="Employee Management"
        subtitle="Manage KQS employees across all divisions"
        backUrl="/nexus"
      />

      {/* Statistics */}
      <EmployeeStats stats={stats} />

      {/* Actions and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search employees by name, ID, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <EmployeeFilters 
            filters={filters}
            divisions={divisions}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={() => setShowExport(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleCreateDivision}>
            <Building2 className="h-4 w-4 mr-2" />
            Add Division
          </Button>
          
          <Button onClick={handleCreateEmployee}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-600" />
          <span className="text-sm text-gray-600">
            Showing {filteredEmployees.length} of {employees.length} employees
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {stats.active} Active
          </Badge>
          <Badge variant="outline" className="text-xs">
            {stats.onLeave} On Leave
          </Badge>
          <Badge variant="outline" className="text-xs">
            {stats.terminated} Terminated
          </Badge>
        </div>
      </div>

      {/* Employee List */}
      <EmployeeList
        employees={filteredEmployees}
        divisions={divisions}
        onEdit={handleEditEmployee}
        onDelete={deleteEmployee}
        onRefresh={refreshData}
      />

      {/* Modals */}
      {showEmployeeForm && (
        <EmployeeForm
          employee={selectedEmployee}
          divisions={divisions}
          onSubmit={handleEmployeeSubmit}
          onCancel={() => {
            setShowEmployeeForm(false)
            setSelectedEmployee(null)
          }}
        />
      )}

      {showDivisionForm && (
        <DivisionForm
          division={selectedDivision}
          onSubmit={handleDivisionSubmit}
          onCancel={() => {
            setShowDivisionForm(false)
            setSelectedDivision(null)
          }}
        />
      )}

      {showImport && (
        <EmployeeImport
          onImport={refreshData}
          onCancel={() => setShowImport(false)}
        />
      )}

      {showExport && (
        <EmployeeExport
          employees={filteredEmployees}
          divisions={divisions}
          onCancel={() => setShowExport(false)}
        />
      )}
    </div>
  )
}



