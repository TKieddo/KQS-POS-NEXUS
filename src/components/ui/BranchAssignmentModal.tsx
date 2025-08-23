import React, { useState, useEffect } from 'react'
import { Building2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { autoAssignUserToBranch, getFirstAvailableBranch } from '@/lib/branch-utils'

interface Branch {
  id: string
  name: string
  is_active: boolean
}

interface BranchAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const BranchAssignmentModal: React.FC<BranchAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Load available branches
  useEffect(() => {
    if (isOpen) {
      loadBranches()
    }
  }, [isOpen])

  const loadBranches = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, is_active')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setBranches(data || [])
    } catch (err) {
      console.error('Error loading branches:', err)
      setError('Failed to load available branches')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutoAssign = async () => {
    setIsAssigning(true)
    setError(null)
    setSuccess(null)
    
    try {
      const result = await autoAssignUserToBranch()
      
      if (result.success) {
        setSuccess('Successfully assigned to branch')
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      } else {
        setError(result.error || 'Failed to assign to branch')
      }
    } catch (err) {
      console.error('Error auto-assigning to branch:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleManualAssign = async (branchId: string) => {
    setIsAssigning(true)
    setError(null)
    setSuccess(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('users')
        .update({ branch_id: branchId })
        .eq('id', user.id)

      if (error) throw error

      const branch = branches.find(b => b.id === branchId)
      setSuccess(`Successfully assigned to ${branch?.name}`)
      
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    } catch (err) {
      console.error('Error assigning to branch:', err)
      setError('Failed to assign to selected branch')
    } finally {
      setIsAssigning(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-full">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Branch Assignment Required</h2>
            <p className="text-sm text-gray-600">
              You need to be assigned to a branch to access printing settings.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29] mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading branches...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Available Branches:</h3>
              <div className="space-y-2">
                {branches.map((branch) => (
                  <Button
                    key={branch.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleManualAssign(branch.id)}
                    disabled={isAssigning}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    {branch.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <Button
                onClick={handleAutoAssign}
                disabled={isAssigning || branches.length === 0}
                className="w-full"
              >
                {isAssigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Auto-Assign to First Branch
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isAssigning}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
} 