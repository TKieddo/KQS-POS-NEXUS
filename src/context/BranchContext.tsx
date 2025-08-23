'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Branch, BranchContextType, BranchViewMode } from '@/types/branches'

// Central Warehouse ID constant
const CENTRAL_WAREHOUSE_ID = '00000000-0000-0000-0000-000000000001'

const BranchContext = createContext<BranchContextType | undefined>(undefined)

export const useBranch = () => {
  const context = useContext(BranchContext)
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider')
  }
  return context
}

interface BranchProviderProps {
  children: React.ReactNode
}

export const BranchProvider = ({ children }: BranchProviderProps) => {
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [viewMode, setViewMode] = useState<BranchViewMode>('central')
  const [isLoading, setIsLoading] = useState(true)
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const BRANCHES_CACHE_KEY = 'branches.cache.v1'
  const BRANCHES_CACHE_TTL_MS = 5 * 60 * 1000

  const readCache = (): { items: Branch[]; ts: number } | null => {
    try {
      if (typeof window === 'undefined') return null
      const raw = localStorage.getItem(BRANCHES_CACHE_KEY)
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  const writeCache = (items: Branch[]) => {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(BRANCHES_CACHE_KEY, JSON.stringify({ items, ts: Date.now() }))
    } catch {}
  }

  const fetchBranches = async () => {
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('id,name,address,phone,email,is_active,created_at,updated_at')
          .eq('is_active', true)
          .order('name')

        if (error) throw error
        const rows = data || []

        const centralWarehouse = rows.find((branch: any) => branch.id === CENTRAL_WAREHOUSE_ID)
        const otherBranches = rows.filter((branch: any) => branch.id !== CENTRAL_WAREHOUSE_ID)

        const allBranches = centralWarehouse ? [centralWarehouse, ...otherBranches] : otherBranches
        setBranches(allBranches)
        writeCache(allBranches)

        if (!selectedBranch) {
          setSelectedBranch(centralWarehouse || allBranches[0] || null)
        }
        setError(null)
      } catch (error: any) {
        console.error('Error fetching branches:', error)
        // Do not insert demo/mock data; leave branches empty on failure
        setBranches([])
        setSelectedBranch(null)
        setError(error?.message || 'Failed to load branches')
      } finally {
        setIsLoading(false)
      }
  }

  // Fetch branches on mount with local cache hydration
  useEffect(() => {
    const cached = readCache()
    if (cached && Date.now() - cached.ts < BRANCHES_CACHE_TTL_MS) {
      const cachedItems = cached.items || []
      if (cachedItems.length > 0) {
        setBranches(cachedItems)
        if (!selectedBranch) {
          const central = cachedItems.find((b: any) => b.id === CENTRAL_WAREHOUSE_ID) || null
          setSelectedBranch(central || cachedItems[0] || null)
        }
        setIsLoading(false)
      }
    }
    fetchBranches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Lock helpers
  useEffect(() => {
    // Restore selection/lock for POS sessions
    try {
      const isPOSRoute = typeof window !== 'undefined' && window.location?.pathname?.startsWith('/pos')
      if (!isPOSRoute) return
      const stored = typeof window !== 'undefined' ? localStorage.getItem('pos.branch.lock') : null
      if (stored) {
        const { branchId } = JSON.parse(stored)
        const found = branches.find(b => b.id === branchId)
        if (found) {
          setSelectedBranch(found)
          setIsLocked(true)
        }
      }
    } catch {}
  }, [branches])

  const lockBranchSelection = (branchId: string) => {
    const found = branches.find(b => b.id === branchId) || null
    setSelectedBranch(found)
    setIsLocked(true)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pos.branch.lock', JSON.stringify({ branchId }))
      }
    } catch {}
  }

  const unlockBranchSelection = () => {
    setIsLocked(false)
    setSelectedBranch(null)
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pos.branch.lock')
      }
    } catch {}
  }

  const value: BranchContextType = {
    selectedBranch,
    branches,
    viewMode,
    setSelectedBranch,
    setViewMode,
    isLoading,
    isLocked,
    lockBranchSelection,
    unlockBranchSelection,
    error,
    reloadBranches: () => { setIsLoading(true); fetchBranches() }
  }

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  )
} 