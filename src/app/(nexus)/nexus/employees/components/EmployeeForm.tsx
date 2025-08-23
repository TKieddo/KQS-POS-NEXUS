import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Save,
  X
} from 'lucide-react'
import type { Employee, Division } from '../types/employee'
import { 
  EMPLOYMENT_TYPES, 
  EMPLOYEE_STATUSES, 
  GENDER_OPTIONS, 
  PAYMENT_METHODS, 
  CURRENCIES 
} from '../types/employee'

interface EmployeeFormProps {
  employee?: Employee | null
  divisions: Division[]
  onSubmit: (data: Partial<Employee>) => Promise<void>
  onCancel: () => void
}

export function EmployeeForm({ employee, divisions, onSubmit, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    nationality: '',
    idNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    } as {
      street?: string
      city?: string
      state?: string
      postalCode?: string
      country?: string
    },
    divisionId: '',
    position: '',
    employmentType: 'full_time' as 'full_time' | 'part_time' | 'contract' | 'temporary' | 'internship',
    status: 'active' as 'active' | 'inactive' | 'on_leave' | 'terminated' | 'suspended',
    hireDate: '',
    salary: 0,
    currency: 'LSL' as string,
    paymentMethod: 'bank_transfer' as 'bank_transfer' | 'cash' | 'check'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-generate employee ID
  const generateEmployeeId = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `EMP${timestamp}${random}`
  }

  useEffect(() => {
    if (employee) {
      setFormData({
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        dateOfBirth: employee.dateOfBirth,
        gender: employee.gender,
        nationality: employee.nationality,
        idNumber: employee.idNumber,
        address: employee.address || {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
        divisionId: employee.divisionId,
        position: employee.position,
        employmentType: employee.employmentType,
        status: employee.status,
        hireDate: employee.hireDate,
        salary: employee.salary,
        currency: employee.currency,
        paymentMethod: employee.paymentMethod
      })
    } else {
      // Auto-generate employee ID for new employees
      setFormData(prev => ({
        ...prev,
        employeeId: generateEmployeeId()
      }))
    }
  }, [employee])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required'
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.divisionId) newErrors.divisionId = 'Division is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error saving employee:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address || {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
        [field]: value
      }
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-7xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Main Content - Horizontal Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            
                                     {/* Column 1: Basic Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  placeholder="Auto-generated"
                  className={errors.employeeId ? 'border-red-500' : ''}
                  readOnly={!employee} // Read-only for new employees
                />
                {errors.employeeId && <p className="text-xs text-red-600">{errors.employeeId}</p>}
                {!employee && <p className="text-xs text-gray-500">Auto-generated ID</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="First name"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && <p className="text-xs text-red-600">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Last name"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && <p className="text-xs text-red-600">{errors.lastName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+266 82 123 4567"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  placeholder="ID number"
                />
              </div>
            </div>

            {/* Column 2: Employment & Address */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Employment & Address</h3>
              
              <div className="space-y-2">
                <Label htmlFor="divisionId">Division *</Label>
                <Select value={formData.divisionId} onValueChange={(value) => handleInputChange('divisionId', value)}>
                  <SelectTrigger className={errors.divisionId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((division) => (
                      <SelectItem key={division.id} value={division.id}>
                        {division.name} ({division.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.divisionId && <p className="text-xs text-red-600">{errors.divisionId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="e.g., Manager, Cashier"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select value={formData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.address?.street || ''}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.address?.city || ''}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>
            </div>

            {/* Column 3: Additional Info & Financial */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Additional & Financial</h3>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  placeholder="e.g., Lesotho"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Monthly Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (employee ? 'Update Employee' : 'Create Employee')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
