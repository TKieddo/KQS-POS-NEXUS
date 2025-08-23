'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { useBranch } from '@/context/BranchContext'
import { Building2, Store, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export const BranchSelectionLanding: React.FC = () => {
  const { branches, selectedBranch, lockBranchSelection, isLoading, error, reloadBranches, isLocked } = useBranch()
  const [choice, setChoice] = useState<string | null>(selectedBranch?.id ?? null)
  const router = useRouter()

  const isDisabled = useMemo(() => isLoading || branches.length === 0, [isLoading, branches])

  useEffect(() => {
    if (isLocked && selectedBranch) {
      router.replace('/pos')
    }
  }, [isLocked, selectedBranch, router])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center">
          <div className="animate-pulse h-10 w-10 rounded-full bg-[hsl(var(--muted))] mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading branches…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[hsl(var(--background))]">
      <div className="w-full max-w-2xl rounded-2xl shadow-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center">
            <Building2 className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[hsl(var(--primary))]">Select Branch</h1>
            <p className="text-sm text-muted-foreground">Choose the branch to operate this POS session.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm text-[hsl(var(--primary))]">
            Failed to load branches: {error}
            <div className="mt-2">
              <Button size="sm" onClick={reloadBranches}>Retry</Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => setChoice(b.id)}
              className={`text-left rounded-xl border p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] ${
                choice === b.id
                  ? 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--primary))]'
              }`}
              disabled={isDisabled}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                  <Store className="h-5 w-5 text-current" />
                </div>
                <div>
                  <div className="font-semibold">{b.name}</div>
                  <div className={`text-xs ${choice === b.id ? 'text-[hsl(var(--primary-foreground))]/80' : 'text-muted-foreground'}`}>{b.address || '—'}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-4 w-4" />
            This selection will be locked for this session.
          </div>
          <Button
            disabled={!choice}
            onClick={() => {
              if (!choice) return
              lockBranchSelection(choice)
              router.replace('/pos')
            }}
            className="h-10"
          >
            Continue to POS
          </Button>
        </div>
      </div>
    </div>
  )
}


