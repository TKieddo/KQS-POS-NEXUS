import { supabase } from './supabase'

export interface PosPublicUser {
  id: string
  username: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
  branches?: { id: string; name: string }[]
}

export async function listPosUsers(): Promise<PosPublicUser[]> {
  const res = await fetch('/api/admin/pos-users', { cache: 'no-store' })
  if (!res.ok) return []
  const json = await res.json()
  return (json?.data || []) as PosPublicUser[]
}

export async function getPosUserBranches(_userId: string): Promise<{ id: string; name: string }[]> { return [] }

export async function createPosUser(args: { username: string; pin: string; role?: string; branchIds?: string[] }): Promise<{ ok: boolean; id?: string; error?: string }> {
  const res = await fetch('/api/admin/pos-users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  let json: any = null
  try { json = await res.json() } catch {}
  if (!res.ok) return { ok: false, error: json?.error || 'Failed to create user' }
  return { ok: true, id: json?.id }
}

export async function updatePosUserPin(userId: string, newPin: string): Promise<boolean> {
  const res = await fetch(`/api/admin/pos-users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin: newPin }),
  })
  return res.ok
}

export async function setPosUserActive(userId: string, isActive: boolean): Promise<boolean> {
  const res = await fetch(`/api/admin/pos-users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active: isActive }),
  })
  return res.ok
}

export async function deletePosUser(userId: string): Promise<boolean> {
  const res = await fetch(`/api/admin/pos-users/${userId}`, { method: 'DELETE' })
  return res.ok
}

export async function assignPosUserToBranches(_userId: string, _branchIds: string[]): Promise<boolean> { return false }

export async function replacePosUserBranches(userId: string, branchIds: string[]): Promise<boolean> {
  const res = await fetch(`/api/admin/pos-users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ branchIds }),
  })
  return res.ok
}


