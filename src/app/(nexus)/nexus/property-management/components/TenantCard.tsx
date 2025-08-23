import React from 'react'
import { User, Mail, Phone, Calendar, CreditCard, AlertTriangle, Eye, Edit, MoreHorizontal, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Tenant } from '../types/property'

interface TenantCardProps {
  tenant: Tenant
  onViewDetails: (tenantId: string) => void
  onEdit: (tenantId: string) => void
  onSendEmail: (tenantId: string) => void
  onCall: (tenantId: string) => void
  onRecordPayment: (tenantId: string) => void
  onViewDocuments: (tenantId: string) => void
  onViewPayments: (tenantId: string) => void
}

const TenantCard: React.FC<TenantCardProps> = ({
  tenant,
  onViewDetails,
  onEdit,
  onSendEmail,
  onCall,
  onRecordPayment,
  onViewDocuments,
  onViewPayments
}) => {
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'partial': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysOverdue = () => {
    const dueDate = new Date(tenant.due_date)
    const today = new Date()
    const diffTime = today.getTime() - dueDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isOverdue = tenant.payment_status === 'overdue'
  const daysOverdue = getDaysOverdue()

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${
      isOverdue ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(tenant.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                {tenant.name}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Unit {tenant.unit_number}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(tenant.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(tenant.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Tenant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewPayments(tenant.id)}>
                <CreditCard className="h-4 w-4 mr-2" />
                View Payments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewDocuments(tenant.id)}>
                <FileText className="h-4 w-4 mr-2" />
                View Documents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRecordPayment(tenant.id)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              Email
            </p>
            <p className="text-sm font-medium text-gray-900 truncate">{tenant.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Phone
            </p>
            <p className="text-sm font-medium text-gray-900">{tenant.phone}</p>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Monthly Rent</p>
              <p className="text-lg font-semibold text-gray-900">
                ${tenant.rent_amount.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <Badge className={getPaymentStatusColor(tenant.payment_status)}>
                {tenant.payment_status.charAt(0).toUpperCase() + tenant.payment_status.slice(1)}
              </Badge>
              {isOverdue && (
                <p className="text-xs text-red-600 mt-1">
                  {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Due Date
            </span>
            <span>{new Date(tenant.due_date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Lease Information */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Lease Start</p>
            <p className="text-sm font-medium">
              {new Date(tenant.lease_start_date).toLocaleDateString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Lease End</p>
            <p className="text-sm font-medium">
              {new Date(tenant.lease_end_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Emergency Contact */}
        {tenant.emergency_contact && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 mb-1">Emergency Contact</p>
            <div className="text-sm">
              <p className="font-medium">{tenant.emergency_contact.name}</p>
              <p className="text-gray-600">{tenant.emergency_contact.phone}</p>
              <p className="text-gray-500 text-xs">{tenant.emergency_contact.relationship}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            {isOverdue && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Overdue
              </Badge>
            )}
            {tenant.documents.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {tenant.documents.length} docs
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSendEmail(tenant.id)}
              className="text-xs"
            >
              <Mail className="h-3 w-3 mr-1" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCall(tenant.id)}
              className="text-xs"
            >
              <Phone className="h-3 w-3 mr-1" />
              Call
            </Button>
            <Button
              size="sm"
              onClick={() => onRecordPayment(tenant.id)}
              className="text-xs"
            >
              <CreditCard className="h-3 w-3 mr-1" />
              Payment
            </Button>
          </div>
        </div>

        {/* Notes */}
        {tenant.notes && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-700 line-clamp-2">{tenant.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TenantCard
