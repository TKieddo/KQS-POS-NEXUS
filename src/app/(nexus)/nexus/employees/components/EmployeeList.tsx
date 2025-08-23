import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  UserCheck,
  UserX,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import type { Employee, Division } from '../types/employee'
import { EMPLOYEE_STATUSES, EMPLOYMENT_TYPES } from '../types/employee'

interface EmployeeListProps {
  employees: Employee[]
  divisions: Division[]
  onEdit: (employee: Employee) => void
  onDelete: (id: string) => Promise<void>
  onRefresh: () => void
}

export function EmployeeList({ employees, divisions, onEdit, onDelete, onRefresh }: EmployeeListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const getDivisionName = (divisionId: string | null | undefined) => {
    if (!divisionId) return 'No Division'
    const division = divisions.find(d => d.id === divisionId)
    return division?.name || 'Unknown Division'
  }

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return null
    const statusConfig = EMPLOYEE_STATUSES.find(s => s.value === status)
    if (!statusConfig) return null

    const colorMap: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      on_leave: 'bg-yellow-100 text-yellow-800',
      terminated: 'bg-red-100 text-red-800',
      suspended: 'bg-orange-100 text-orange-800'
    }

    return (
      <Badge className={colorMap[status] || 'bg-gray-100 text-gray-800'}>
        {statusConfig.label}
      </Badge>
    )
  }

  const getEmploymentTypeLabel = (type: string | null | undefined) => {
    if (!type) return 'N/A'
    const typeConfig = EMPLOYMENT_TYPES.find(t => t.value === type)
    return typeConfig?.label || type
  }

  const getStatusIcon = (status: string | null | undefined) => {
    if (!status) return <UserCheck className="h-4 w-4 text-gray-600" />
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-600" />
      case 'on_leave':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'terminated':
        return <UserX className="h-4 w-4 text-red-600" />
      case 'suspended':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default:
        return <UserCheck className="h-4 w-4 text-gray-600" />
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      setDeletingId(id)
      try {
        await onDelete(id)
      } catch (error) {
        console.error('Error deleting employee:', error)
      } finally {
        setDeletingId(null)
      }
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const formatCurrency = (amount: number | null | undefined, currency: string | null | undefined) => {
    const safeAmount = amount || 0
    const safeCurrency = currency || 'ZAR'
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: safeCurrency
    }).format(safeAmount)
  }

  if (employees.length === 0) {
    return (
      <Card className="border-2 border-gray-200 rounded-2xl">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <UserCheck className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filter criteria to find employees
          </p>
          <Button onClick={onRefresh} variant="outline">
            Refresh Data
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-gray-200 rounded-2xl shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-gray-600" />
          Employee Directory
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Employee</TableHead>
                <TableHead className="font-semibold">Division</TableHead>
                <TableHead className="font-semibold">Position</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Employment</TableHead>
                <TableHead className="font-semibold">Salary</TableHead>
                <TableHead className="font-semibold">Hire Date</TableHead>
                <TableHead className="font-semibold w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                         {(employee.firstName?.charAt(0) || '')}{(employee.lastName?.charAt(0) || '')}
                       </div>
                      <div>
                                                 <div className="font-medium text-gray-900">
                           {employee.firstName || 'N/A'} {employee.lastName || 'N/A'}
                         </div>
                         <div className="text-sm text-gray-500">
                           ID: {employee.employeeId || 'N/A'}
                         </div>
                         <div className="text-sm text-gray-500 flex items-center gap-1">
                           <Mail className="h-3 w-3" />
                           {employee.email || 'N/A'}
                         </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <div>
                                                 <div className="font-medium text-gray-900">
                           {getDivisionName(employee.divisionId || '')}
                         </div>
                                                 <div className="text-sm text-gray-500 flex items-center gap-1">
                           <MapPin className="h-3 w-3" />
                           {employee.address?.city || 'N/A'}, {employee.address?.country || 'N/A'}
                         </div>
                      </div>
                    </div>
                  </TableCell>
                  
                                     <TableCell>
                     <div className="font-medium text-gray-900">{employee.position || 'N/A'}</div>
                     <div className="text-sm text-gray-500">
                       {getEmploymentTypeLabel(employee.employmentType || '')}
                     </div>
                   </TableCell>
                  
                                     <TableCell>
                     <div className="flex items-center gap-2">
                       {getStatusIcon(employee.status || '')}
                       {getStatusBadge(employee.status || '')}
                     </div>
                   </TableCell>
                  
                  <TableCell>
                                         <div className="space-y-1">
                       <div className="flex items-center gap-1 text-sm">
                         <Phone className="h-3 w-3 text-gray-500" />
                         {employee.phone || 'N/A'}
                       </div>
                       {employee.mobile && (
                         <div className="flex items-center gap-1 text-sm text-gray-500">
                           <Phone className="h-3 w-3" />
                           {employee.mobile}
                         </div>
                       )}
                     </div>
                  </TableCell>
                  
                                     <TableCell>
                     <div className="space-y-1">
                       <div className="text-sm font-medium text-gray-900">
                         {getEmploymentTypeLabel(employee.employmentType || '')}
                       </div>
                       <div className="text-sm text-gray-500">
                         {employee.currency || 'ZAR'} • {(employee.paymentMethod || '').replace('_', ' ')}
                       </div>
                     </div>
                   </TableCell>
                  
                                     <TableCell>
                     <div className="font-medium text-gray-900">
                       {formatCurrency(employee.salary || 0, employee.currency || 'ZAR')}
                     </div>
                     <div className="text-sm text-gray-500">
                       per month
                     </div>
                   </TableCell>
                  
                                     <TableCell>
                     <div className="flex items-center gap-1 text-sm">
                       <Calendar className="h-3 w-3 text-gray-500" />
                       {employee.hireDate ? formatDate(employee.hireDate) : 'N/A'}
                     </div>
                     {employee.probationEndDate && (
                       <div className="text-xs text-gray-500">
                         Probation: {formatDate(employee.probationEndDate)}
                       </div>
                     )}
                   </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(employee)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Employee
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(employee.id)}
                          disabled={deletingId === employee.id}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deletingId === employee.id ? 'Deleting...' : 'Delete Employee'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
