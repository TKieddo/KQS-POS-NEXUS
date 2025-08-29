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
  const [isRestoring, setIsRestoring] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const BRANCHES_CACHE_KEY = 'branches.cache.v1'
  const BRANCHES_CACHE_TTL_MS = 5 * 60 * 1000

  // Ensure we're on the client side to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true)
  }, [])

  const readCache = (): { items: Branch[]; ts: number } | null => {
    try {
      if (typeof window === 'undefined' || !isClient) return null
      const raw = localStorage.getItem(BRANCHES_CACHE_KEY)
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  const writeCache = (items: Branch[]) => {
    try {
      if (typeof window === 'undefined' || !isClient) return
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

      // Only set default branch if no branch is currently selected AND no POS session exists
      if (!selectedBranch) {
        // Check for POS authentication session first
        try {
          if (typeof window !== 'undefined') {
            const posAuthStored = localStorage.getItem('pos.auth.session')
            if (posAuthStored) {
              const posSession = JSON.parse(posAuthStored)
              const now = Date.now()
              const POS_AUTH_TTL = 24 * 60 * 60 * 1000 // 24 hours
              
              // If POS session is valid, find and set that branch
              if ((now - posSession.timestamp) <= POS_AUTH_TTL && posSession.branchId) {
                const posBranch = allBranches.find((b: any) => b.id === posSession.branchId)
                if (posBranch) {
                  // Debug logging removed for production
                  setSelectedBranch(posBranch)
                  setIsLocked(true)
                  return
                }
              }
            }
          }
        } catch (error) {
          console.error('Error checking POS session:', error)
        }
        
        // If no valid POS session, set Central Warehouse as default
        // Debug logging removed for production
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
    // Only run cache restoration on client side
    if (!isClient) {
      fetchBranches()
      return
    }
    
    const cached = readCache()
    if (cached && Date.now() - cached.ts < BRANCHES_CACHE_TTL_MS) {
      const cachedItems = cached.items || []
      if (cachedItems.length > 0) {
        setBranches(cachedItems)
        if (!selectedBranch) {
          // Check for POS authentication session first
          try {
            if (typeof window !== 'undefined') {
              const posAuthStored = localStorage.getItem('pos.auth.session')
              if (posAuthStored) {
                const posSession = JSON.parse(posAuthStored)
                const now = Date.now()
                const POS_AUTH_TTL = 24 * 60 * 60 * 1000 // 24 hours
                
                // If POS session is valid, find and set that branch
                if ((now - posSession.timestamp) <= POS_AUTH_TTL && posSession.branchId) {
                  const posBranch = cachedItems.find((b: any) => b.id === posSession.branchId)
                  if (posBranch) {
                    // Debug logging removed for production
                    setSelectedBranch(posBranch)
                    setIsLocked(true)
                    return
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error checking POS session in cache:', error)
          }
          
          // If no valid POS session, set Central Warehouse as default
          const central = cachedItems.find((b: any) => b.id === CENTRAL_WAREHOUSE_ID) || null
          // Debug logging removed for production
          setSelectedBranch(central || cachedItems[0] || null)
        }
        setIsLoading(false)
      }
    }
    fetchBranches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient])

  // Lock helpers
  useEffect(() => {
    // Only run on client side to avoid hydration mismatches
    if (!isClient) return
    
    // Restore selection/lock for POS sessions
    try {
      const isPOSRoute = typeof window !== 'undefined' && window.location?.pathname?.startsWith('/pos')
      if (!isPOSRoute) return
      
      setIsRestoring(true)
      // Debug logging removed for production
      
      // First check for branch lock
      const stored = typeof window !== 'undefined' ? localStorage.getItem('pos.branch.lock') : null
      if (stored) {
        const { branchId } = JSON.parse(stored)
        const found = branches.find(b => b.id === branchId)
        if (found) {
          setSelectedBranch(found)
          setIsLocked(true)
          // Debug logging removed for production
          setIsRestoring(false)
          return
        }
      }
      
      // If no branch lock found, check for POS auth session and restore branch
      const posAuthStored = typeof window !== 'undefined' ? localStorage.getItem('pos.auth.session') : null
      if (posAuthStored) {
        const posSession = JSON.parse(posAuthStored)
        if (posSession.branchId) {
          const found = branches.find(b => b.id === posSession.branchId)
          if (found) {
            setSelectedBranch(found)
            setIsLocked(true)
            // Debug logging removed for production
            setIsRestoring(false)
            return
          }
        }
      }
      
      // Debug logging removed for production
      setIsRestoring(false)
    } catch (error) {
      console.error('Error restoring branch selection:', error)
      setIsRestoring(false)
    }
  }, [branches, isClient])

  const lockBranchSelection = (branchId: string) => {
    const found = branches.find(b => b.id === branchId) || null
    setSelectedBranch(found)
    setIsLocked(true)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pos.branch.lock', JSON.stringify({ branchId }))
        
        // Also update POS auth session if it exists
        const posAuthStored = localStorage.getItem('pos.auth.session')
        if (posAuthStored) {
          const posSession = JSON.parse(posAuthStored)
          posSession.branchId = branchId
          posSession.timestamp = Date.now() // Update timestamp
          localStorage.setItem('pos.auth.session', JSON.stringify(posSession))
          console.log('POS auth session updated with branch ID:', branchId)
        }
      }
    } catch (error) {
      console.error('Error saving branch lock:', error)
    }
  }

  const unlockBranchSelection = () => {
    setIsLocked(false)
    setSelectedBranch(null)
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pos.branch.lock')
        
        // Also clear POS auth session when unlocking
        localStorage.removeItem('pos.auth.session')
        console.log('Branch unlocked and POS auth session cleared')
      }
    } catch (error) {
      console.error('Error clearing branch lock:', error)
    }
  }

  const value: BranchContextType = {
    selectedBranch,
    branches,
    viewMode,
    setSelectedBranch,
    setViewMode,
    isLoading: isLoading || isRestoring,
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