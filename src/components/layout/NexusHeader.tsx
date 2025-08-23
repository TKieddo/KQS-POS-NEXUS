import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, Building2, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useBranch } from '@/context/BranchContext'
import { supabase } from '@/lib/supabase'

interface NexusHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  backUrl?: string
  showHome?: boolean
}

export function NexusHeader({ 
  title, 
  subtitle, 
  showBack = true, 
  backUrl = '/nexus', 
  showHome = true 
}: NexusHeaderProps) {
  const router = useRouter()
  const { selectedBranch, setSelectedBranch } = useBranch()
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([])
  const [showBranchDropdown, setShowBranchDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('id, name')
          .eq('is_active', true)
          .order('name')
        
        if (error) throw error
        setBranches(data || [])
      } catch (error) {
        console.error('Error fetching branches:', error)
      }
    }

    fetchBranches()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBranchDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl)
    } else {
      router.back()
    }
  }

  const handleHome = () => {
    router.push('/nexus')
  }

  const handleBranchSelect = (branch: { id: string; name: string }) => {
    setSelectedBranch(branch)
    setShowBranchDropdown(false)
  }

  return (
    <div className="flex items-center justify-between bg-black rounded-3xl p-4 shadow-2xl mb-6">
      <div className="flex items-center space-x-4">
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-white hover:bg-white/10 border-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="text-gray-300 text-sm mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Branch Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowBranchDropdown(!showBranchDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors text-white"
          >
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-medium">
              {selectedBranch?.name || 'Select Branch'}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {showBranchDropdown && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                    selectedBranch?.id === branch.id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                  }`}
                >
                  <div className="font-medium">{branch.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {showHome && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHome}
            className="text-white hover:bg-white/10 border-white/20"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        )}
      </div>
    </div>
  )
}
