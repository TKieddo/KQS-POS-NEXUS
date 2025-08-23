import type { Branch as SupabaseBranch } from '@/lib/supabase'

export type Branch = SupabaseBranch

export interface CentralStock {
  id: string
  product_id: string
  total_quantity: number
  allocated_quantity: number
  available_quantity: number
  created_at: string
  updated_at: string
}

export interface BranchAllocation {
  id: string
  product_id: string
  branch_id: string
  variant_id?: string
  allocated_quantity: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface StockAllocationRequest {
  productId: string
  branchId: string
  quantity: number
  variantId?: string
  notes?: string
}

export type BranchViewMode = 'central' | 'branch'

export interface BranchContextType {
  selectedBranch: Branch | null
  branches: Branch[]
  viewMode: BranchViewMode
  setSelectedBranch: (branch: Branch | null) => void
  setViewMode: (mode: BranchViewMode) => void
  isLoading: boolean
  isLocked: boolean
  lockBranchSelection: (branchId: string) => void
  unlockBranchSelection: () => void
  error?: string | null
  reloadBranches: () => void
} 