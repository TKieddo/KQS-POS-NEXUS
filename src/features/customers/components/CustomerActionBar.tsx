import { 
  Plus, 
  Download, 
  Upload, 
  CreditCard, 
  Crown, 
  FileText, 
  Users, 
  Mail,
  Phone,
  Calendar,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CustomerActionBarProps {
  onAddCustomer: () => void
  onImportCustomers: () => void
  onExportCustomers: () => void
  onGenerateStatements: () => void
  onSendBulkEmail: () => void
  onSendBulkSMS: () => void
  onManageCreditAccounts: () => void
  onManageLoyaltyProgram: () => void
  onViewReports: () => void
  onBulkDelete?: () => void
  selectedCount: number
}

export const CustomerActionBar = ({
  onAddCustomer,
  onImportCustomers,
  onExportCustomers,
  onGenerateStatements,
  onSendBulkEmail,
  onSendBulkSMS,
  onManageCreditAccounts,
  onManageLoyaltyProgram,
  onViewReports,
  onBulkDelete,
  selectedCount
}: CustomerActionBarProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Primary Actions */}
        <div className="flex items-center space-x-3">
          <Button 
            onClick={onAddCustomer}
            className="bg-[#E5FF29] text-black font-semibold hover:bg-[#e5ff29]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
          
          <Button variant="outline" onClick={onImportCustomers}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          
          <Button variant="outline" onClick={onExportCustomers}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onGenerateStatements}>
            <FileText className="mr-2 h-4 w-4" />
            Statements
          </Button>
          
          <Button variant="outline" size="sm" onClick={onManageCreditAccounts}>
            <CreditCard className="mr-2 h-4 w-4" />
            Credit
          </Button>
          
          <Button variant="outline" size="sm" onClick={onManageLoyaltyProgram}>
            <Crown className="mr-2 h-4 w-4" />
            Loyalty
          </Button>
          
          <Button variant="outline" size="sm" onClick={onViewReports}>
            <Users className="mr-2 h-4 w-4" />
            Reports
          </Button>
        </div>
      </div>

      {/* Bulk Actions (when customers are selected) */}
      {selectedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {selectedCount} customer{selectedCount !== 1 ? 's' : ''} selected
            </span>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={onSendBulkEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              
              <Button variant="outline" size="sm" onClick={onSendBulkSMS}>
                <Phone className="mr-2 h-4 w-4" />
                Send SMS
              </Button>
              
              <Button variant="outline" size="sm" onClick={onGenerateStatements}>
                <Calendar className="mr-2 h-4 w-4" />
                Generate Statements
              </Button>
              
              {onBulkDelete && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={onBulkDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 