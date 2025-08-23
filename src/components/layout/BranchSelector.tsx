'use client'

import React, { useState } from 'react'
import { ChevronDown, Store, Building2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBranch } from '@/context/BranchContext'
import { toast } from 'sonner'

interface BranchSelectorProps {
  variant?: 'default' | 'pos' | 'admin'
  onBranchChange?: (branchId: string) => void
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({ 
  variant = 'default',
  onBranchChange 
}) => {
  const { selectedBranch, branches, setSelectedBranch, isLoading, isLocked } = useBranch()
  const [isOpen, setIsOpen] = useState(false)

  const handleBranchSelect = (branch: any) => {
    setSelectedBranch(branch)
    setIsOpen(false)
    
    if (onBranchChange) {
      onBranchChange(branch.id)
    }
    
    toast.success(`Switched to ${branch.name}`)
  }

  const getBranchIcon = (branchName: string) => {
    if (branchName.toLowerCase().includes('main')) return <Store className="h-4 w-4" />
    if (branchName.toLowerCase().includes('central')) return <Building2 className="h-4 w-4" />
    return <Store className="h-4 w-4" />
  }

  const getBranchBadge = (branch: any) => {
    if (variant === 'pos') {
      return (
        <div className="flex items-center space-x-2">
          {getBranchIcon(branch.name)}
          <span className="font-medium">{branch.name}</span>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            POS Active
          </span>
        </div>
      )
    }
    
    return (
      <div className="flex items-center space-x-2">
        {getBranchIcon(branch.name)}
        <span className="font-medium">{branch.name}</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
        <div className="animate-pulse h-4 w-4 bg-gray-300 rounded"></div>
        <div className="animate-pulse h-4 w-20 bg-gray-300 rounded"></div>
      </div>
    )
  }

  if (!selectedBranch) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
        <Shield className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-600">No branch selected</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => !isLocked && setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[200px] justify-between"
        disabled={isLocked}
      >
        {getBranchBadge(selectedBranch)}
        {!isLocked && <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">
              Select Branch
            </div>
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => handleBranchSelect(branch)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-colors ${
                  selectedBranch?.id === branch.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {getBranchIcon(branch.name)}
                  <span className="font-medium">{branch.name}</span>
                </div>
                {selectedBranch?.id === branch.id && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 